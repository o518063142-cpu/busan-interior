import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { MetaManager } from "../components/seo/MetaManager";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  ClipboardCheck,
  FileText,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Ruler,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
} from "lucide-react";

type SourcePerformance = {
  source: string;
  leads: number;
  siteVisits: number;
  estimates: number;
  contractOrCompleted: number;
  leadToContract: number;
};

type LandingPerformance = {
  path: string;
  leads: number;
  contractOrCompleted: number;
  leadToContract: number;
};

type FunnelResponse = {
  success: boolean;
  generatedAt: string;
  trackingNote: string;
  aiFunnel: {
    pageVisitors: number;
    estimateUsers: number;
    consultationClicks: number;
    submittedSessions: number;
    leads: number;
    contacted: number;
    siteVisits: number;
    estimates: number;
    contracts: number;
    completed: number;
    contractOrCompleted: number;
  };
  rates: {
    visitorToEstimate: number;
    estimateToConsultationClick: number;
    estimateToLead: number;
    leadToSiteVisit: number;
    leadToContract: number;
    overallVisitorToContract: number;
  };
  allLeads: {
    total: number;
    siteVisits: number;
    estimates: number;
    contracts: number;
    completed: number;
    contractOrCompleted: number;
    leadToContract: number;
  };
  topSources: Array<{ source: string; count: number }>;
  sourcePerformance: SourcePerformance[];
  landingPerformance: LandingPerformance[];
};

const EMPTY = "-";

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    direct: "직접 방문",
    naver: "네이버",
    google: "Google",
    daum: "다음",
    kakao: "카카오",
    instagram: "Instagram",
    youtube: "YouTube",
    facebook: "Facebook",
    bing: "Bing",
    referral: "기타 외부사이트",
  };
  return labels[source] || source || EMPTY;
}

