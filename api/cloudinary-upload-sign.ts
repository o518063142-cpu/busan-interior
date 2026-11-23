import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin";

/**
 * Issues a short-lived Cloudinary signed-upload signature.
 * NEVER ship CLOUDINARY_API_SECRET to the browser.
 * Only approved Firebase Auth UIDs can obtain upload signatures.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const allowedUids = new Set((process.env.CLOUDINARY_UPLOAD_ADMIN_UIDS || "").split(",").map((value) => value.trim()).filter(Boolean));
  if (!cloudName || !apiKey || !apiSecret || allowedUids.size === 0) {
    return res.status(503).json({ error: "사진 저장소 연결 설정이 아직 완료되지 않았습니다." });
  }

  const authorization = req.headers.authorization || "";
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!idToken) return res.status(401).json({ error: "관리자 로그인이 필요합니다." });

  try {
    // Reuse the initialized Firebase Admin service credentials.
    if (!await getFirestoreAdmin()) {
      return res.status(503).json({ error: "서버 관리자 인증 설정이 필요합니다." });
    }
    const user = await getAuth().verifyIdToken(idToken, true);
    if (!allowedUids.has(user.uid)) {
      return res.status(403).json({ error: "사진 업로드 권한이 없습니다." });
    }
  } catch {
    return res.status(401).json({ error: "관리자 인증을 다시 진행해 주세요." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  const projectId = String(body.projectId || "");
  const kind = String(body.kind || "");
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(projectId) || !["before", "process", "after"].includes(kind)) {
    return res.status(400).json({ error: "허용되지 않은 사진 저장 경로입니다." });
  }

  const folder = `gene-interior/projects/${projectId}/${kind}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");
  return res.status(200).json({ cloudName, apiKey, folder, timestamp, signature });
}
