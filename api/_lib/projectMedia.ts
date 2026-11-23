import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";
import { getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "./firebaseAdmin.js";

type Kind = "after" | "before" | "process";
const PROJECT_ID = /^[A-Za-z0-9_-]{8,128}$/;
const KINDS = new Set<Kind>(["after", "before", "process"]);

const signatureFor = (fields: Record<string, string>, secret: string) =>
  createHash("sha1")
    .update(
      Object.entries(fields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&") + secret
    )
    .digest("hex");

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudName) || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

// Only photos already recorded on the exact Firestore project may be destroyed.
function projectCloudinaryId(urlString: string, cloudName: string, projectId: string) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com") return null;
    const prefix = `/${cloudName}/image/upload/`;
    if (!url.pathname.startsWith(prefix)) return null;
    const path = decodeURIComponent(url.pathname.slice(prefix.length))
      .replace(/^v\d+\//, "");
    const id = path.replace(/\.[^.\/]+$/, "");
    return id.startsWith(`gene-interior/projects/${projectId}/`) ? id : null;
  } catch {
    return null;
  }
}

export async function handleProjectMedia(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const config = getCloudinaryConfig();
  if (!config) return res.status(503).json({ error: "무료 사진 저장소가 아직 연결되지 않았습니다. 관리자 설정을 확인해주세요." });

  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) return res.status(401).json({ error: "관리자 로그인이 필요합니다." });

  const db = await getFirestoreAdmin();
  if (!db || getApps().length === 0) return res.status(503).json({ error: "관리자 인증 서버 설정을 확인해주세요." });
  try {
    await getAuth(getApps()[0]).verifyIdToken(authorization.slice(7));
  } catch {
    return res.status(403).json({ error: "관리자 인증이 유효하지 않습니다." });
  }

  const { projectId, kind, action } = req.body || {};
  if (typeof projectId !== "string" || !PROJECT_ID.test(projectId)) {
    return res.status(400).json({ error: "잘못된 프로젝트 번호입니다." });
  }

  if (action === "sign-upload") {
    if (!KINDS.has(kind as Kind)) return res.status(400).json({ error: "잘못된 이미지 분류입니다." });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const folder = `gene-interior/projects/${projectId}/${kind}`;
    const params = { folder, timestamp };
    return res.status(200).json({
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      timestamp,
      folder,
      signature: signatureFor(params, config.apiSecret),
    });
  }

  if (action === "delete-project-media") {
    const snapshot = await db.collection("projects").doc(projectId).get();
    if (!snapshot.exists) return res.status(404).json({ error: "삭제 대상 프로젝트를 찾지 못했습니다." });
    const project = snapshot.data() || {};
    const urls: string[] = [
      ...(Array.isArray(project.afterImages) ? project.afterImages : []),
      project.beforeImage,
      project.inProgressImage,
    ].filter((item): item is string => typeof item === "string");
    const publicIds = Array.from(new Set(urls
      .map((url) => projectCloudinaryId(url, config.cloudName, projectId))
      .filter((id): id is string => Boolean(id))));
    for (const publicId of publicIds) {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const fields = { public_id: publicId, timestamp };
      const body = new URLSearchParams({
        ...fields,
        api_key: config.apiKey,
        signature: signatureFor(fields, config.apiSecret),
        invalidate: "true",
      });
      // invalidate must be part of the signed string as well.
      body.set("signature", signatureFor({ ...fields, invalidate: "true" }, config.apiSecret));
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
        { method: "POST", body }
      );
      if (!response.ok) return res.status(502).json({ error: "사진 삭제 요청 중 오류가 발생했습니다." });
      const data = (await response.json()) as { result?: string };
      if (data.result !== "ok" && data.result !== "not found")
        return res.status(502).json({ error: "저장소 사진 삭제가 완료되지 않았습니다." });
    }
    return res.status(200).json({ success: true, deleted: publicIds.length });
  }

  return res.status(400).json({ error: "지원하지 않는 요청입니다." });
}
