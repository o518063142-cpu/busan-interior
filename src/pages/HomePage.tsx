import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu, ProjectItem } from "../types";
import { SERVICES_DATA } from "../data/servicesData";
import { PROJECTS_DATA } from "../data/projectsData";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
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
  Mail,
} from "lucide-react";

interface HomePageProps {
  setActiveTab: (tab: NavigationMenu) => void;
  openContactModal: () => void;
  onSelectProject: (project: ProjectItem) => void;
}

// Helper to map project category UI tab labels (without restrictive local tags)
const getCategoryTabLabel = (proj: ProjectItem) => {
  switch (proj.id) {
    case "sample-proj-1":
      return "아파트";
    case "sample-proj-2":
      return "카페·음식점";
    case "sample-proj-3":
      return "상가·매장";
    case "sample-proj-4":
      return "사무실";
    case "sample-proj-5":
      return "주택";
    case "sample-proj-6":
      return "다이닝";
    default:
      return proj.spaceTypeDetail || proj.category || proj.title;
  }
};

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  openContactModal,
  onSelectProject,
}) => {
  const [firestoreProjects, setFirestoreProjects] = useState<ProjectItem[]>([]);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [showBeforePhoto, setShowBeforePhoto] = useState(false);

  // Real-time subscription to Firestore 'projects' collection
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: ProjectItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              slug: data.slug || (docSnap.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : ""),
              isSample: data.isSample ?? false,
              title: data.title || "시공 프로젝트",
              location: data.location || "부산",
              category: (data.category as "주거" | "상가·매장" | "카페·음식점" | "사무실" | "공공·교육시설") || "주거",
              spaceTypeDetail: data.spaceTypeDetail || "",
              area: data.area || "",
              duration: data.duration || "",
              scope: data.scope || "",
              clientRequest: data.clientRequest || "",
              description: data.description || "",
              keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
              beforeImage: data.beforeImage || "",
              inProgressImage: data.inProgressImage || "",
              afterImages: Array.isArray(data.afterImages) ? data.afterImages : [],
            };
          });
          setFirestoreProjects(items);
        },
        (error) => {
          console.warn("Firestore projects onSnapshot notice (using base data fallback):", error);
        }
      );
    } catch (err) {
      console.warn("Firestore projects subscription exception:", err);
    }

    return () => unsubscribe();
  }, []);

  // Merge Firestore Projects + Built-in PROJECTS_DATA with prioritization of actual projects
  const allProjects = useMemo(() => {
    const seenIds = new Set<string>();
    const seenSlugs = new Set<string>();
    const realProjects: ProjectItem[] = [];
    const sampleProjects: ProjectItem[] = [];

    // 1. Process Firestore real-time projects
    for (const fp of firestoreProjects) {
      if (!seenIds.has(fp.id) && (!fp.slug || !seenSlugs.has(fp.slug))) {
        seenIds.add(fp.id);
        if (fp.slug) seenSlugs.add(fp.slug);
        if (fp.isSample) {
          sampleProjects.push(fp);
        } else {
          realProjects.push(fp);
        }
      }
    }

    // 2. Add base PROJECTS_DATA (preserving sample projects afterwards)
    for (const bp of PROJECTS_DATA) {
      if (!seenIds.has(bp.id) && (!bp.slug || !seenSlugs.has(bp.slug))) {
        seenIds.add(bp.id);
        if (bp.slug) seenSlugs.add(bp.slug);
        if (bp.isSample) {
          sampleProjects.push(bp);
        } else {
          realProjects.push(bp);
        }
      }
    }

    return [...realProjects, ...sampleProjects];
  }, [firestoreProjects]);

  const featuredProject = allProjects[activeFeaturedIndex] || allProjects[0] || PROJECTS_DATA[0];

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      <MetaManager canonicalPath="/" />
      <StructuredData type="home" />
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[70vh] sm:min-h-[75vh] flex items-center justify-center bg-white text-stone-900 border-b border-stone-200/90 overflow-hidden">
        {/* Subtle Architectural Atmosphere Background */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <img
            src={SITE_CONFIG.heroImages.main}
            alt="지니 인테리어 (GENE INTERIOR) 실내건축 메인 비주얼"
            className="w-full h-full object-cover object-center filter grayscale contrast-125"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 text-center space-y-7 sm:space-y-8">
          {/* Refined License Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E5D8B8] text-[#8C6D23] text-xs sm:text-sm font-medium tracking-wide shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#B38F4D] shrink-0" />
            <span className="break-keep">실내건축공사업 등록 공식 면허업체</span>
          </div>

          {/* Typography: Modern Korean Sans-serif (Gothic) with Pure Hierarchy */}
          <div className="space-y-3.5 sm:space-y-4 max-w-3xl mx-auto">
            <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-stone-950 tracking-tight leading-[1.3] sm:leading-[1.2] font-sans break-keep">
              공간의 본질과 가치를 담는
              <br />
              <span className="text-stone-900">맞춤형 인테리어 & 리모델링</span>
            </h1>
            <p className="text-stone-600 text-sm sm:text-base lg:text-lg font-normal leading-relaxed pt-1 sm:pt-2 max-w-2xl mx-auto break-keep">
              현장 실측부터 1:1 맞춤 설계, 정밀 시공과 투명한 공정 관리까지
              <br className="hidden sm:inline" />
              고객의 라이프스타일과 공간의 완성도에 집중합니다.
            </p>
          </div>

          {/* Hero Action Buttons: High contrast Black / Champagne Gold / Minimal Neutral */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 max-w-2xl mx-auto">
            <button
              onClick={openContactModal}
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[48px] px-6 sm:px-7 py-3 sm:py-3.5 bg-stone-950 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm sm:text-base transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>무료 현장 실측 신청</span>
            </button>
            <a
              href={`tel:${SITE_CONFIG.company.phone}`}
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 py-3 sm:py-3.5 bg-white hover:bg-stone-50 text-stone-900 font-semibold rounded-xl text-sm sm:text-base border border-stone-300 hover:border-[#D4AF37] transition-all shadow-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-[#B38F4D] shrink-0" />
              <span>전화 상담 ({SITE_CONFIG.company.phone})</span>
            </a>
            <button
              onClick={() => {
                setActiveTab("AI_ESTIMATE");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full sm:w-auto min-h-[46px] sm:min-h-[48px] px-5 sm:px-6 py-3 sm:py-3.5 bg-[#FAF8F5] hover:bg-[#F4EFE6] text-stone-800 hover:text-stone-950 font-medium rounded-xl text-sm sm:text-base border border-[#E5D8B8] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#B38F4D] shrink-0" />
              <span>AI 견적 상담</span>
            </button>
          </div>

          {/* Minimal Key Strengths Row: Elevated mobile readability without overpowering */}
          <div className="pt-6 sm:pt-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 sm:p-4 bg-[#FAF9F7] rounded-xl border border-stone-200/80">
              <span className="text-xs sm:text-xs font-semibold text-[#8C6D23] block leading-tight">면허 검증</span>
              <span className="text-sm sm:text-sm font-bold text-stone-900 mt-1 block leading-snug">실내건축면허 보유</span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#FAF9F7] rounded-xl border border-stone-200/80">
              <span className="text-xs sm:text-xs font-semibold text-[#8C6D23] block leading-tight">시공 방식</span>
              <span className="text-sm sm:text-sm font-bold text-stone-900 mt-1 block leading-snug">100% 직영 감리</span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#FAF9F7] rounded-xl border border-stone-200/80">
              <span className="text-xs sm:text-xs font-semibold text-[#8C6D23] block leading-tight">견적 원칙</span>
              <span className="text-sm sm:text-sm font-bold text-stone-900 mt-1 block leading-snug">투명한 공정 관리</span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#FAF9F7] rounded-xl border border-stone-200/80">
              <span className="text-xs sm:text-xs font-semibold text-[#8C6D23] block leading-tight">사후 관리</span>
              <span className="text-sm sm:text-sm font-bold text-stone-900 mt-1 block leading-snug">철저한 A/S 보증</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT BAR (HERO IMMEDIATELY BELOW) ================= */}
      <section className="bg-[#FAF9F7] border-b border-stone-200/90 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* PC Contact Bar (Thin, elegant horizontal row with generous whitespace) */}
          <div className="hidden lg:grid grid-cols-4 items-center divide-x divide-stone-200/90 text-center">
            {/* MOBILE */}
            <div className="px-4 xl:px-6">
              <span className="text-[10px] xl:text-[11px] font-bold tracking-[0.18em] text-[#B38F4D] uppercase font-sans block mb-1">
                MOBILE
              </span>
              <a
                href="tel:010-7231-1470"
                className="text-sm xl:text-base font-semibold text-stone-950 hover:text-[#8C6D23] transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#B38F4D]" />
                <span>010-7231-1470</span>
              </a>
            </div>

            {/* TEL */}
            <div className="px-4 xl:px-6">
              <span className="text-[10px] xl:text-[11px] font-bold tracking-[0.18em] text-[#B38F4D] uppercase font-sans block mb-1">
                TEL
              </span>
              <a
                href="tel:051-806-3143"
                className="text-sm xl:text-base font-semibold text-stone-950 hover:text-[#8C6D23] transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#B38F4D]" />
                <span>051-806-3143</span>
              </a>
            </div>

            {/* EMAIL */}
            <div className="px-4 xl:px-6">
              <span className="text-[10px] xl:text-[11px] font-bold tracking-[0.18em] text-[#B38F4D] uppercase font-sans block mb-1">
                EMAIL
              </span>
              <a
                href="mailto:8063143@naver.com"
                className="text-sm xl:text-base font-semibold text-stone-950 hover:text-[#8C6D23] transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#B38F4D]" />
                <span>8063143@naver.com</span>
              </a>
            </div>

            {/* ADDRESS */}
            <div className="px-4 xl:px-6">
              <span className="text-[10px] xl:text-[11px] font-bold tracking-[0.18em] text-[#B38F4D] uppercase font-sans block mb-1">
                ADDRESS
              </span>
              <div className="text-sm xl:text-base font-medium text-stone-900 inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B38F4D]" />
                <span>{SITE_CONFIG.company.address}</span>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Contact Bar (Clean, readable 2x2 grid with high legibility & touch targets) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
            <a
              href="tel:010-7231-1470"
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs active:bg-stone-50 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#B38F4D] uppercase font-sans block">
                  MOBILE
                </span>
                <span className="text-sm font-semibold text-stone-950">010-7231-1470</span>
              </div>
              <Phone className="w-4 h-4 text-[#B38F4D]" />
            </a>

            <a
              href="tel:051-806-3143"
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs active:bg-stone-50 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#B38F4D] uppercase font-sans block">
                  TEL
                </span>
                <span className="text-sm font-semibold text-stone-950">051-806-3143</span>
              </div>
              <Phone className="w-4 h-4 text-[#B38F4D]" />
            </a>

            <a
              href="mailto:8063143@naver.com"
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs active:bg-stone-50 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#B38F4D] uppercase font-sans block">
                  EMAIL
                </span>
                <span className="text-sm font-semibold text-stone-950">8063143@naver.com</span>
              </div>
              <Mail className="w-4 h-4 text-[#B38F4D]" />
            </a>

            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-stone-200/80 shadow-xs">
              <div>
                <span className="text-[10px] font-bold tracking-[0.16em] text-[#B38F4D] uppercase font-sans block">
                  ADDRESS
                </span>
                <span className="text-sm font-medium text-stone-900">{SITE_CONFIG.company.address}</span>
              </div>
              <MapPin className="w-4 h-4 text-[#B38F4D]" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 1: 지니 인테리어 소개 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-[#8C6D23] font-bold text-xs tracking-wider uppercase bg-[#FAF6EC] px-3 py-1 rounded-full border border-[#E9D9B2]">
              <span>01. ABOUT US</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 font-sans leading-[1.35] sm:leading-[1.3] break-keep">
              부산을 중심으로 부울경까지,
              <br />
              <span className="text-stone-700">
                공간의 품격을 더하는 <span className="inline-block whitespace-nowrap">{SITE_CONFIG.brand.nameKo}</span> <span className="inline-block whitespace-nowrap">({SITE_CONFIG.brand.nameEn})</span>
              </span>
            </h2>
            <p className="text-stone-600 font-sans leading-relaxed text-sm sm:text-base break-keep">
              {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는 부산 전역을 중심으로 울산·양산·김해 등 부울경까지 최상의 실내건축과 리모델링을 선보이는 전문 공간 제작 기업입니다.
            </p>
            <p className="text-stone-600 font-sans leading-relaxed text-sm sm:text-base break-keep">
              주거용 아파트·주택 올 리모델링부터 상가·매장, 감성 카페, 사무실 인테리어까지 단순한 마감을 넘어 고객의 라이프스타일과 브랜드 가치에 부합하는 정밀 설계를 제안합니다.
            </p>

            <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200/80 space-y-2 text-xs sm:text-sm text-stone-800 font-sans">
              <div className="flex items-center gap-2 font-bold text-[#8C6D23]">
                 <ShieldCheck className="w-5 h-5 text-[#B38F4D] shrink-0" />
                <span className="break-keep">실내건축면허 보유 공식 업체</span>
              </div>
              <p className="text-stone-600 leading-normal pl-7 break-keep">
                법적 실내건축면허 기준에 근거하여 안전하고 정직하게 시공합니다. (등록 면허 정보는 시스템상에서 즉시 업데이트가 가능합니다.)
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveTab("ABOUT");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer font-sans"
              >
                <span>{SITE_CONFIG.brand.nameKo} 자세히 보기</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 group">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80"
                alt="지니 인테리어 대표 시공 공간 비주얼"
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
      <section className="bg-stone-100/80 py-16 sm:py-20 border-y border-stone-200/90">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-[#8C6D23] font-bold text-xs uppercase tracking-wider bg-[#FAF6EC] px-3 py-1 rounded-full border border-[#E9D9B2]">
              <span>02. OUR SERVICES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 font-sans leading-[1.35] sm:leading-[1.3] break-keep">
              <span className="inline-block whitespace-nowrap">{SITE_CONFIG.brand.nameKo}</span> 주요 분야
            </h2>
            <p className="text-stone-600 font-sans leading-relaxed text-sm sm:text-base break-keep">
              주거 공간부터 상업, 사무, 전체 실내건축까지 각 공간 목적에 맞는 최적의 인테리어 솔루션을 전달합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_DATA.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200/80 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group"
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
                    <div className="absolute top-3 left-3 bg-stone-950/90 text-white text-xs px-2.5 py-1 rounded-lg font-bold backdrop-blur-xs font-sans">
                      {service.title}
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 font-sans leading-relaxed font-normal break-keep">
                    {service.shortDesc}
                  </p>

                  <div className="space-y-2 pt-1 font-sans">
                    <p className="text-xs sm:text-sm font-bold text-stone-900">주요 공사 범위:</p>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-stone-600">
                      {service.scopeList.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B38F4D] shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-5 sm:pt-6">
                  <button
                    onClick={() => {
                      setActiveTab("SERVICE");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 sm:py-3 px-4 bg-stone-950 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer font-sans shadow-xs"
                  >
                    <span>서비스 상세 보기</span>
                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: 대표 시공사례 (대형 사진 포트폴리오 갤러리) ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[#8C6D23] font-bold text-xs uppercase tracking-wider bg-[#FAF6EC] px-3 py-1 rounded-full border border-[#E9D9B2]">
              <Images className="w-3.5 h-3.5 text-[#B38F4D]" />
              <span>03. RECENT PROJECTS GALLERY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 font-sans leading-[1.35] sm:leading-[1.3] break-keep">
              실제 감성을 담은 <span className="inline-block whitespace-nowrap">시공갤러리</span>
            </h2>
            <p className="text-stone-600 font-sans text-xs sm:text-sm break-keep">
              * 아래 시공사례는 {SITE_CONFIG.brand.nameKo}의 디자인 역량과 마감 퀄리티를 보여드리기 위한 [샘플 포트폴리오]입니다.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab("PROJECT");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-950 hover:bg-stone-800 text-stone-100 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-xs self-start md:self-auto border border-stone-800 active:scale-[0.98] cursor-pointer font-sans"
          >
            <span>전체 시공사례 포트폴리오 ({allProjects.length})</span>
            <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>

        {/* Featured Large Photo Showcase Box */}
        <div className="bg-stone-950 text-white rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
          {/* Top Project Selector Tabs */}
          <div className="relative bg-stone-900/90 border-b border-stone-800">
            <div className="p-2.5 sm:p-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pr-6 sm:pr-4">
              <span className="text-[11px] sm:text-xs text-amber-400 font-bold px-1.5 sm:px-2 py-1 shrink-0 flex items-center gap-1 whitespace-nowrap font-sans snap-start">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>추천 프로젝트:</span>
              </span>
              {allProjects.map((proj, idx) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setActiveFeaturedIndex(idx);
                    setShowBeforePhoto(false);
                  }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer font-sans snap-start ${
                    activeFeaturedIndex === idx
                      ? "bg-amber-500 text-stone-950 shadow-md font-black"
                      : "bg-stone-800/80 text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  {getCategoryTabLabel(proj)}
                </button>
              ))}
            </div>
            {/* Subtle right fade hint on mobile to indicate scrollability smoothly without clipping text abruptly */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-stone-900/90 to-transparent pointer-events-none sm:hidden" />
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
                      ? (featuredProject.beforeImage || featuredProject.afterImages[0])
                      : (featuredProject.afterImages[0] || featuredProject.beforeImage)
                  }
                  alt={featuredProject.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />

                {/* Gradient Vignette Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-stone-950/40 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-1.5 sm:gap-2 z-10">
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <span
                      className={`text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg whitespace-nowrap shrink-0 ${
                        featuredProject.isSample
                          ? "bg-amber-500 text-stone-950"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {featuredProject.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                    </span>
                    <span className="bg-stone-900/80 text-stone-200 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full backdrop-blur-md border border-stone-700 whitespace-nowrap shrink-0">
                      {featuredProject.category}
                    </span>
                  </div>

                  {/* Before / After Toggle Switcher Button */}
                  {featuredProject.beforeImage && (
                    <button
                      onClick={() => setShowBeforePhoto(!showBeforePhoto)}
                      className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-stone-900/90 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-[10px] sm:text-xs font-bold backdrop-blur-md shadow-lg transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                      <span className="whitespace-nowrap">{showBeforePhoto ? "✨ 완공 모습 보기" : "🏚️ 시공 전 상태 보기"}</span>
                    </button>
                  )}
                </div>

                {/* Bottom Overlay Info on Photo */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold font-sans">
                      <span>{featuredProject.area}</span>
                      {featuredProject.duration && <span>•</span>}
                      {featuredProject.duration && <span>{featuredProject.duration}</span>}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-sans drop-shadow-md break-keep">
                      {featuredProject.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onSelectProject(featuredProject)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs transition-all shadow-xl shrink-0 font-sans cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>큰 사진 전체보기</span>
                  </button>
                </div>
              </div>

              {/* Thumbnail Strip underneath Main Photo */}
              <div className="p-3 bg-stone-950 border-t border-stone-800/80 flex items-center gap-3 overflow-x-auto scrollbar-none">
                <span className="text-[11px] text-stone-400 font-medium shrink-0 px-1 font-sans">
                  갤러리 사진 {(featuredProject.afterImages?.length || 0) + (featuredProject.beforeImage ? 1 : 0)}장:
                </span>
                {featuredProject.beforeImage && (
                  <button
                    onClick={() => setShowBeforePhoto(true)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      showBeforePhoto ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={featuredProject.beforeImage} alt="시공전" className="w-full h-full object-cover filter grayscale" />
                    <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] text-center text-stone-300 font-bold py-0.5 font-sans">시공전</span>
                  </button>
                )}
                {featuredProject.afterImages?.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setShowBeforePhoto(false)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      !showBeforePhoto && i === 0 ? "border-amber-400 ring-2 ring-amber-400/50" : "border-stone-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt={`완공${i+1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[9px] text-center text-amber-300 font-bold py-0.5 font-sans">완공컷 {i+1}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Key Details & Features (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-800 bg-stone-900/60 space-y-6">
              <div className="space-y-5">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-sans">
                    {featuredProject.spaceTypeDetail}
                  </span>
                  <h4 className="text-lg font-bold text-white font-sans break-keep">
                    시공 핵심 포인트 & 고객 요청
                  </h4>
                </div>

                {featuredProject.clientRequest && (
                  <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 font-sans">
                    <p className="text-xs text-amber-300 font-bold">고객 요청사항:</p>
                    <p className="text-xs text-stone-300 leading-relaxed italic break-keep">
                      "{featuredProject.clientRequest}"
                    </p>
                  </div>
                )}

                {featuredProject.keyFeatures && featuredProject.keyFeatures.length > 0 && (
                  <div className="space-y-2 font-sans">
                    <p className="text-xs text-stone-400 font-bold">핵심 시공 공정:</p>
                    <ul className="space-y-2">
                      {featuredProject.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-stone-200">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="break-keep">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-stone-400 font-sans leading-relaxed pt-2 break-keep">
                  {featuredProject.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-800 space-y-3 font-sans">
                <Link
                  to={`/projects/${featuredProject.slug || featuredProject.id}`}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 text-inherit no-underline"
                >
                  <Eye className="w-4 h-4" />
                  <span>이 시공사례 상세스펙 & 도면 확인</span>
                </Link>
                <button
                  onClick={openContactModal}
                  className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs transition-all border border-stone-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>비슷한 평수 무료 방문 실측 신청</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Project Cards Grid (With Enlarged Photos: h-72 sm:h-80) */}
        <div className="space-y-6 pt-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-stone-900 font-sans break-keep">
              기타 주요 시공 포트폴리오
            </h3>
            <span className="text-xs text-stone-500 font-sans">
              이미지를 클릭하면 상세 사진과 시공 스펙을 보실 수 있습니다
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.slug || project.id}`}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 block text-inherit no-underline"
              >
                <div>
                  {/* Large High-Impact Image Box (h-72 sm:h-80) */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-stone-950">
                    <img
                      src={project.afterImages?.[0] || project.beforeImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Category & Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10 font-sans">
                      <span
                        className={`text-[11px] font-black px-3 py-1 rounded-full shadow ${
                          project.isSample
                            ? "bg-amber-500 text-stone-950"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {project.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                      </span>
                      <span className="bg-stone-900/90 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-semibold border border-stone-700">
                        {project.category}
                      </span>
                    </div>

                    {/* Photo Count Pill */}
                    <div className="absolute top-4 right-4 bg-stone-900/80 text-amber-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-500/30 font-semibold flex items-center gap-1 font-sans">
                      <Images className="w-3.5 h-3.5" />
                      <span>{(project.afterImages?.length || 0) + (project.beforeImage ? 1 : 0)}장</span>
                    </div>

                    {/* Bottom overlay text */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1 font-sans">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold font-sans">
                        <span>{project.area}</span>
                        {project.duration && <span>•</span>}
                        {project.duration && <span>{project.duration}</span>}
                      </div>
                      <h4 className="text-lg font-bold text-white font-sans line-clamp-1 group-hover:text-amber-300 transition-colors break-keep">
                        {project.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-6 space-y-3 font-sans">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed break-keep">
                      {project.description}
                    </p>
                    {project.scope && (
                      <div className="flex items-center gap-2 text-xs text-stone-500 pt-1">
                        <span className="font-semibold text-stone-800">주요공정:</span>
                        <span className="truncate">{project.scope}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between text-xs text-stone-900 font-extrabold group-hover:text-amber-600 transition-colors font-sans">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>시공 사진 크게보기 & 세부스펙</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: 지니 인테리어의 강점 ================= */}
      <section className="bg-stone-950 text-white py-16 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/60 font-sans">
              04. OUR STRENGTHS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans break-keep">
              왜 {SITE_CONFIG.brand.nameKo}를 선택해야 할까요?
            </h2>
            <p className="text-stone-400 font-sans text-sm sm:text-base break-keep">
              실내건축 면허 보유 업체의 높은 신뢰도와 부산 및 부울경 권역에 최적화된 시공 노하우를 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">실내건축면허 보유</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-sans break-keep">
                법령 기준을 준수하는 공식 실내건축 면허업체로서 정밀 시공 및 하자에 대한 명확한 사후관리를 보증합니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">부산 및 부울경 시공 전문성</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-sans break-keep">
                부산 전역을 중심으로 울산·양산·김해 등 부울경 권역의 건축물 특성과 아파트·상가 관리규정을 숙지하여 공사를 효율적으로 진행합니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">투명한 견적 및 소통</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-sans break-keep">
                자재별 세부 공정 내역서를 투명하게 공개하며, 불필요한 추가금 청구 없는 깔끔한 약속을 지킵니다.
              </p>
            </div>

            <div className="bg-stone-900 p-6 rounded-2xl border border-stone-800 space-y-4 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/20">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-sans">책임감리 & A/S 보증</h3>
              <p className="text-xs text-stone-400 leading-relaxed font-sans break-keep">
                현장 소장의 1:1 상주 책임감리와 완공 후에도 신속한 A/S 처리 시스템으로 고객 만족을 유지합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: 공사 진행 과정 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto font-sans">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            05. PROCESS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-sans break-keep">
            체계적인 공사 진행 6단계
          </h2>
          <p className="text-stone-600 text-sm font-sans break-keep">
            상담부터 완공 A/S까지 체계적이고 구체적인 단계별 진행으로 안심하고 맡기실 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {[
            { step: "01", title: "상담 및 현장 실측", desc: "무료 방문을 통한 부산 및 부울경 현장 정밀 실측 및 공간 니즈 파악" },
            { step: "02", title: "기획 및 디자인 설계", desc: "고객 취향에 맞춘 도면 및 동선 레이아웃 세부 제안" },
            { step: "03", title: "투명 견적 산출", desc: "공정별/자재별 투명한 세부 견적서 발급 및 계약" },
            { step: "04", title: "자재 선정 및 착공", desc: "타일, 마루, 도배, 조명 자재 샘플 확정 및 착공" },
            { step: "05", title: "책임 시공 및 감리", desc: "실내건축 면허 전문가의 일별 현장 공정 감독 및 소통" },
            { step: "06", title: "완공 검수 및 A/S", desc: "고객 입회 최종 검수, 준공 청소 및 사후 보증 관리" },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative space-y-2 font-sans"
            >
              <div className="text-3xl font-extrabold text-amber-500 font-sans">
                STEP {item.step}
              </div>
              <h3 className="text-base font-bold text-stone-900 font-sans">{item.title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-sans break-keep">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECTION 6: 시공 사례 & 고객 경험 ================= */}
      <section className="bg-stone-100 py-16 border-y border-stone-200 font-sans">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-sans">
              06. REVIEWS & CASE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-sans break-keep">
              시공 사례 & 고객 경험
            </h2>
            <p className="text-stone-600 text-sm font-sans break-keep">
              부산을 중심으로 경남·울산까지 다양한 공간의 시공 경험을 쌓아가고 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {[
              {
                categoryTag: "주거 리모델링",
                title: "30평대 아파트 올 리모델링",
                content:
                  "실내건축 면허 보유 업체의 전문적인 설계와 투명한 공정 관리로 완성도 높은 주거 공간을 구현했습니다. 깔끔한 마감과 섬세한 조명 라인이 돋보이는 시공 사례입니다.",
                clientType: "30평대 주거 공간 고객 상담 예시",
              },
              {
                categoryTag: "상업 공간 인테리어",
                title: "디저트 카페 & F&B 매장 시공",
                content:
                  "상업 공간의 핵심인 공사 일정을 철저히 준수하고, 원목 카운터와 감성적인 공간 무드를 결합하여 브랜드 아이덴티티를 극대화한 상가 인테리어 사례입니다.",
                clientType: "F&B 카페 상업 공간 상담 예시",
              },
              {
                categoryTag: "업무 공간 인테리어",
                title: "오피스 사무실 가벽 & 방음 공사",
                content:
                  "세부 자재 내역과 투명한 견적을 바탕으로 업무 동선에 맞춘 가벽 분할 및 방음 시공을 진행하여 실용적이고 쾌적한 비즈니스 환경을 완성했습니다.",
                clientType: "오피스 업무 공간 상담 예시",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 font-sans flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80 font-sans">
                      {item.categoryTag}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded font-sans">
                      시공 상담 예시
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 font-sans">{item.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-normal font-sans break-keep">
                    {item.content}
                  </p>
                </div>
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-[11px] font-medium text-stone-400 font-sans">
                    {item.clientType}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 7: 부산 지역 서비스 안내 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8 font-sans">
        <div className="bg-stone-900 text-stone-100 p-8 sm:p-12 rounded-3xl border border-stone-800 space-y-6">
          <div className="space-y-2">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-950 px-3 py-1 rounded-full border border-amber-800 font-sans">
              07. LOCATION & REGION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-sans text-white break-keep">
              부산 중심 · 경남 · 울산 출장 실측
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed font-sans break-keep">
              {SITE_CONFIG.brand.nameKo}는 부산을 중심으로 경남·울산까지 현장 실측 및 맞춤 견적 서비스를 제공합니다. 부산 전역은 물론 양산·김해 등 인접 경남 지역과 울산 지역도 프로젝트 상담이 가능합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm font-sans">
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between gap-2 font-sans">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white whitespace-nowrap">부산 전역</span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium px-2 py-0.5 bg-amber-950/60 rounded border border-amber-800/50 whitespace-nowrap shrink-0">
                핵심 영업지역
              </span>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between gap-2 font-sans">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white whitespace-nowrap">경남</span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap shrink-0">
                양산 · 김해 등
              </span>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex items-center justify-between gap-2 font-sans">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-white whitespace-nowrap">울산</span>
              </div>
              <span className="text-[11px] text-stone-400 font-medium whitespace-nowrap shrink-0">
                울산 전역
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-stone-800 text-xs font-sans">
            <span className="text-stone-400">
              * 위치 주소: {SITE_CONFIG.company.address} {SITE_CONFIG.company.addressDetail}
            </span>
            <a
              href={SITE_CONFIG.company.naverPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 rounded-lg font-bold border border-emerald-700/60 font-sans"
            >
              <span>네이버 지도에서 위치 확인</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ================= SECTION 8: AI 상담·견적 위젯 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 font-sans">
        <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 p-8 sm:p-12 rounded-3xl border border-amber-500/30 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl font-sans">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30 font-sans">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>08. AI SMART ESTIMATE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-sans break-keep">
              내 공간 예상 인테리어 비용,
              <br /> AI로 1분 만에 확인해보세요!
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans break-keep">
              공간 유형(아파트, 상가, 카페 등), 면적, 스타일을 선택하시면 AI가 적정 공사 범위와 예상 비용 및 공사기간을 종합 안내해 드립니다.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                setActiveTab("AI_ESTIMATE");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold rounded-2xl text-sm sm:text-base transition-all shadow-xl flex items-center gap-2 active:scale-95 cursor-pointer font-sans"
            >
              <Calculator className="w-5 h-5" />
              <span>AI 상담·견적 바로가기</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 9: 문의하기 미리보기 ================= */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 space-y-8 font-sans">
        <div className="text-center space-y-2 font-sans">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200 font-sans">
            09. CONTACT US
          </span>
          <h2 className="text-3xl font-extrabold text-stone-900 font-sans break-keep">
            현장 실측 및 상담 문의
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-sans break-keep">
            궁금하신 점이 있으시다면 언제든지 {SITE_CONFIG.brand.nameKo}로 연락 주시기 바랍니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto font-sans">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3 shadow-sm flex flex-col justify-between font-sans">
            <div className="space-y-2">
              <Phone className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-base font-sans">전화 빠른 상담</h3>
              <p className="text-xs text-stone-600 font-sans">
                상담 대표번호: <strong className="text-stone-900">{SITE_CONFIG.company.phoneDisplay}</strong>
              </p>
            </div>
            <a
              href={`tel:${SITE_CONFIG.company.phone}`}
              className="w-full min-h-[44px] py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 font-sans"
            >
              <Phone className="w-4 h-4 shrink-0 text-white" />
              <span>📞 지금 바로 전화 상담</span>
            </a>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 text-center space-y-3 shadow-sm flex flex-col justify-between font-sans">
            <div className="space-y-2">
              <Calendar className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-bold text-stone-900 text-base font-sans">온라인 무료 실측</h3>
              <p className="text-xs text-stone-600 font-sans">
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
