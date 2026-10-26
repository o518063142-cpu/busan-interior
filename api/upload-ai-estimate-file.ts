import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";

const MAX_FILE_BYTES = 600 * 1024;
const MAX_BASE64_LENGTH = 850_000;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function clean(value: unknown, maxLength = 200) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "POST 요청만 지원합니다." });
  }

  try {
    const sessionId = clean(req.body?.sessionId, 100);
    const kind = clean(req.body?.kind, 30);
    const name = clean(req.body?.name, 120) || "첨부파일";
    const mimeType = clean(req.body?.mimeType, 100);
    const dataBase64 = clean(req.body?.dataBase64, MAX_BASE64_LENGTH);

    if (!/^s_[A-Za-z0-9_-]{8,100}$/.test(sessionId)) {
      return res.status(400).json({ success: false, error: "유효한 업로드 세션이 필요합니다." });
    }
    if (kind !== "photo" && kind !== "floorplan") {
      return res.status(400).json({ success: false, error: "파일 종류가 올바르지 않습니다." });
    }
    if (!ALLOWED_TYPES.has(mimeType)) {
      return res.status(415).json({ success: false, error: "JPG, PNG, WEBP 또는 PDF 파일만 업로드할 수 있습니다." });
    }
    if (!dataBase64) {
      return res.status(400).json({ success: false, error: "파일 데이터가 비어 있습니다." });
    }

    const buffer = Buffer.from(dataBase64, "base64");
    if (!buffer.length || buffer.length > MAX_FILE_BYTES) {
      return res.status(413).json({
        success: false,
        error: "AI 분석용 첨부자료는 파일당 600KB 이하로 준비해 주세요.",
      });
    }

    const db = await getFirestoreAdmin();
    if (!db) {
      return res.status(503).json({ success: false, error: "첨부자료 저장 연결이 설정되지 않았습니다." });
    }

    const expiresAt = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const docRef = await db.collection("aiEstimateUploads").add({
      sessionId,
      kind,
      name,
      mimeType,
      size: buffer.length,
      dataBase64,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
    });

    return res.status(200).json({
      success: true,
      file: {
        ref: docRef.id,
        name,
        mimeType,
        size: buffer.length,
        kind,
      },
    });
  } catch (error: any) {
    console.error("AI estimate file upload error:", error?.message || error);
    return res.status(500).json({ success: false, error: "첨부자료 저장 중 오류가 발생했습니다." });
  }
}
