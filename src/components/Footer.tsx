import React from "react";
import { Link } from "react-router-dom";
import { SITE_CONFIG, SITE_ENTITY } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Building,
} from "lucide-react";

interface FooterProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, openContactModal }) => {
  const quickLinks: { path: string; label: string; tabId?: NavigationMenu }[] = [
    { path: "/", label: "HOME", tabId: "HOME" },
    { path: "/about", label: "ABOUT", tabId: "ABOUT" },
    { path: "/service", label: "SERVICE", tabId: "SERVICE" },
    { path: "/projects", label: "PROJECT", tabId: "PROJECT" },
    { path: "/information", label: "INFORMATION", tabId: "INFORMATION" },
    { path: "/trust", label: "안심 시공" },
    { path: "/ai-estimate", label: "AI 상담·견적", tabId: "AI_ESTIMATE" },
    { path: "/contact", label: "CONTACT", tabId: "CONTACT" },
    { path: "/admin", label: "상담 관리자", tabId: "ADMIN" },
  ];

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-24 md:pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 pb-10 border-b border-stone-800/80">
          {/* Company Identity */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight font-serif">
                {SITE_CONFIG.brand.nameKo}
              </span>
              <span className="text-xs font-semibold tracking-widest text-amber-400 font-sans uppercase">
                {SITE_CONFIG.brand.nameEn}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              부산진구 전포동 실내건축·인테리어 전문 지니 인테리어(GENE INTERIOR). 아파트, 주택, 상가, 매장, 카페, 사무실 리모델링 및 실내건축 책임시공.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{SITE_CONFIG.company.licenseStatus}</span>
            </div>
          </div>

          {/* Quick Contact & Placeholders */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              <span>업체 정보</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  주소: {SITE_CONFIG.company.address} {SITE_CONFIG.company.addressDetail}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>대표전화: {SITE_CONFIG.company.phoneDisplay}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>이메일: {SITE_CONFIG.company.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  영업시간: {SITE_CONFIG.company.operatingHours} ({SITE_CONFIG.company.closedDays})
                </span>
              </li>
            </ul>
          </div>

          {/* Registration & Placeholders Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              등록 및 면허 정보
            </h4>
            <div className="space-y-1.5 text-xs text-stone-400 bg-stone-900/60 p-3 rounded-lg border border-stone-800">
              <p>
                <strong className="text-stone-300">상호명:</strong> {SITE_CONFIG.legal.businessName}
              </p>
              <p>
                <strong className="text-stone-300">대표자:</strong> {SITE_CONFIG.legal.representative}
              </p>
              <p>
                <strong className="text-stone-300">사업자등록번호:</strong> {SITE_CONFIG.legal.businessNumber}
              </p>
              <p>
                <strong className="text-stone-300">실내건축공사업 면허:</strong> {SITE_CONFIG.legal.licenseNumber}
              </p>
              <p className="text-[11px] text-amber-400/90 pt-1 border-t border-stone-800 leading-normal">
                * 한신인테리어(법적 상호) / 지니 인테리어(서비스 브랜드) 공식 정보 기준을 반영하고 있습니다.
              </p>
            </div>
            <a
              href={SITE_CONFIG.company.naverPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-xs font-bold transition-all shadow-sm"
            >
              <span>네이버 플레이스 연결 (지도·리뷰)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Menu & Action */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              빠른 링크 & 상담
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs">
              {quickLinks.map((m) => (
                <li key={m.path}>
                  <Link
                    to={m.path}
                    onClick={() => {
                      if (m.tabId && setActiveTab) setActiveTab(m.tabId);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 text-stone-300"
                  >
                    <ChevronRight className="w-3 h-3 text-stone-500" />
                    <span>{m.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="pt-2">
              <button
                onClick={openContactModal}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs transition-all shadow text-center cursor-pointer"
              >
                무료 현장 실측 신청하기
              </button>
            </div>
          </div>
        </div>

        {/* Busan Regional SEO Tags Footer */}
        <div className="mb-6 pt-2">
          <p className="text-[11px] font-semibold text-stone-400 mb-2">
            주요 서비스 부산 지역 안내:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-400">
            {SITE_CONFIG.seo.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 hover:border-stone-700 text-stone-400"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-900 gap-2">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.brand.nameEn} ({SITE_CONFIG.legal.businessName}). All rights reserved.
          </p>
          <p className="text-stone-400 text-[11px]">
            부산진구 전포동 · 서면 실내건축 · 리모델링 전문 공식 홈페이지
          </p>
        </div>
      </div>
    </footer>
  );
};
