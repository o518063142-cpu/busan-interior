import type { VercelRequest, VercelResponse } from "@vercel/node";

const AI_MARKER = "AI 예상 비용";
const ALLOWED_REF = /^[A-Za-z0-9_-]{8,120}$/;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function safeName(value: unknown) {
  return (typeof value === "string" ? value : "첨부자료")
    .replace(/[\r\n"\\/]/g, "-")
    .slice(0, 120);
}

async function rebuildStoredFile(snap: FirebaseFirestore.DocumentSnapshot) {
  const chunksSnap = await snap.ref.collection("chunks").orderBy("index", "asc").get();
  const buffers = chunksSnap.docs
    .map((doc) => doc.data()?.dataBase64)
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .map((value) => Buffer.from(value, "base64"));
  return Buffer.concat(buffers);
}

export async function handleAiLeadList(
  res: VercelResponse,
  db: FirebaseFirestore.Firestore
) {
  const snap = await db.collection("consultations").orderBy("createdAt", "desc").limit(300).get();
  const leads = snap.docs
    .map((doc) => {
      const data = doc.data() as any;
      const isAiLead = data.source === "ai-estimate" ||
        (typeof data.details === "string" && data.details.includes(AI_MARKER));
      if (!isAiLead) return null;

      const createdAt = data.createdAt?.toDate?.()?.toISOString?.() || null;
      const attachmentPaths = Array.isArray(data.attachmentPaths) ? data.attachmentPaths.slice(0, 5) : [];
      const attachmentNames = Array.isArray(data.attachmentNames) ? data.attachmentNames.slice(0, 5) : [];
      const attachmentKinds = Array.isArray(data.attachmentKinds) ? data.attachmentKinds.slice(0, 5) : [];

      return {
        id: doc.id,
        name: asString(data.name, "이름 없음"),
        phone: asString(data.phone),
        location: asString(data.location),
        spaceType: asString(data.spaceType),
        area: asString(data.area),
        startDate: asString(data.startDate),
        details: asString(data.details),
        status: asString(data.status, "new"),
        source: asString(data.source, "ai-estimate"),
        sessionId: asString(data.sessionId),
        genePlanStatus: asString(data.genePlanStatus),
        createdAt,
        aiEstimateSnapshot: data.aiEstimateSnapshot || null,
        attachments: attachmentPaths.map((ref: string, index: number) => ({
          ref,
          name: asString(attachmentNames[index], `첨부자료 ${index + 1}`),
          kind: attachmentKinds[index] === "floorplan" ? "floorplan" : "photo",
        })),
      };
    })
    .filter(Boolean);

  return res.status(200).json({ success: true, leads });
}

export async function handleAiLeadAttachment(
  req: VercelRequest,
  res: VercelResponse,
  db: FirebaseFirestore.Firestore
) {
  const ref = Array.isArray(req.query.ref) ? req.query.ref[0] : req.query.ref;
  if (!ref || !ALLOWED_REF.test(ref)) {
    return res.status(400).json({ success: false, error: "첨부자료 식별자가 올바르지 않습니다." });
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
}
