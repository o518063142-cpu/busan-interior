import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "ai_estimate_generate",
  "ai_estimate_consultation_click",
  "consultation_submitted",
]);

function clean(value: unknown, maxLength = 300) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "POST 요청만 지원합니다." });
  }

  if (process.env.VERCEL_ENV === "preview") {
    return res.status(200).json({ success: true, skipped: true, reason: "preview" });
  }

  try {
    const eventName = clean(req.body?.eventName, 80);
    if (!ALLOWED_EVENTS.has(eventName)) {
      return res.status(400).json({ success: false, error: "허용되지 않은 이벤트입니다." });
    }

    const sessionId = clean(req.body?.sessionId, 100);
    if (!sessionId) {
      return res.status(400).json({ success: false, error: "세션 식별자가 필요합니다." });
    }

    const db = await getFirestoreAdmin();
    if (!db) {
      // Tracking must never break the customer's main flow.
      return res.status(200).json({ success: false, skipped: true });
    }

    const payload = {
      eventName,
      path: clean(req.body?.path, 250),
      source: clean(req.body?.source, 120) || "website",
      sessionId,
      utmSource: clean(req.body?.utmSource, 120),
      utmMedium: clean(req.body?.utmMedium, 120),
      utmCampaign: clean(req.body?.utmCampaign, 160),
      referrer: clean(req.body?.referrer, 300),
      createdAt: FieldValue.serverTimestamp(),
    };

    await db.collection("conversionEvents").add(payload);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Conversion tracking error:", error?.message || error);
    // Analytics failure should not surface as a customer-facing error.
    return res.status(200).json({ success: false, skipped: true });
  }
}
