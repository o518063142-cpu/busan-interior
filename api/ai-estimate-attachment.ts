import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";

const ALLOWED_REF = /^[A-Za-z0-9_-]{8,120}$/;

async function rebuildStoredFile(snap: FirebaseFirestore.DocumentSnapshot) {
  const data = snap.data() || {};
  const chunksSnap = await snap.ref.collection("chunks").orderBy("index", "asc").get();
  const buffers = chunksSnap.docs
    .map((doc) => doc.data()?.dataBase64)
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => Buffer.from(value, "base64"));
  return Buffer.concat(buffers);
}

function safeName(value: unknown) {
  return (typeof value === "string" ? value : "첨부자료")
    .replace(/[\r\n"\\/]/g, "-")
    .slice(0, 120);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "GET 요청만 지원합니다." });
  }

  const ref = Array.isArray(req.query.ref) ? req.query.ref[0] : req.query.ref;
  if (!ref || !ALLOWED_REF.test(ref)) {
    return res.status(400).json({ success: false, error: "첨부자료 식별자가 올바르지 않습니다." });
  }

  try {
    const db = await getFirestoreAdmin();
    if (!db) {
      return res.status(503).json({ success: false, error: "관리자 데이터 연결이 설정되지 않았습니다." });
    }

    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length).trim()
      : "";
    if (!token) {
      return res.status(401).json({ success: false, error: "관리자 인증이 필요합니다." });
    }

    try {
      await getAuth().verifyIdToken(token);
    } catch {
      return res.status(401).json({ success: false, error: "관리자 인증이 만료되었거나 유효하지 않습니다." });
    }

    const snap = await db.collection("aiEstimateUploads").doc(ref).get();
    if (!snap.exists) {
      return res.status(404).json({ success: false, error: "첨부자료를 찾을 수 없습니다." });
    }

    const data = snap.data() || {};
    const buffer = await rebuildStoredFile(snap);
    if (!buffer.length) {
      return res.status(404).json({ success: false, error: "첨부자료 내용이 비어 있습니다." });
    }

    const mimeType = typeof data.mimeType === "string" ? data.mimeType : "application/octet-stream";
    const fileName = safeName(data.name);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", String(buffer.length));
    res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    return res.status(200).send(buffer);
  } catch (error: any) {
    console.error("AI estimate attachment fetch error:", error?.message || error);
    return res.status(500).json({ success: false, error: "첨부자료를 불러오지 못했습니다." });
  }
}
