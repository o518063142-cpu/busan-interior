import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";

const MAX_FILE_BYTES = 600 * 1024;
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
    // Keep original value if decoding fails.
  }
  return (decoded.replace(/[\\/]/g, "-").replace(/[^0-9A-Za-z가-힣._ -]/g, "").trim() || "첨부파일").slice(0, 120);
}

async function readBody(req: VercelRequest) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body, "binary");

  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += part.length;
    if (total > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");
    chunks.push(part);
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
  const mimeType = cleanHeader(req.headers["content-type"], 100).split(";")[0];
  const name = safeFileName(cleanHeader(req.headers["x-file-name"], 300));

  if (!/^s_[A-Za-z0-9_-]{8,100}$/.test(sessionId)) {
    return res.status(400).json({ success: false, error: "유효한 업로드 세션이 필요합니다." });
  }
  if (kind !== "photo" && kind !== "floorplan") {
    return res.status(400).json({ success: false, error: "파일 종류가 올바르지 않습니다." });
  }
  if (!ALLOWED_TYPES.has(mimeType)) {
    return res.status(415).json({ success: false, error: "JPG, PNG, WEBP 또는 PDF 파일만 업로드할 수 있습니다." });
  }

  const declaredLength = Number(cleanHeader(req.headers["content-length"], 30));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FILE_BYTES) {
    return res.status(413).json({ success: false, error: "AI 분석용 첨부자료는 파일당 600KB 이하로 준비해 주세요." });
  }

  try {
    const buffer = await readBody(req);
    if (!buffer.length) {
      return res.status(400).json({ success: false, error: "빈 파일은 업로드할 수 없습니다." });
    }
    if (buffer.length > MAX_FILE_BYTES) throw new Error("FILE_TOO_LARGE");

    const db = await getFirestoreAdmin();
    if (!db) {
      return res.status(503).json({ success: false, error: "첨부자료 저장 연결이 설정되지 않았습니다." });
    }

    const docRef = await db.collection("aiEstimateUploads").add({
      sessionId,
      kind,
      name,
      mimeType,
      size: buffer.length,
      dataBase64: buffer.toString("base64"),
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      file: {
        ref: docRef.id,
        path: docRef.id,
        name,
        mimeType,
        size: buffer.length,
        kind,
      },
    });
  } catch (error: any) {
    if (error?.message === "FILE_TOO_LARGE") {
      return res.status(413).json({ success: false, error: "AI 분석용 첨부자료는 파일당 600KB 이하로 준비해 주세요." });
    }
    console.error("AI estimate file upload error:", error?.message || error);
    return res.status(500).json({ success: false, error: "첨부자료 저장 중 오류가 발생했습니다." });
  }
}
