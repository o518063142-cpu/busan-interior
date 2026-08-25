import React from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import {
  ShieldCheck,
  CheckCircle2,
  Building,
  MapPin,
  Phone,
  Mail,
  Award,
  Users,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface AboutPageProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      <MetaManager
        title="회사소개｜부산진구 전포동 실내건축공사업 지니 인테리어 (GENE INTERIOR)"
        description="지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어) 소개. 실내건축공사업 등록업체, 부산진구 전포동·서면 직영 시공. 공간의 가치를 높이는 1:1 맞춤 설계 및 정직한 시공."
        canonicalPath="/about"
      />
      <StructuredData
        type="page"
        title="회사소개 | 지니 인테리어"
        description="부산진구 전포동 실내건축공사업 등록업체 지니 인테리어 회사소개"
        path="/about"
      />
      {/* Top Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>{SITE_CONFIG.legal.licenseStatus}</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
            {SITE_CONFIG.brand.nameKo} 소개
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-600 uppercase font-sans">
            {SITE_CONFIG.brand.nameEn}
          </p>
        </div>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          부산진구 전포동에 거점을 둔 {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는
          공간의 미학적 아름다움과 내구성, 실용성을 겸비한
          전문 실내건축 종합 리모델링 기업입니다.
        </p>
      </div>

      {/* Main Philosophy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">
            PHILOSOPHY & VALUE
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif leading-tight">
            "정직한 설계와 정밀 시공으로
            <br />
            고객의 삶과 비즈니스 가치를 높입니다."
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는 부산 부산진구 전포동, 서면 지역의 아파트, 단독주택 주거 공간과 상가, 카페, 사무실 등 다양한 인테리어 현장에서 쌓아온 축적된 기술력을 바탕으로 운영됩니다.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed">
            단순히 겉모습만 꾸미는 인테리어가 아닌, 기초 단열 및 철거, 소방 법규 준수, 동선 효율화, 내구성 높은 자재 사용까지 실내건축 면허업체다운 책임감 있는 정석 시공을 원칙으로 삼고 있습니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">1:1 디자인 맞춤 제안</span>
              <span className="text-stone-500">고객의 라이프스타일과 브랜드 정체성 반영</span>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">투명한 공정별 내역서</span>
              <span className="text-stone-500">불필요한 과다 견적 방지 및 정직한 자재 선정</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"
              alt={`${SITE_CONFIG.brand.nameKo} 시공 철학`}
              className="w-full h-80 object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* License Notice Box */}
      <div className="bg-stone-950 text-white p-8 sm:p-10 rounded-3xl border border-stone-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">실내건축공사업 면허 안내</h3>
            <p className="text-xs text-amber-400 font-semibold">
              법적 기준을 준수하는 공식 전문 실내건축 기업
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는 부산진구 전포동에 위치한 전문 실내건축 리모델링 기업(법적 상호: {SITE_CONFIG.legal.businessName})입니다.
          공식 등록 정보를 바탕으로 제공되며, 사용자분께서 직접 제공하지 않은 정보는 임의 추측하여 작성하지 않는 원칙을 엄격히 준수합니다.
        </p>
      </div>

      {/* Company Profile Table */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="border-b border-stone-200 pb-4">
          <h3 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <span>기업 및 사업자 공식 정보 (Company Profile)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            * 서비스 브랜드명과 공식 사업자 등록 정보가 분리되어 투명하게 제공됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-1">
            <span className="text-amber-800 text-xs font-semibold block">서비스 브랜드명</span>
            <span className="font-bold text-stone-900 text-base">{SITE_CONFIG.brand.displayName}</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">법적 상호명</span>
            <span className="font-bold text-stone-900 text-base">{SITE_CONFIG.legal.businessName}</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">업종</span>
            <span className="font-bold text-stone-900 text-base">{SITE_CONFIG.legal.industry}</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">면허 사항</span>
            <span className="font-bold text-amber-700 text-base">
              {SITE_CONFIG.legal.licenseStatus} ({SITE_CONFIG.legal.licenseNumber})
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">사업자등록번호</span>
            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.businessNumber}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">대표자명</span>
            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.representative}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">대표 연락처</span>
            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.company.phoneDisplay}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">소재지 주소</span>
            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.address} {SITE_CONFIG.legal.addressDetail}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
          <a
            href={SITE_CONFIG.company.naverPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold rounded-xl text-xs transition-all"
          >
            <span>네이버 플레이스 지도 및 리뷰 보기</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={openContactModal}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
          >
            무료 현장 실측 상담 신청
          </button>
        </div>
      </div>
    </div>
  );
};
