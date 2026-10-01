import React from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { useSiteSettings } from "../hooks/useSiteSettings";
import { NavigationMenu } from "../types";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import {
  ShieldCheck,
  Building,
  Award,
  ExternalLink,
} from "lucide-react";

interface AboutPageProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  const { settings: siteSettings, phoneDisplay, fullAddress } =
    useSiteSettings();

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      <MetaManager
        title="회사소개 (ABOUT)｜부산 실내건축공사업 등록업체 지니 인테리어"
        description="부산 동래구 명륜동 지니 인테리어(GENE INTERIOR / 법적상호: 지니인테리어) 소개. 실내건축공사업 등록업체로 부산을 중심으로 경남·울산까지 주거·상업·교육시설 인테리어와 리모델링을 진행합니다."
        canonicalPath="/about"
      />

      <StructuredData
        type="page"
        title="회사소개 | 지니 인테리어"
        description="부산 동래구 명륜동 실내건축공사업 등록업체 지니 인테리어 회사소개"
        path="/about"
      />

      {/* Top Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>{SITE_CONFIG.legal.licenseStatus}</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-sans break-keep">
            {SITE_CONFIG.brand.nameKo} 소개
          </h1>

          <p className="text-xs sm:text-sm font-semibold tracking-widest text-amber-600 uppercase font-sans">
            {SITE_CONFIG.brand.nameEn}
          </p>
        </div>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans break-keep">
          부산 동래구 명륜동에 위치한 {SITE_CONFIG.brand.nameKo}(
          {SITE_CONFIG.brand.nameEn})는 주거·상업·교육시설의
          실내건축·인테리어·리모델링을 진행하는 실내건축공사업
          등록업체입니다.
        </p>
      </div>

      {/* Main Philosophy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm font-sans">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-amber-600 font-bold text-xs uppercase tracking-wider font-sans">
            PHILOSOPHY & VALUE
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-sans leading-tight break-keep">
            "정직한 설계와 정밀 시공으로
            <br />
            고객의 삶과 비즈니스 가치를 높입니다."
          </h2>

          <p className="text-stone-600 text-sm leading-relaxed font-sans break-keep">
            {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는 부산
            전역을 중심으로 경남·울산까지 아파트·주택 등 주거공간과
            상가·매장·사무실, 학교·교육시설 등 다양한 공간의
            실내건축·인테리어·리모델링을 진행합니다.
          </p>

          <p className="text-stone-600 text-sm leading-relaxed font-sans break-keep">
            단순히 공간의 겉모습을 바꾸는 데 그치지 않고 현장 상태와
            구조, 동선, 사용 목적, 자재의 내구성과 유지관리까지
            종합적으로 검토하여 공간에 맞는 공사 계획을 제안합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-sans">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">
                1:1 맞춤 제안
              </span>
              <span className="text-stone-500">
                공간의 사용 목적과 고객의 요구사항을 반영한 공사 계획
              </span>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <span className="font-bold text-stone-900 block">
                공정별 견적 안내
              </span>
              <span className="text-stone-500">
                현장 조건과 공사 범위에 맞춘 세부 공정 및 자재 검토
              </span>
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
      <div className="bg-stone-950 text-white p-8 sm:p-10 rounded-3xl border border-stone-800 space-y-4 font-sans">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Award className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white font-sans">
              실내건축공사업 등록 안내
            </h3>

            <p className="text-xs text-amber-400 font-semibold font-sans">
              실내건축공사업 등록업체의 공식 사업자 정보
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans break-keep">
          {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})는 부산
          동래구 명륜동에 위치한 실내건축·인테리어·리모델링 업체이며,
          법적 상호는 {SITE_CONFIG.legal.businessName}입니다. 아래 기업
          정보는 공식 사업자 정보를 기준으로 안내합니다.
        </p>
      </div>

      {/* Company Profile Table */}
      <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 font-sans">
        <div className="border-b border-stone-200 pb-4">
          <h3 className="text-xl font-bold text-stone-900 font-sans flex items-center gap-2">
            <Building className="w-5 h-5 text-amber-600" />
            <span>기업 및 사업자 공식 정보 (Company Profile)</span>
          </h3>

          <p className="text-xs text-stone-500 mt-1">
            * 서비스 브랜드명과 공식 사업자 정보를 구분하여 안내합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-1">
            <span className="text-amber-800 text-xs font-semibold block">
              서비스 브랜드명
            </span>

            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.brand.displayName}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              법적 상호명
            </span>

            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.businessName}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">업종</span>

            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.industry}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              실내건축공사업
            </span>

            <span className="font-bold text-amber-700 text-base">
              {SITE_CONFIG.legal.licenseStatus} (
              {SITE_CONFIG.legal.licenseNumber})
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              사업자등록번호
            </span>

            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.businessNumber}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              대표자명
            </span>

            <span className="font-bold text-stone-900 text-base">
              {SITE_CONFIG.legal.representative}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              대표 연락처
            </span>

            <span className="font-bold text-stone-900 text-base">
              {phoneDisplay}
            </span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
            <span className="text-stone-400 text-xs block">
              소재지 주소
            </span>

            <span className="font-bold text-stone-900 text-base">
              {fullAddress}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
          <a
            href={siteSettings.naverPlace}
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
            현장 실측·견적 상담 신청
          </button>
        </div>
      </div>
    </div>
  );
};
