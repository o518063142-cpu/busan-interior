import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { SITE_CONFIG, SITE_ENTITY } from "../config/siteConfig";
import { db } from "../firebase";
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

interface RuntimeSiteSettings {
  phone: string;
  mobilePhone: string;
  email: string;
  address: string;
  addressDetail: string;
  operatingHours: string;
  closedDays: string;
  naverPlace: string;
}

const DEFAULT_SETTINGS: RuntimeSiteSettings = {
  phone: SITE_CONFIG.company.phone,
  mobilePhone: SITE_CONFIG.company.mobilePhone,
  email: "8063143@naver.com",
  address: SITE_CONFIG.company.address,
  addressDetail: SITE_CONFIG.company.addressDetail,
  operatingHours: SITE_CONFIG.company.operatingHours,
  closedDays: SITE_CONFIG.company.closedDays,
  naverPlace:
    SITE_ENTITY.socialLinks.naverPlace ||
    SITE_CONFIG.company.naverPlaceUrl ||
    "",
};

export const Footer: React.FC<FooterProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  const [siteSettings, setSiteSettings] =
    useState<RuntimeSiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const settingsRef = doc(db, "siteSettings", "main");

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSiteSettings(DEFAULT_SETTINGS);
          return;
        }

        const data = snapshot.data();

        setSiteSettings({
          phone: data.phone || DEFAULT_SETTINGS.phone,
          mobilePhone: data.mobilePhone || DEFAULT_SETTINGS.mobilePhone,
          email: data.email || DEFAULT_SETTINGS.email,
          address: data.address || DEFAULT_SETTINGS.address,
          addressDetail: data.addressDetail || DEFAULT_SETTINGS.addressDetail,
          operatingHours:
            data.operatingHours || DEFAULT_SETTINGS.operatingHours,
          closedDays: data.closedDays || DEFAULT_SETTINGS.closedDays,
          naverPlace: data.naverPlace || DEFAULT_SETTINGS.naverPlace,
        });
      },
      (error) => {
        console.error("Footer 사이트 설정 불러오기 오류:", error);
        setSiteSettings(DEFAULT_SETTINGS);
      }
    );

    return () => unsubscribe();
  }, []);

  const phoneDisplay = [siteSettings.phone, siteSettings.mobilePhone]
    .filter(Boolean)
    .join(" / ");

  const quickLinks: {
    path: string;
    label: string;
    tabId?: NavigationMenu;
  }[] = [
    { path: "/", label: "HOME", tabId: "HOME" },
    { path: "/about", label: "ABOUT", tabId: "ABOUT" },
    { path: "/service", label: "SERVICE", tabId: "SERVICE" },
    { path: "/projects", label: "PROJECT", tabId: "PROJECT" },
    {
      path: "/information",
      label: "INFORMATION",
      tabId: "INFORMATION",
    },
    { path: "/trust", label: "안심 시공" },
    {
      path: "/ai-estimate",
      label: "AI 상담·견적",
      tabId: "AI_ESTIMATE",
    },
    { path: "/contact", label: "CONTACT", tabId: "CONTACT" },
    { path: "/admin", label: "상담 관리자", tabId: "ADMIN" },
  ];

  const footerServiceTags = [
    "지니인테리어",
    "지니 인테리어",
    "GENEINTERIOR",
    "부산인테리어",
    "동래구인테리어",
    "명륜동인테리어",
    "부산아파트리모델링",
    "부산실내건축",
    "부산상가인테리어",
    "부산사무실인테리어",
    "부산학교인테리어",
    "경남인테리어",
    "울산인테리어",
  ];

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-12 pb-24 md:pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 pb-10 border-b border-stone-800/80">
          {/* Company Identity */}
          <div className="space-y-4 font-sans">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white tracking-tight font-sans">
                {SITE_CONFIG.brand.nameKo}
              </span>

              <span className="text-xs font-semibold tracking-widest text-amber-400 font-sans uppercase">
                {SITE_CONFIG.brand.nameEn}
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed font-sans">
              부산 동래구 명륜동에 위치한 지니 인테리어(GENE INTERIOR).
              아파트·주택 리모델링부터 상가·사무실·학교·교육시설까지
              실내건축·인테리어 공사를 진행합니다.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 text-amber-400 border border-amber-800/50 rounded text-xs font-semibold font-sans">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{SITE_CONFIG.company.licenseStatus}</span>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-400" />
              <span>업체 정보</span>
            </h4>

            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  주소: {siteSettings.address} {siteSettings.addressDetail}
                </span>
              </li>

              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>대표전화: {phoneDisplay}</span>
              </li>

              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>이메일: {siteSettings.email}</span>
              </li>

              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  영업시간: {siteSettings.operatingHours} (
                  {siteSettings.closedDays})
                </span>
              </li>
            </ul>
          </div>

          {/* Registration Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">
              등록 및 면허 정보
            </h4>

            <div className="space-y-1.5 text-xs text-stone-400 bg-stone-900/60 p-3 rounded-lg border border-stone-800">
              <p>
                <strong className="text-stone-300">상호명:</strong>{" "}
                {SITE_CONFIG.legal.businessName}
              </p>

              <p>
                <strong className="text-stone-300">대표자:</strong>{" "}
                {SITE_CONFIG.legal.representative}
              </p>

              <p>
                <strong className="text-stone-300">
                  사업자등록번호:
                </strong>{" "}
                {SITE_CONFIG.legal.businessNumber}
              </p>

              <p>
                <strong className="text-stone-300">
                  실내건축공사업 등록:
                </strong>{" "}
                {SITE_CONFIG.legal.licenseNumber}
              </p>

              <p className="text-[11px] text-amber-400/90 pt-1 border-t border-stone-800 leading-normal">
                * 지니인테리어(법적 상호) / 지니 인테리어(GENE
                INTERIOR, 서비스 브랜드) 공식 정보 기준입니다.
              </p>
            </div>

            <a
              href={siteSettings.naverPlace}
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
                      if (m.tabId && setActiveTab) {
                        setActiveTab(m.tabId);
                      }

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
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
                현장 실측·견적 상담 신청하기
              </button>
            </div>
          </div>
        </div>

        {/* Regional & Service Tags Footer */}
        <div className="mb-6 pt-2">
          <p className="text-[11px] font-semibold text-stone-400 mb-2 font-sans">
            주요 서비스 지역 및 분야:
          </p>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-400 font-sans">
            {footerServiceTags.map((kw, idx) => (
              <span
                key={idx}
                className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 hover:border-stone-700 text-stone-400 font-sans"
              >
                #{kw}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 pt-4 border-t border-stone-900 gap-2 font-sans">
          <p>
            © {new Date().getFullYear()} {SITE_CONFIG.brand.nameEn} (
            {SITE_CONFIG.legal.businessName}). All rights reserved.
          </p>

          <p className="text-stone-400 text-[11px] font-sans">
            부산 동래구 명륜동 · 부산 전 지역 · 경남·울산
            실내건축·인테리어·리모델링
          </p>
        </div>
      </div>
    </footer>
  );
};
