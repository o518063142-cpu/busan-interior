import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "private, no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "GET 요청만 지원합니다." });
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

    const snap = await db.collection("consultations").orderBy("createdAt", "desc").limit(300).get();
    const leads = snap.docs
      .map((doc) => {
        const data = doc.data() as any;
        const isAiLead = data.source === "ai-estimate" ||
          (typeof data.details === "string" && data.details.includes("AI 예상 비용"));
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
  } catch (error: any) {
    console.error("AI lead inbox error:", error?.message || error);
    return res.status(500).json({ success: false, error: "AI 상담 리드를 불러오지 못했습니다." });
  }
}
