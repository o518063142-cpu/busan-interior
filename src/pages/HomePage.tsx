import React, { useState } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu, ProjectItem } from "../types";
import { SERVICES_DATA } from "../data/servicesData";
import { PROJECTS_DATA } from "../data/projectsData";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  Calculator,
  Calendar,
  MapPin,
  Star,
  Users,
  Building,
  Ruler,
  FileCheck,
  Wrench,
  BadgeCheck,
  ChevronRight,
  ExternalLink,
  Maximize2,
  Eye,
  Images,
  ArrowLeftRight,
} from "lucide-react";

interface HomePageProps {
  setActiveTab: (tab: NavigationMenu) => void;
  openContactModal: () => void;
  onSelectProject: (project: ProjectItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  openContactModal,
  onSelectProject,
}) => {
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [showBeforePhoto, setShowBeforePhoto] = useState(false);
  const featuredProject = PROJECTS_DATA[activeFeaturedIndex] || PROJECTS_DATA[0];

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-stone-950 overflow-hidden border-b border-stone-800">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={SITE_CONFIG.heroImages.main}
            alt="한신인테리어 부산진구 전포동 서면 실내건축 메인 비주얼"
            className="w-full h-full object-cover object-center opacity-40 filter contrast-105"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent" />
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[2px]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-8 py-20 text-center space-y-8">
          {/* License Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900/90 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{SITE_CONFIG.company.licenseStatus}</span>
            <span className="text-stone-500">|</span>
            <span className="text-stone-300">부산진구 · 전포동 · 서면</span>
          </div>

          {/* Title & Subtitle exact matches */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <p className="text-amber-400 font-medium text-lg sm:text-xl lg:text-2xl tracking-wide">
              부산진구 전포동 실내건축·인테리어 전문
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight font-serif drop-shadow-md">
              한신인테리어
            </h1>
            <h2 className="text-xl sm:text-3xl font-bold text-stone-200 tracking-normal pt-2">
              아파트·주택 리모델링부터
              <br className="sm:hidden" /> 상가·매장·사무실 인테리어까지
            </h2>
            <p className="text-stone-300 text-base sm:text-lg lg:text-xl font-normal leading-relaxed pt-2 max-w-2xl mx-auto">
              현장 실측부터 설계·견적·시공까지
              <br /> 공간에 맞는 인테리어를 제안합니다.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-2xl mx-auto">
            <a
              href={`tel:${SITE_CONFIG.company.phone}`}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-sm sm:text-base transition-all shadow-xl hover:shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Phone className="w-5 h-5 shrink-0 text-white" />
              <span>📞 지금 바로 전화 상담</span>
            </a>
            <button
              onClick={openContactModal}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-sm sm:text-base transition-all shadow-xl hover:shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>📝 무료 현장 실측 신청하기</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("AI_ESTIMATE");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3.5 bg-stone-900/90 hover:bg-stone-800 text-amber-300 font-bold rounded-xl text-sm sm:text-base border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
              <span>AI 견적 상담</span>
            </button>
          </div>

          {/* Trust Highlights Row */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-stone-800/80 text-left">
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/60">
              <span className="text-xs text-stone-400 block">면허 검증</span>
              <span className="text-sm font-bold text-white">실내건축면허 보유</span>
            </div>
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/60">
              <span className="text-xs text-stone-400 block">시공 방식</span>
              <span className="text-sm font-bold text-white">100% 직영 감리</span>
            </div>
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/60">
              <span className="text-xs text-stone-400 block">주요 지역</span>
              <span className="text-sm font-bold text-white">전포동·서면 중심</span>
            </div>
            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/60">
              <span className="text-xs text-stone-400 block">사후 관리</span>
              <span className="text-sm font-bold text-white">A/S 보증 책임</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 1: 한신인테리어 소개 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-xs tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <span>01. ABOUT US</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif leading-tight">
              부산진구 전포동 중심,
              <br />
              <span className="text-stone-700">공간의 품격을 더하는 한신인테리어</span>
            </h2>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              한신인테리어는 부산 부산진구 전포동 및 서면, 부산 전 지역을 무대로 최상의 실내건축과 리모델링을 선보이는 전문 공간 제작 기업입니다.
            </p>
            <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
              주거용 아파트·주택 올 리모델링부터 상가·매장, 전포 카페거리 감성 카페, 사무실 인테리어까지 단순한 마감을 넘어 고객의 라이프스타일과 브랜드 가치에 부합하는 정밀 설계를 제안합니다.
            </p>

            <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200/80 space-y-2 text-xs sm:text-sm text-stone-800">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>실내건축면허 보유 공식 업체</span>
              </div>
              <p className="text-stone-600 leading-normal pl-7">
                법적 실내건축면허 기준에 근거하여 안전하고 정직하게 시공합니다. (등록 면허 정보는 시스템상에서 즉시 업데이트가 가능합니다.)
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveTab("ABOUT");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all shadow"
              >
                <span>한신인테리어 자세히 보기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 group">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="한신인테리어 대표 시공 공간 비주얼"
                className="w-full h-[400px] sm:h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-6 bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-700">
                <p className="text-xs text-amber-400 font-bold mb-1">
                  1:1 맞춤 설계 & 책임감리
                </p>
                <p className="text-sm font-semibold">
                  "공간의 쓰임과 동선을 깊이 있게 고민합니다."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: 주요 서비스 ================= */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              02. OUR SERVICES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
              한신인테리어 주요 분야
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              주거 공간부터 상업, 사무, 전체 실내건축까지 각 공간 목적에 맞는 최적의 인테리어 솔루션을 전달합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_DATA.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="h-44 rounded-xl overflow-hidden relative">
                    <img
                      src={service.bannerImage}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-stone-900/90 text-white text-xs px-2.5 py-1 rounded-lg font-bold backdrop-blur-sm">
                      {service.title}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {service.shortDesc}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <p className="text-xs font-bold text-stone-900">주요 공사 범위:</p>
                    <ul className="space-y-1 text-xs text-stone-600">
                      {service.scopeList.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => {
                      setActiveTab("SERVICE");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 group-hover:bg-amber-600"
                  >
                    <span>서비스 상세 보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: 대표 시공사례 (대형 사진 포트폴리오 갤러리) ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
              <Images className="w-3.5 h-3.5 text-amber-600" />
              <span>03. RECENT PROJECTS GALLERY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 font-serif leading-tight">
              실제 감성을 담은 시공갤러리
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              * 아래 시공사례는 한신인테리어의 디자인 역량과 마감 퀄리티를 보여드리기 위한 [샘플 포트폴리오]입니다.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab("PROJECT");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md self-start md:self-auto border border-stone-800"
          >
            <span>전체 시공사례 포트폴리오 ({PROJECTS_DATA.length})</span>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Featured Large Photo Showcase Box */}
        <div className="bg-stone-950 text-white rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
          {/* Top Project Selector Tabs */}
          <div className="bg-stone-900/90 border-b border-stone-800 p-3 sm:p-4 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-xs text-amber-400 font-bold px-2 py-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              추천 프로젝트:
            </span>
            {PROJECTS_DATA.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => {
                  setActiveFeaturedIndex(idx);
                  setShowBeforePhoto(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeFeaturedIndex === idx
                    ? "bg-amber-500 text-stone-950 shadow-md font-black"
                    : "bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                {proj.category} · {proj.location.replace("부산진구 ", "")}
              </button>
            ))}
          </div>

          {/* Featured Large Photo Grid & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Large Image Display (lg:col-span-8) */}
            <div className="lg:col-span-8 relative bg-stone-900 overflow-hidden flex flex-col justify-between group">
              {/* Main Photo Container */}
              <div className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden bg-stone-950">
                <img
                  src={
                    showBeforePhoto
                      ? featuredProject.beforeImage
                      : featuredProject.afterImages[0]
                  }
                  alt={featuredProject.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-stone-950/40 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full shadow-lg ${
                        featuredProject.isSample
                          ? "bg-amber-500 text-stone-950"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {featuredProject.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                    </span>
                    <span className="bg-stone-900/80 text-stone-200 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md border border-stone-700">
                      {featuredProject.category}
                    </span>
                  </div>

                  {/* Before / After Toggle Switcher Button */}
                  <button
                    onClick={() => setShowBeforePhoto(!showBeforePhoto)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs font-bold backdrop-blur-md shadow-lg transition-all active:scale-95"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showBeforePhoto ? "✨ 완공 모습 보기" : "🏚️ 시공 전 상태 보기"}</span>
                  </button>
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{featuredProject.location}</span>
                      <span>•</span>
                      <span>{featuredProject.area}</span>
                      <span>•</span>
                      <span>{featuredProject.duration}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-serif drop-shadow-md">
                      {featuredProject.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onSelectProject(featuredProject)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-all shadow-xl shrink-0"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>큰 사진 전체보기</span>
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip underneath Main Photo */}
              <div className="p-3 bg-stone-950 border-t border-stone-800/80 flex items-center gap-3 overflow-x-auto">
                <span className="text-[11px] text-stone-400 font-medium shrink-0 px-1">
                  갤러리 사진 {featuredProject.afterImages.length + 1}장:
                </span>
                <button
                  onClick={() => setShowBeforePhoto(true)}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-all ${
                    showBeforePhoto ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={featuredProject.beforeImage} alt="시공전" className="w-full h-full object-cover filter grayscale" />
                  <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] text-center text-stone-300 font-bold py-0.5">시공전</span>
                </button>
                {featuredProject.afterImages.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setShowBeforePhoto(false)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-all ${
                      !showBeforePhoto && i === 0 ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`완공${i+1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] text-center text-amber-300 font-bold py-0.5">완공컷 {i+1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Key Details & Features (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900/60 space-y-6">
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {featuredProject.spaceTypeDetail}
                  </span>
                  <h4 className="text-lg font-bold text-white font-serif">
                    시공 핵심 포인트 & 고객 요청
                  </h4>
                </div>

                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                  <p className="text-xs text-amber-300 font-bold">고객 요청사항:</p>
                  <p className="text-xs text-stone-300 leading-relaxed italic">
                    "{featuredProject.clientRequest}"
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-stone-400 font-bold">핵심 시공 공정:</p>
                  <ul className="space-y-2">
                    {featuredProject.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-200">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed pt-2">
                  {featuredProject.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-3">
                <button
                  onClick={() => onSelectProject(featuredProject)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>이 시공사례 상세스펙 & 도면 확인</span>
                </button>
                <button
                  onClick={openContactModal}
                  className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition-all border border-stone-700 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>비슷한 평수 무료 방문 실측 신청</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Project Cards Grid (With Enlarged Photos: h-72 sm:h-80) */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              기타 주요 시공 포트폴리오
            </h3>
            <span className="text-xs text-stone-500">
              이미지를 클릭하면 상세 사진과 시공 스펙을 보실 수 있습니다
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECTS_DATA.map((project) => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Large High-Impact Image Box (h-72 sm:h-80) */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-stone-950">
                    <img
                      src={project.afterImages[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Category & Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                      <span className="bg-amber-500 text-stone-950 font-black text-[11px] px-3 py-1 rounded-full shadow">
                        샘플 프로젝트
                      </span>
                      <span className="bg-stone-900/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-semibold border border-stone-700">
                        {project.category}
                      </span>
                    </div>

                    {/* Photo Count Pill */}
                    <div className="absolute top-4 right-4 bg-stone-900/80 text-amber-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-500/30 font-semibold flex items-center gap-1">
                      <Images className="w-3.5 h-3.5" />
                      <span>{project.afterImages.length + 1}장</span>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{project.location}</span>
                        <span>•</span>
                        <span>{project.area}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white font-serif line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {project.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                      <span className="font-semibold text-stone-800">주요공정:</span>
                      <span className="truncate">{project.scope}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-xs text-stone-900 font-extrabold group-hover:text-amber-600 transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>시공 사진 크게보기 & 세부스펙</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: 한신인테리어의 강점 ================= */}
      <section className="bg-stone-950 text-white py-16 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60">
              04. OUR STRENGTHS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif">
              왜 한신인테리어를 선택해야 할까요?
            </h2>
            <p className="text-stone-400 text-sm sm:text-base">
              실내건축 면허 보유 업체의 높은 신뢰도와 부산 지역에 최적화된 시공 노하우를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">실내건축면허 보유</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                법령 기준을 준수하는 공식 실내건축 면허업체로서 정밀 시공 및 하자에 대한 명확한 사후관리를 보증합니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">부산 지역밀착 전문성</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                부산진구, 전포동, 서면 등 지역 건축물 특성과 아파트·상가 관리규정을 잘 숙지하고 있어 공사를 효율적으로 진행합니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">투명한 견적 및 소통</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                자재별 세부 공정 내역서를 투명하게 공개하며, 불필요한 추가금 청구 없는 깔끔한 약속을 지킵니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">책임감리 & A/S 보증</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                현장 소장의 1:1 상주 책임감리와 완공 후에도 신속한 A/S 처리 시스템으로 고객 만족을 유지합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: 공사 진행 과정 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            05. PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
            체계적인 공사 진행 6단계
          </h2>
          <p className="text-stone-600 text-sm">
            상담부터 완공 A/S까지 체계적이고 구체적인 단계별 진행으로 안심하고 맡기실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { step: "01", title: "상담 및 현장 실측", desc: "무료 방문을 통한 부산 현장 정밀 실측 및 공간 니즈 파악" },
            { step: "02", title: "기획 및 디자인 설계", desc: "고객 취향에 맞춘 도면 및 동선 레이아웃 세부 제안" },
            { step: "03", title: "투명 견적 산출", desc: "공정별/자재별 투명한 세부 견적서 발급 및 계약" },
            { step: "04", title: "자재 선정 및 착공", desc: "타일, 마루, 도배, 조명 자재 샘플 확정 및 착공" },
            { step: "05", title: "책임 시공 및 감리", desc: "실내건축 면허 전문가의 일별 현장 공정 감독 및 소통" },
            { step: "06", title: "완공 검수 및 A/S", desc: "고객 입회 최종 검수, 준공 청소 및 사후 보증 관리" },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative space-y-2"
            >
              <div className="text-3xl font-extrabold text-amber-500 font-serif">
                STEP {item.step}
              </div>
              <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 6: 고객 리뷰 ================= */}
      <section className="bg-stone-100 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              06. REVIEWS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
              고객 후기 & 만족도
            </h2>
            <p className="text-stone-600 text-sm">
              부산진구 전포동 및 서면 고객님들이 남겨주신 소중한 시공후기입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "전포동 30평대 아파트 올 리모델링",
                content:
                  "부산진구에서 인테리어 업체를 찾다가 실내건축 면허가 있어서 한신인테리어를 선택했습니다. 마감도 깔끔하고 특히 조명 라인이 너무 마음에 듭니다!",
                author: "전포동 김OO 고객님",
                rating: 5,
              },
              {
                title: "서면 전포 카페거리 디저트 카페 시공",
                content:
                  "상가 공사는 일정이 핵심이었는데 약속한 오픈 날짜를 완벽히 맞춰주셨어요. 원목 카운터 분위기가 너무 예뻐서 손님들이 인스타 사진 정말 많이 찍네요.",
                author: "서면 이OO 대표님",
                rating: 5,
              },
              {
                title: "부전동 오피스 사무실 가벽 & 방음 공사",
                content:
                  "견적서가 정말 세부 자재까지 투명하게 공개되어 믿음이 갔습니다. 시공 과정도 매일 사진으로 공유해주셔서 직장생활하면서 편하게 진행했습니다.",
                author: "부전동 박OO 이사님",
                rating: 5,
              },
            ].map((rev, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <h3 className="text-sm font-bold text-stone-900">{rev.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  "{rev.content}"
                </p>
                <p className="text-xs font-semibold text-stone-400 pt-2 border-t border-stone-100">
                  {rev.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: 부산 지역 서비스 안내 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="bg-stone-900 text-stone-100 p-8 sm:p-12 rounded-3xl border border-stone-800 space-y-6">
          <div className="space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-950 px-3 py-1 rounded-full border border-amber-800">
              07. LOCATION & REGION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white">
              부산진구 전포동 · 서면 및 부산 전 지역 출장 실측
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              한신인테리어는 부산 부산진구 전포동에 소재지를 두고 있으며, 부산진구(전포동, 서면, 부전동, 가야동, 범천동)를 중심으로 부산 전 지역(연제구, 수영구, 해운대구, 남구 등)에 신속한 방문 실측 및 견적 서비스를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {SITE_CONFIG.company.primaryRegions.map((region, i) => (
              <div key={i} className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-stone-200">{region} 인테리어</span>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-stone-800 text-xs">
            <span className="text-stone-400">
              * 위치 주소: {SITE_CONFIG.company.address} {SITE_CONFIG.company.addressDetail}
            </span>
            <a
              href={SITE_CONFIG.company.naverPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-lg font-bold border border-emerald-700/60"
            >
              <span>네이버 지도에서 위치 확인</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: AI 상담·견적 위젯 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 p-8 sm:p-12 rounded-3xl border border-amber-500/30 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>08. AI SMART ESTIMATE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif">
              내 공간 예상 인테리어 비용,
              <br /> AI로 1분 만에 확인해보세요!
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              공간 유형(아파트, 상가, 카페 등), 면적, 스타일을 선택하시면 AI가 적정 공사 범위와 예상 비용 및 공사기간을 종합 안내해 드립니다.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                setActiveTab("AI_ESTIMATE");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-2xl text-sm sm:text-base transition-all shadow-xl flex items-center gap-2 active:scale-95"
            >
              <Calculator className="w-5 h-5" />
              <span>AI 상담·견적 바로가기</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: 문의하기 미리보기 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            09. CONTACT US
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-serif">
            현장 실측 및 상담 문의
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            궁금하신 점이 있으시다면 언제든지 한신인테리어로 연락 주시기 바랍니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <Phone className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-base">전화 빠른 상담</h3>
              <p className="text-xs text-stone-600">
                상담 대표번호: <strong className="text-stone-900">{SITE_CONFIG.company.phoneDisplay}</strong>
              </p>
            </div>
            <a
              href={`tel:${SITE_CONFIG.company.phone}`}
              className="w-full min-h-[44px] py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Phone className="w-4 h-4 shrink-0 text-white" />
              <span>📞 지금 바로 전화 상담</span>
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <Calendar className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-base">온라인 무료 실측</h3>
              <p className="text-xs text-stone-600">
                원하시는 날짜에 무료 방문 실측을 신청하실 수 있습니다.
              </p>
            </div>
            <button
              onClick={openContactModal}
              className="w-full min-h-[44px] py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>📝 무료 현장 실측 신청하기</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
