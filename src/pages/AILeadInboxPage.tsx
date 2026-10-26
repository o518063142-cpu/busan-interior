import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { MetaManager } from "../components/seo/MetaManager";
import {
  ArrowLeft,
  Bot,
  FileImage,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Ruler,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type Attachment = {
  ref: string;
  name: string;
  kind: "photo" | "floorplan";
};

type GenePlanDraft = {
  version?: string;
  spaces?: Array<{
    spaceName?: string;
    spaceType?: string;
    evidence?: string;
    confidence?: string;
    needsMeasurement?: boolean;
  }>;
  objects?: Array<{
    objectType?: string;
    label?: string;
    spaceName?: string;
    evidence?: string;
    confidence?: string;
    needsMeasurement?: boolean;
  }>;
  tradeCandidates?: Array<{
    trade?: string;
    reason?: string;
    confidence?: string;
  }>;
  measurementChecks?: string[];
  conflicts?: string[];
  sourceSummary?: string;
};

type AILead = {
  id: string;
  name: string;
  phone: string;
  location: string;
  spaceType: string;
  area: string;
  startDate: string;
  details: string;
  status: string;
  source: string;
  genePlanStatus: string;
  genePlanDraftVersion?: string;
  genePlanDraft?: GenePlanDraft | null;
  createdAt: string | null;
  aiEstimateSnapshot?: {
    costRange?: string;
    durationRange?: string;
    visualFindings?: string[];
    floorplanNotes?: string[];
  } | null;
  attachments: Attachment[];
};

const STATUS_LABEL: Record<string, string> = {
  new: "신규",
  contacted: "연락완료",
  site_visit: "현장실측",
  estimate: "견적발송",
  contract: "계약",
  completed: "공사완료",
};

const GENE_PLAN_STATUS_LABEL: Record<string, string> = {
  structured_review_ready: "구조화 검토대기",
  ready_for_review: "첨부자료 검토대기",
  no_attachment: "첨부자료 없음",
};

function confidenceLabel(value?: string) {
  if (value === "high") return "높음";
  if (value === "medium") return "중간";
  if (value === "low") return "낮음";
  return value || "미정";
}

export const AILeadInboxPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<AILead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openingRef, setOpeningRef] = useState<string | null>(null);

  useEffect(
    () =>
      onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      }),
    []
  );

  const loadLeads = async (currentUser: User) => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/ai-leads", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "AI 상담 리드를 불러오지 못했습니다.");
      }
      setLeads(Array.isArray(json.leads) ? json.leads : []);
    } catch (err: any) {
      setError(err?.message || "AI 상담 리드를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void loadLeads(user);
  }, [user]);

  const openAttachment = async (attachment: Attachment) => {
    if (!user) return;
    setOpeningRef(attachment.ref);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `/api/ai-estimate-attachment?ref=${encodeURIComponent(attachment.ref)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const json = await response.json().catch(() => null);
        throw new Error(json?.error || "첨부자료를 열지 못했습니다.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err: any) {
      setError(err?.message || "첨부자료를 열지 못했습니다.");
    } finally {
      setOpeningRef(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-5">
        <MetaManager title="AI 상담 자료 보관함" noindex={true} canonicalPath="/admin/ai-leads" />
        <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-7 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold">관리자 로그인이 필요합니다.</h1>
          <p className="text-sm text-stone-400">고객 사진과 평면도는 관리자만 확인할 수 있습니다.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-stone-950">
            관리자 로그인
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      <MetaManager title="AI 상담 자료 보관함" noindex={true} canonicalPath="/admin/ai-leads" />
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400">GENE PLAN INBOX</span>
              <h1 className="text-lg sm:text-xl font-bold">AI 상담 자료 보관함</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/funnel" className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" /> 전환분석
            </Link>
            <button
              type="button"
              onClick={() => user && loadLeads(user)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-stone-950 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> 새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-stone-300 leading-5">
          고객이 AI 견적에서 제출한 사진·평면도는 관리자 인증 후에만 열립니다. 구조화 초안은 AI가 확정한 도면이 아니라 GENE PLAN에서 사람이 승인·수정하기 위한 후보 데이터입니다.
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-700/60 bg-rose-950/60 p-4 text-sm text-rose-200">{error}</div>
        )}

        {loading && leads.length === 0 ? (
          <div className="py-24 text-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            AI 상담 자료를 불러오는 중입니다.
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-3xl border border-stone-800 bg-stone-900 p-10 text-center text-sm text-stone-500">
            아직 AI 견적 상담 리드가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {leads.map((lead) => {
              const draft = lead.genePlanDraft;
              const spaces = draft?.spaces || [];
              const objects = draft?.objects || [];
              const trades = draft?.tradeCandidates || [];
              const measurements = draft?.measurementChecks || [];
              const conflicts = draft?.conflicts || [];

              return (
                <article key={lead.id} className="rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-white font-bold">
                        <UserRound className="w-4 h-4 text-amber-400" /> {lead.name}
                      </div>
                      <a href={`tel:${lead.phone}`} className="text-sm text-amber-300 mt-1 inline-block">{lead.phone}</a>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex rounded-full border border-stone-700 bg-stone-950 px-2.5 py-1 text-[11px] font-bold text-stone-300">
                        {STATUS_LABEL[lead.status] || lead.status}
                      </span>
                      <div className="text-[10px] text-stone-500 mt-2">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleString("ko-KR") : "날짜 없음"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-stone-950 border border-stone-800 p-3">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 mb-2" />
                      <div className="text-stone-300 break-keep">{lead.location || "지역 미입력"}</div>
                    </div>
                    <div className="rounded-xl bg-stone-950 border border-stone-800 p-3">
                      <Ruler className="w-3.5 h-3.5 text-stone-500 mb-2" />
                      <div className="text-stone-300">{lead.area ? `${lead.area}평` : "면적 미입력"}</div>
                    </div>
                    <div className="rounded-xl bg-stone-950 border border-stone-800 p-3">
                      <Bot className="w-3.5 h-3.5 text-stone-500 mb-2" />
                      <div className="text-stone-300">{lead.spaceType || "공간 미입력"}</div>
                    </div>
                  </div>

                  {lead.aiEstimateSnapshot && (
                    <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 text-xs space-y-1.5">
                      <div className="text-stone-500">AI 예상 결과</div>
                      <div className="text-white font-bold">{lead.aiEstimateSnapshot.costRange || "예상비용 없음"}</div>
                      <div className="text-stone-400">{lead.aiEstimateSnapshot.durationRange || "예상기간 없음"}</div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-bold text-white">사진·평면도</h2>
                      <span className="text-[11px] text-stone-500">{lead.attachments.length}개</span>
                    </div>
                    {lead.attachments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-stone-700 p-4 text-xs text-stone-500">첨부자료 없음</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lead.attachments.map((attachment) => (
                          <button
                            key={attachment.ref}
                            type="button"
                            onClick={() => openAttachment(attachment)}
                            disabled={openingRef === attachment.ref}
                            className="inline-flex max-w-full items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-stone-200 hover:border-amber-500/50 disabled:opacity-50"
                          >
                            {openingRef === attachment.ref ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            ) : attachment.kind === "floorplan" ? (
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <FileImage className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="truncate max-w-[220px]">{attachment.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {draft ? (
                    <div className="rounded-2xl border border-amber-500/25 bg-stone-950 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-black text-amber-300">GENE PLAN 구조화 초안</div>
                          <div className="text-[11px] text-stone-500 mt-1">{draft.sourceSummary || "AI 구조화 근거 요약 없음"}</div>
                        </div>
                        <div className="text-[10px] text-stone-500">{lead.genePlanDraftVersion || draft.version || "v1"}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl border border-stone-800 bg-stone-900 p-3"><div className="text-xl font-black text-white">{spaces.length}</div><div className="text-[10px] text-stone-500">공간 후보</div></div>
                        <div className="rounded-xl border border-stone-800 bg-stone-900 p-3"><div className="text-xl font-black text-white">{objects.length}</div><div className="text-[10px] text-stone-500">객체 후보</div></div>
                        <div className="rounded-xl border border-stone-800 bg-stone-900 p-3"><div className="text-xl font-black text-white">{trades.length}</div><div className="text-[10px] text-stone-500">공종 후보</div></div>
                      </div>

                      {spaces.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-stone-400 mb-2">공간 후보</div>
                          <div className="flex flex-wrap gap-2">
                            {spaces.map((space, index) => (
                              <span key={`${space.spaceName}-${index}`} className="rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1.5 text-[11px] text-stone-300">
                                {space.spaceName || space.spaceType || "공간"} · {confidenceLabel(space.confidence)}{space.needsMeasurement ? " · 실측필요" : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {objects.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-stone-400 mb-2">객체 후보</div>
                          <div className="space-y-2">
                            {objects.slice(0, 16).map((object, index) => (
                              <div key={`${object.objectType}-${object.label}-${index}`} className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5 text-[11px]">
                                <div className="flex items-center justify-between gap-3">
                                  <strong className="text-white">{object.label || object.objectType || "객체"}</strong>
                                  <span className="text-amber-300">{confidenceLabel(object.confidence)}{object.needsMeasurement ? " · 실측" : ""}</span>
                                </div>
                                <div className="text-stone-500 mt-1">{object.spaceName || "공간 미정"} · {object.objectType || "other"}</div>
                                {object.evidence && <div className="text-stone-400 mt-1 leading-5">근거: {object.evidence}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {trades.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-stone-400 mb-2">공종 후보</div>
                          <div className="flex flex-wrap gap-2">
                            {trades.map((trade, index) => (
                              <span key={`${trade.trade}-${index}`} title={trade.reason || ""} className="rounded-lg border border-blue-900/60 bg-blue-950/40 px-2.5 py-1.5 text-[11px] text-blue-200">
                                {trade.trade || "기타"} · {confidenceLabel(trade.confidence)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {measurements.length > 0 && (
                        <div>
                          <div className="text-[11px] font-bold text-stone-400 mb-2">실측·확인 필요</div>
                          <div className="space-y-1.5 text-[11px] text-stone-300 leading-5">
                            {measurements.slice(0, 12).map((item, index) => <div key={index}>• {item}</div>)}
                          </div>
                        </div>
                      )}

                      {conflicts.length > 0 && (
                        <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3">
                          <div className="text-[11px] font-bold text-rose-300 mb-2">충돌·불명확 항목</div>
                          <div className="space-y-1.5 text-[11px] text-rose-200 leading-5">
                            {conflicts.slice(0, 10).map((item, index) => <div key={index}>• {item}</div>)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-stone-700 p-4 text-xs text-stone-500">
                      구조화 초안 없음 — 기존 상담이거나 AI 구조화 전 데이터입니다.
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-stone-800 pt-3 text-[11px]">
                    <span className="text-stone-500">GENE PLAN 상태</span>
                    <strong className="text-amber-300">{GENE_PLAN_STATUS_LABEL[lead.genePlanStatus] || lead.genePlanStatus || "미분류"}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AILeadInboxPage;
