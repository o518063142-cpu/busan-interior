import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";
import { handleAiLeadAttachment, handleAiLeadList } from "./_lib/aiLeadAdmin.js";

const AI_MARKER = "AI 예상 비용";

const STATUS_ORDER: Record<string, number> = {
  new: 0,
  contacted: 1,
  site_visit: 2,
  estimate: 3,
  contract: 4,
  completed: 5,
};

function percentage(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function uniqueSessions(events: any[], eventName: string) {
  return new Set(
    events
      .filter((event) => event.eventName === eventName && event.sessionId)
      .map((event) => event.sessionId)
  ).size;
}

function hasReachedStatus(item: any, target: string) {
  const current = STATUS_ORDER[item?.status] ?? -1;
  const targetOrder = STATUS_ORDER[target] ?? Number.MAX_SAFE_INTEGER;
  return current >= targetOrder;
}

function classifyAcquisition(event: any) {
  const utmSource = typeof event?.utmSource === "string" ? event.utmSource.trim().toLowerCase() : "";
  if (utmSource) return utmSource.slice(0, 80);

  const referrer = typeof event?.referrer === "string" ? event.referrer.toLowerCase() : "";
  if (!referrer) return "direct";
  if (referrer.includes("naver.com")) return "naver";
  if (referrer.includes("google.")) return "google";
  if (referrer.includes("daum.net")) return "daum";
  if (referrer.includes("kakao.com")) return "kakao";
  if (referrer.includes("instagram.com")) return "instagram";
  if (referrer.includes("youtube.com") || referrer.includes("youtu.be")) return "youtube";
  if (referrer.includes("facebook.com")) return "facebook";
  if (referrer.includes("bing.com")) return "bing";
  return "referral";
}

function buildFirstPageBySession(events: any[]) {
  const firstPageBySession = new Map<string, any>();

  // Firestore query is newest first. Reverse so the first stored page_view is the
  // earliest page we saw for that session within the retained event window.
  for (const event of [...events].reverse()) {
    if (event?.eventName !== "page_view" || !event?.sessionId) continue;
    if (!firstPageBySession.has(event.sessionId)) {
      firstPageBySession.set(event.sessionId, event);
    }
  }

  return firstPageBySession;
}

function buildLeadPerformance(aiLeads: any[], firstPageBySession: Map<string, any>) {
  type PerformanceRow = {
    source: string;
    leads: number;
    siteVisits: number;
    estimates: number;
    contractOrCompleted: number;
  };

  type LandingRow = {
    path: string;
    leads: number;
    contractOrCompleted: number;
  };

  const sourceMap = new Map<string, PerformanceRow>();
  const landingMap = new Map<string, LandingRow>();

  for (const lead of aiLeads) {
    const firstPage = lead?.sessionId ? firstPageBySession.get(lead.sessionId) : null;
    const source = classifyAcquisition(firstPage);
    const landingPath = typeof firstPage?.path === "string" && firstPage.path ? firstPage.path : "unknown";

    const sourceRow = sourceMap.get(source) || {
      source,
      leads: 0,
      siteVisits: 0,
      estimates: 0,
      contractOrCompleted: 0,
    };
    sourceRow.leads += 1;
    if (hasReachedStatus(lead, "site_visit")) sourceRow.siteVisits += 1;
    if (hasReachedStatus(lead, "estimate")) sourceRow.estimates += 1;
    if (hasReachedStatus(lead, "contract")) sourceRow.contractOrCompleted += 1;
    sourceMap.set(source, sourceRow);

    const landingRow = landingMap.get(landingPath) || {
      path: landingPath,
      leads: 0,
      contractOrCompleted: 0,
    };
    landingRow.leads += 1;
    if (hasReachedStatus(lead, "contract")) landingRow.contractOrCompleted += 1;
    landingMap.set(landingPath, landingRow);
  }

  const sourcePerformance = [...sourceMap.values()]
    .map((row) => ({
      ...row,
      leadToContract: percentage(row.contractOrCompleted, row.leads),
    }))
    .sort((a, b) => b.contractOrCompleted - a.contractOrCompleted || b.leads - a.leads)
    .slice(0, 12);

  const landingPerformance = [...landingMap.values()]
    .map((row) => ({
      ...row,
      leadToContract: percentage(row.contractOrCompleted, row.leads),
    }))
    .sort((a, b) => b.contractOrCompleted - a.contractOrCompleted || b.leads - a.leads)
    .slice(0, 12);

  return { sourcePerformance, landingPerformance };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "GET 요청만 지원합니다." });
  }

  try {
    const db = await getFirestoreAdmin();
    if (!db) {
      return res.status(503).json({
        success: false,
        error: "관리자 데이터 연결이 설정되지 않았습니다.",
      });
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

    const mode = Array.isArray(req.query.mode) ? req.query.mode[0] : req.query.mode;
    if (mode === "leads") {
      return handleAiLeadList(res, db);
    }
    if (mode === "attachment") {
      return handleAiLeadAttachment(req, res, db);
    }

    const [eventsSnap, consultationsSnap] = await Promise.all([
      db.collection("conversionEvents").orderBy("createdAt", "desc").limit(5000).get(),
      db.collection("consultations").orderBy("createdAt", "desc").limit(5000).get(),
    ]);

    const events = eventsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const consultations = consultationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

    const aiPageEvents = events.filter(
      (event: any) => event.eventName === "page_view" && event.path === "/ai-estimate"
    );
    const aiPageSessions = new Set(aiPageEvents.map((event: any) => event.sessionId).filter(Boolean)).size;
    const aiGenerateSessions = uniqueSessions(events, "ai_estimate_generate");
    const aiClickSessions = uniqueSessions(events, "ai_estimate_consultation_click");
    const submittedSessions = new Set(
      events
        .filter((event: any) => event.eventName === "consultation_submitted" && event.source === "ai-estimate")
        .map((event: any) => event.sessionId)
        .filter(Boolean)
    ).size;

    const aiLeads = consultations.filter((item: any) => {
      if (item.source === "ai-estimate") return true;
      return typeof item.details === "string" && item.details.includes(AI_MARKER);
    });

    const statusCount = (items: any[], status: string) =>
      items.filter((item) => item.status === status).length;

    const allContracts = statusCount(consultations, "contract") + statusCount(consultations, "completed");
    const aiContracts = statusCount(aiLeads, "contract") + statusCount(aiLeads, "completed");

    const aiFunnel = {
      pageVisitors: aiPageSessions,
      estimateUsers: aiGenerateSessions,
      consultationClicks: aiClickSessions,
      submittedSessions,
      leads: aiLeads.length,
      contacted: statusCount(aiLeads, "contacted"),
      siteVisits: statusCount(aiLeads, "site_visit"),
      estimates: statusCount(aiLeads, "estimate"),
      contracts: statusCount(aiLeads, "contract"),
      completed: statusCount(aiLeads, "completed"),
      contractOrCompleted: aiContracts,
    };

    const rates = {
      visitorToEstimate: percentage(aiGenerateSessions, aiPageSessions),
      estimateToConsultationClick: percentage(aiClickSessions, aiGenerateSessions),
      estimateToLead: percentage(aiLeads.length, aiGenerateSessions),
      leadToSiteVisit: percentage(statusCount(aiLeads, "site_visit") + statusCount(aiLeads, "estimate") + aiContracts, aiLeads.length),
      leadToContract: percentage(aiContracts, aiLeads.length),
      overallVisitorToContract: percentage(aiContracts, aiPageSessions),
    };

    const sources = new Map<string, number>();
    for (const event of events as any[]) {
      if (event.eventName !== "page_view") continue;
      const source = event.utmSource || classifyAcquisition(event);
      sources.set(source, (sources.get(source) || 0) + 1);
    }

    const topSources = [...sources.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    const firstPageBySession = buildFirstPageBySession(events as any[]);
    const { sourcePerformance, landingPerformance } = buildLeadPerformance(aiLeads, firstPageBySession);

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      trackingNote: "방문·AI 실행·유입채널 수치는 전환 추적 기능 적용 이후 데이터입니다. 유입채널은 AI 상담의 sessionId와 최초 page_view를 연결해 계산합니다.",
      aiFunnel,
      rates,
      allLeads: {
        total: consultations.length,
        siteVisits: statusCount(consultations, "site_visit"),
        estimates: statusCount(consultations, "estimate"),
        contracts: statusCount(consultations, "contract"),
        completed: statusCount(consultations, "completed"),
        contractOrCompleted: allContracts,
        leadToContract: percentage(allContracts, consultations.length),
      },
      topSources,
      sourcePerformance,
      landingPerformance,
    });
  } catch (error: any) {
    console.error("Funnel metrics error:", error?.message || error);
    return res.status(500).json({ success: false, error: "전환 지표를 계산하지 못했습니다." });
  }
}
