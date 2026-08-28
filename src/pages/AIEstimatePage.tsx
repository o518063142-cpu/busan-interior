import React, { useState } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { AIEstimateInput, AIEstimateResult, NavigationMenu } from "../types";
import { MetaManager } from "../components/seo/MetaManager";
import {
  Sparkles,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  AlertTriangle,
  Send,
  Loader2,
  Info,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface AIEstimatePageProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModalWithData?: (data: {
    spaceType: string;
    location: string;
    area: string;
    details: string;
  }) => void;
}

export const AIEstimatePage: React.FC<AIEstimatePageProps> = ({
  setActiveTab,
  openContactModalWithData,
}) => {
  const [formInput, setFormInput] = useState<AIEstimateInput>({
    spaceType: "아파트",
    location: "부산진구 전포동",
    area: "30",
    scope: "전체공사",
    startDate: "1개월 이내",
    budget: "3,000만 원 ~ 5,000만 원",
    style: "모던 미니멀",
    details: "거실 확장 및 라인 조명, 욕실 포세린 타일 시공을 희망합니다.",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIEstimateResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/ai-estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formInput),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error(json.error || "AI 견적 산출에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("AI Estimate fetch error:", err);
      // Client-side fallback calculation if endpoint encounters issue
      const areaPyung = Number(formInput.area) || 30;
      const isFull = formInput.scope === "전체공사";
      const minCost = isFull ? areaPyung * 110 : areaPyung * 60;
      const maxCost = isFull ? areaPyung * 160 : areaPyung * 90;

      setResult({
        estimatedScope: [
          `${formInput.spaceType} 철거 및 마감 정리`,
          `목공 공사 (천장 평탄화, 몰딩, 간접 조명 박스)`,
          `조명 및 전기 콘센트/스위치 가공`,
          `바닥재 (강마루 / 포세린 타일 선택)`,
          `욕실 및 주방 맞춤 가구 제작`,
          `친환경 실크 도배 및 필름 시공`,
        ],
        constructionPhases: [
          { phaseName: "1단계: 현장 실측 및 맞춤 설계", description: "한신인테리어 전문가 방문 및 도면 확정", durationDays: "3~5일" },
          { phaseName: "2단계: 철거 및 설비/단열", description: "기존 인테리어 철거 및 전력 배선/배관 정리", durationDays: "2~3일" },
          { phaseName: "3단계: 목공 및 필름/타일", description: "틀 제작, 타일 시공 및 무몰딩 도어 세팅", durationDays: "5~7일" },
          { phaseName: "4단계: 도배, 마루, 조명 설치", description: "고급 마루/타일 시공 및 디밍 디자인 조명 세팅", durationDays: "3~4일" },
          { phaseName: "5단계: 가구 배치 및 최종 검수", description: "수납장 인프라 설치 및 고객 입회 준공 검수", durationDays: "2~3일" },
        ],
        costRange: `약 ${minCost.toLocaleString()}만 원 ~ ${maxCost.toLocaleString()}만 원 (자재 등급 및 구조에 따라 변동)`,
        durationRange: `약 ${isFull ? "3주 ~ 4주" : "1주 ~ 2주"}`,
        expertTips: [
          `${formInput.location} 지역 현장 구조에 따른 기존 내력벽 유무 확인 필수`,
          `희망하신 ${formInput.style} 스타일 연출을 위한 조명 전력 용량 점검`,
          `공동주택 입주자 동의서 작성 및 소음 공사 가능 시간 준수 필요`,
        ],
        summaryMessage: `지니 인테리어(GENE INTERIOR)는 부산을 중심으로 경남·울산까지 상담 가능한 실내건축공사업 등록업체로서 고객님의 ${formInput.spaceType} 공간을 가장 완성도 높게 구현해 드립니다.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    openContactModalWithData({
      spaceType: formInput.spaceType,
      location: formInput.location,
      area: formInput.area,
      details: `${formInput.style} 스타일 / AI 예상 비용 (${result?.costRange || ""}) - 추가요청: ${formInput.details}`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      <MetaManager
        title="AI 상담·견적｜부산 인테리어 AI 예상 견적｜지니 인테리어"
        description="인공지능 기반 맞춤 인테리어 예상 견적 및 공사 기간 산출. 부산 및 경남·울산 아파트/상가/카페 맞춤 AI 시공 가이드."
        canonicalPath="/ai-estimate"
      />
      {/* Top Banner Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto font-sans">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 font-sans">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>AI SMART ESTIMATE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-sans break-keep">
          AI 인테리어 상담 & 견적
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans break-keep">
          공간 정보와 원하시는 스타일을 입력하시면, AI가 부산 지역 최신 인테리어 시세를 반영하여 예상 공사 범위, 단계를 분석해 드립니다.
        </p>
      </div>

      {/* Input Form & AI Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
        {/* Left: Input Form (8 required items) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 font-sans">
          <div className="border-b border-stone-200 pb-4 font-sans">
            <h2 className="text-lg font-bold text-stone-900 font-sans flex items-center gap-2 break-keep">
              <Calculator className="w-5 h-5 text-amber-600" />
              <span>공간 및 공사 조건 입력 (8개 항목)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1 font-sans">
              정확하게 입력하실수록 AI가 세밀한 견적 가이드를 생성합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* 1. 공간 유형 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                1. 공간 유형 <span className="text-amber-600">*</span>
              </label>
              <select
                value={formInput.spaceType}
                onChange={(e) => setFormInput({ ...formInput, spaceType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="아파트">아파트</option>
                <option value="주택">주택</option>
                <option value="상가">상가</option>
                <option value="카페">카페</option>
                <option value="음식점">음식점</option>
                <option value="사무실">사무실</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 2. 공사 지역 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                2. 공사 지역 <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formInput.location}
                placeholder="예: 부산진구 전포동, 서면"
                onChange={(e) => setFormInput({ ...formInput, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 3. 면적 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                3. 면적 (평수) <span className="text-amber-600">*</span>
              </label>
              <input
                type="number"
                required
                value={formInput.area}
                placeholder="예: 30"
                onChange={(e) => setFormInput({ ...formInput, area: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 4. 공사 범위 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                4. 공사 범위 <span className="text-amber-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormInput({ ...formInput, scope: "전체공사" })}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${
                    formInput.scope === "전체공사"
                      ? "bg-stone-900 text-amber-300 border-stone-900 shadow"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  전체공사 (올 리모델링)
                </button>
                <button
                  type="button"
                  onClick={() => setFormInput({ ...formInput, scope: "부분공사" })}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all border ${
                    formInput.scope === "부분공사"
                      ? "bg-stone-900 text-amber-300 border-stone-900 shadow"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                  }`}
                >
                  부분공사 (부분 리모델링)
                </button>
              </div>
            </div>

            {/* 5. 희망 공사 시작일 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                5. 희망 공사 시작일
              </label>
              <input
                type="text"
                value={formInput.startDate}
                placeholder="예: 1개월 이내, 협의 필요"
                onChange={(e) => setFormInput({ ...formInput, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 6. 예상 예산 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                6. 예상 예산
              </label>
              <input
                type="text"
                value={formInput.budget}
                placeholder="예: 3,000만 원 ~ 5,000만 원 또는 미정"
                onChange={(e) => setFormInput({ ...formInput, budget: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 7. 원하는 인테리어 스타일 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                7. 원하는 인테리어 스타일
              </label>
              <select
                value={formInput.style}
                onChange={(e) => setFormInput({ ...formInput, style: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
              >
                <option value="모던 미니멀">모던 미니멀 (깔끔하고 모던한 무드)</option>
                <option value="내추럴 우드">내추럴 우드 (따뜻하고 편안한 원목 무드)</option>
                <option value="클래식 엘레강스">클래식 엘레강스 (고급스러운 몰딩과 조명)</option>
                <option value="빈티지 인더스트리얼">빈티지 인더스트리얼 (카페/상가 감성 무드)</option>
                <option value="심플 럭셔리">심플 럭셔리 (대리석/포세린 타일과 간접조명)</option>
              </select>
            </div>

            {/* 8. 고객의 추가 요청사항 */}
            <div>
              <label className="block font-bold text-stone-800 mb-1">
                8. 고객의 추가 요청사항
              </label>
              <textarea
                rows={3}
                value={formInput.details}
                placeholder="예: 발코니 확장, 시스템에어컨, 포세린 타일 시공 등 원하시는 세부사항 작성"
                onChange={(e) => setFormInput({ ...formInput, details: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                    <span>AI가 한신인테리어 시세를 분석 중입니다...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-stone-950" />
                    <span>AI 예상 견적 & 분석 산출하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right: AI Result Display */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <div className="bg-stone-900 text-white p-8 sm:p-12 rounded-3xl border border-stone-800 text-center space-y-4 shadow-xl font-sans">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-sans text-white break-keep">
                왼쪽 양식을 입력하고 산출 버튼을 눌러주세요.
              </h3>
              <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-sans break-keep">
                AI가 입력하신 {formInput.spaceType} ({formInput.area}평) 정보를 바탕으로
                예상 공사 범위, 예상 공사 단계, 비용 및 기간 범위를 정밀 가이드해 드립니다.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-stone-900 text-white p-12 rounded-3xl border border-stone-800 text-center space-y-4 shadow-xl animate-pulse font-sans">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
              <h3 className="text-lg font-bold font-sans break-keep">
                AI가 {SITE_CONFIG.brand.nameKo} 부산 시공 데이터와 자재비를 계산 중입니다...
              </h3>
              <p className="text-xs text-stone-400 font-sans">잠시만 기다려주세요.</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl space-y-8 animate-in fade-in duration-300 font-sans">
              {/* Result Header */}
              <div className="border-b border-stone-800 pb-4 flex items-center justify-between flex-wrap gap-2 font-sans">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block font-sans">
                    AI ESTIMATE ANALYSIS
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans mt-1 break-keep">
                    {formInput.location} {formInput.spaceType} ({formInput.area}평) AI 견적 결과
                  </h3>
                </div>
                <div className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold font-sans">
                  {formInput.scope} / {formInput.style}
                </div>
              </div>

              {/* Key Highlights (Cost & Duration) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>예상 비용 범위</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-amber-300 font-sans">
                    {result.costRange}
                  </p>
                </div>

                <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 font-sans">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>예상 공사 기간</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-white font-sans">
                    {result.durationRange}
                  </p>
                </div>
              </div>

              {/* Estimated Scope */}
              <div className="space-y-3 font-sans">
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2 break-keep">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>추천 주요 공사 범위</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800 font-sans">
                  {result.estimatedScope.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-sans break-keep">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Construction Phases */}
              <div className="space-y-3 font-sans">
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2 break-keep">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>예상 공사 단계</span>
                </h4>
                <div className="space-y-2 text-xs font-sans">
                  {result.constructionPhases.map((phase, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-start justify-between gap-3 font-sans"
                    >
                      <div>
                        <span className="font-bold text-amber-300 block mb-0.5 font-sans break-keep">
                          {phase.phaseName}
                        </span>
                        <p className="text-stone-400 leading-normal font-sans break-keep">
                          {phase.description}
                        </p>
                      </div>
                      <span className="text-[11px] bg-stone-800 px-2 py-1 rounded text-stone-300 whitespace-nowrap font-semibold shrink-0 font-sans">
                        소요: {phase.durationDays}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expert Tips / Items requiring check */}
              <div className="space-y-3 font-sans">
                <h4 className="text-sm font-bold text-amber-300 font-sans flex items-center gap-2 break-keep">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>현장 실측 시 추가 확인이 필요한 사항</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-300 bg-stone-950 p-4 rounded-2xl border border-stone-800 font-sans">
                  {result.expertTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 font-sans">
                      <span className="text-amber-400 font-bold">•</span>
                      <span className="font-sans break-keep">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MANDATORY DISCLAIMER NOTICE (EXACT REQUIRED TEXT) */}
              <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/40 text-amber-200 text-xs leading-relaxed space-y-1">
                <p className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>[필독] AI 견적 참고용 안내사항</span>
                </p>
                <p className="text-stone-300 text-[11px] sm:text-xs leading-relaxed">
                  "AI가 제공하는 비용과 기간은 입력 정보를 기반으로 한 참고용 예상치이며 실제 견적은 현장 상태, 자재, 공사 범위에 따라 달라질 수 있습니다. 정확한 견적은 {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})의 현장 실측 상담을 통해 확인하시기 바랍니다."
                </p>
              </div>

              {/* Action Button right below AI results */}
              <div className="pt-2">
                <button
                  onClick={handleApplyClick}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-2xl text-sm sm:text-base transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{SITE_CONFIG.brand.nameKo} 무료 현장 실측 신청</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