export const FunnelDashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  const loadMetrics = async (currentUser: User) => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/funnel-metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "전환 지표를 불러오지 못했습니다.");
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || "전환 지표를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) void loadMetrics(user);
  }, [user]);

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
        <MetaManager title="계약 전환 분석" noindex={true} canonicalPath="/admin/funnel" />
        <div className="max-w-md w-full rounded-3xl border border-stone-800 bg-stone-900 p-7 text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold">관리자 로그인이 필요합니다.</h1>
          <p className="text-sm text-stone-400">상담·계약 전환 데이터는 관리자만 확인할 수 있습니다.</p>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-stone-950">
            관리자 로그인
          </Link>
        </div>
      </div>
    );
  }

  const funnelCards = data
    ? [
        { label: "AI 견적 방문", value: data.aiFunnel.pageVisitors, icon: Search },
        { label: "AI 견적 실행", value: data.aiFunnel.estimateUsers, icon: Bot },
        { label: "상담 버튼 클릭", value: data.aiFunnel.consultationClicks, icon: MousePointerClick },
        { label: "AI 상담 리드", value: data.aiFunnel.leads, icon: UserCheck },
        { label: "현장 실측", value: data.aiFunnel.siteVisits, icon: Ruler },
        { label: "견적 발송", value: data.aiFunnel.estimates, icon: FileText },
        { label: "계약/완료", value: data.aiFunnel.contractOrCompleted, icon: ClipboardCheck },
      ]
    : [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      <MetaManager title="AI 견적 계약 전환 분석" noindex={true} canonicalPath="/admin/funnel" />

      <header className="border-b border-stone-800 bg-stone-900/95 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest text-amber-400">GENE CONTRACT FUNNEL</span>
              <h1 className="text-lg sm:text-xl font-bold">AI 견적 → 계약 전환 분석</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white">
              <ArrowLeft className="w-3.5 h-3.5" /> 상담관리
            </Link>
            <button
              onClick={() => user && loadMetrics(user)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-extrabold text-stone-950 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> 새로고침
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-700/60 bg-rose-950/60 p-4 text-sm text-rose-200">{error}</div>
        )}

        {loading && !data ? (
          <div className="py-24 text-center text-stone-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            전환 데이터를 계산하는 중입니다.
          </div>
        ) : data ? (
          <>
            <section className="rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-amber-400">핵심 목표</p>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">노출이 실제 계약으로 이어지는지 확인</h2>
                  <p className="text-xs text-stone-400 mt-2">{data.trackingNote}</p>
                </div>
                <TrendingUp className="w-7 h-7 text-emerald-400 shrink-0" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
                {funnelCards.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-stone-800 bg-stone-950 p-4">
                    <Icon className="w-4 h-4 text-amber-400 mb-3" />
                    <div className="text-2xl font-black text-white">{value}</div>
                    <div className="text-[11px] text-stone-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ["방문 → AI견적", data.rates.visitorToEstimate],
                ["AI견적 → 상담클릭", data.rates.estimateToConsultationClick],
                ["AI견적 → 상담접수", data.rates.estimateToLead],
                ["상담 → 현장실측", data.rates.leadToSiteVisit],
                ["상담 → 계약", data.rates.leadToContract],
                ["방문 → 계약", data.rates.overallVisitorToContract],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border border-stone-800 bg-stone-900 p-4 sm:p-5">
                  <div className="text-xs text-stone-400">{label}</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{Number(value).toFixed(1)}%</div>
                </div>
              ))}
            </section>

            <section className="rounded-3xl border border-amber-500/20 bg-stone-900 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold text-amber-400">계약 기준 채널 분석</p>
                  <h3 className="font-black text-white mt-1">유입 채널 → 상담 → 실측 → 견적 → 계약</h3>
                  <p className="text-[11px] text-stone-500 mt-1">AI 상담의 세션과 최초 방문 이벤트를 연결합니다. 광고 클릭 수가 아니라 실제 상담·계약 기준입니다.</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              {data.sourcePerformance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-700 p-6 text-center text-xs text-stone-500">아직 채널별 계약 데이터가 없습니다.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-xs">
                    <thead>
                      <tr className="text-left text-stone-500 border-b border-stone-800">
                        <th className="py-3 pr-4 font-semibold">유입 채널</th>
                        <th className="py-3 px-3 text-right font-semibold">상담</th>
                        <th className="py-3 px-3 text-right font-semibold">실측+</th>
                        <th className="py-3 px-3 text-right font-semibold">견적+</th>
                        <th className="py-3 px-3 text-right font-semibold">계약/완료</th>
                        <th className="py-3 pl-3 text-right font-semibold">상담→계약</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sourcePerformance.map((row) => (
                        <tr key={row.source} className="border-b border-stone-800/70 last:border-0">
                          <td className="py-3 pr-4 font-bold text-white">{sourceLabel(row.source)}</td>
                          <td className="py-3 px-3 text-right text-stone-300">{row.leads}</td>
                          <td className="py-3 px-3 text-right text-stone-300">{row.siteVisits}</td>
                          <td className="py-3 px-3 text-right text-stone-300">{row.estimates}</td>
                          <td className="py-3 px-3 text-right font-black text-amber-300">{row.contractOrCompleted}</td>
                          <td className="py-3 pl-3 text-right font-black text-emerald-400">{row.leadToContract.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-stone-800 bg-stone-900 p-5">
                <h3 className="font-bold text-white">전체 홈페이지 상담 성과</h3>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div><div className="text-2xl font-black">{data.allLeads.total}</div><div className="text-[11px] text-stone-500">전체 상담</div></div>
                  <div><div className="text-2xl font-black">{data.allLeads.contractOrCompleted}</div><div className="text-[11px] text-stone-500">계약/완료</div></div>
                  <div><div className="text-2xl font-black text-emerald-400">{data.allLeads.leadToContract.toFixed(1)}%</div><div className="text-[11px] text-stone-500">상담→계약</div></div>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-800 bg-stone-900 p-5">
                <h3 className="font-bold text-white">전체 방문 유입 소스 상위</h3>
                <div className="mt-4 space-y-2">
                  {data.topSources.length === 0 ? (
                    <p className="text-xs text-stone-500">아직 추적 데이터가 없습니다.</p>
                  ) : data.topSources.map((item) => (
                    <div key={item.source} className="flex items-center justify-between rounded-xl bg-stone-950 border border-stone-800 px-3 py-2.5 text-xs">
                      <span className="text-stone-300 truncate pr-3">{sourceLabel(item.source)}</span>
                      <strong className="text-amber-300">{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-800 bg-stone-900 p-5 sm:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold text-amber-400">콘텐츠·SEO 계약 기여</p>
                <h3 className="font-black text-white mt-1">최초 진입 페이지별 AI 상담 성과</h3>
                <p className="text-[11px] text-stone-500 mt-1">어떤 프로젝트·정보글·홈 페이지에서 들어온 방문자가 상담과 계약으로 이어졌는지 확인합니다.</p>
              </div>

              {data.landingPerformance.length === 0 ? (
                <p className="text-xs text-stone-500">아직 진입 페이지별 상담 데이터가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {data.landingPerformance.map((row) => (
                    <div key={row.path} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-3 items-center rounded-xl border border-stone-800 bg-stone-950 px-3 py-3 text-xs">
                      <span className="truncate text-stone-300" title={row.path}>{row.path}</span>
                      <span className="text-stone-500">상담 <strong className="text-white">{row.leads}</strong></span>
                      <span className="text-stone-500">계약 <strong className="text-amber-300">{row.contractOrCompleted}</strong></span>
                      <strong className="text-emerald-400">{row.leadToContract.toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <p className="text-[11px] text-stone-500 text-right">
              마지막 계산: {new Date(data.generatedAt).toLocaleString("ko-KR")}
            </p>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default FunnelDashboardPage;
