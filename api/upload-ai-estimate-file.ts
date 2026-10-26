import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "node:crypto";
import { getFirebaseAdminApp } from "./_lib/firebaseAdmin.js";

const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function cleanHeader(value: string | string[] | undefined, maxLength = 200) {
  const raw = Array.isArray(value) ? value[0] : value || "";
  return raw.trim().slice(0, maxLength);
}

function safeFileName(value: string) {
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original header value if decoding fails.
  }

  const normalized = decoded
    .replace(/[\\/]/g, "-")
    .replace(/[^0-9A-Za-z가-힣._ -]/g, "")
    .trim();

  return (normalized || "upload").slice(0, 120);
}

async function readBody(req: VercelRequest) {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_FILE_BYTES) {
      throw new Error("FILE_TOO_LARGE");
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "POST 요청만 지원합니다." });
  }

  const sessionId = cleanHeader(req.headers["x-session-id"], 100);
  const kind = cleanHeader(req.headers["x-file-kind"], 30);
  const contentType = cleanHeader(req.headers["content-type"], 100).split(";")[0];
  const originalName = safeFileName(cleanHeader(req.headers["x-file-name"], 300));

  if (!/^s_[A-Za-z0-9_-]{8,100}$/.test(sessionId)) {
    return res.status(400).json({ success: false, error: "유효한 업로드 세션이 필요합니다." });
  }

  if (kind !== "photo" && kind !== "floorplan") {
    return res.status(400).json({ success: false, error: "파일 종류가 올바르지 않습니다." });
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(415).json({
      success: false,
      error: "JPG, PNG, WEBP 또는 PDF 파일만 업로드할 수 있습니다.",
    });
  }

  const declaredLength = Number(cleanHeader(req.headers["content-length"], 30));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FILE_BYTES) {
    return res.status(413).json({ success: false, error: "파일당 최대 4MB까지 업로드할 수 있습니다." });
  }

  try {
    const body = await readBody(req);
    if (!body.length) {
      return res.status(400).json({ success: false, error: "빈 파일은 업로드할 수 없습니다." });
    }

    const app = await getFirebaseAdminApp();
    if (!app) {
      return res.status(503).json({ success: false, error: "파일 저장소 연결이 설정되지 않았습니다." });
    }

    const extension = originalName.includes(".")
      ? `.${originalName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin"}`
      : "";
    const storagePath = `ai-estimate/${sessionId}/${kind}/${Date.now()}-${randomUUID()}${extension}`;
    const bucket = getStorage(app).bucket();
    const file = bucket.file(storagePath);

    await file.save(body, {
      resumable: false,
      contentType,
      metadata: {
        cacheControl: "private, max-age=0, no-store",
        metadata: {
          originalName,
          uploadSession: sessionId,
          kind,
        },
      },
    });

    return res.status(200).json({
      success: true,
      file: {
        path: storagePath,
        name: originalName,
        mimeType: contentType,
        size: body.length,
        kind,
      },
    });
  } catch (error: any) {
    if (error?.message === "FILE_TOO_LARGE") {
      return res.status(413).json({ success: false, error: "파일당 최대 4MB까지 업로드할 수 있습니다." });
    }

    console.error("AI estimate file upload error:", error?.message || error);
    return res.status(500).json({ success: false, error: "파일 업로드 중 오류가 발생했습니다." });
  }
}
