import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import {
  Phone,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Calculator,
  Home,
  Info,
  Briefcase,
  Images,
  FileText,
  MessageSquare,
  UserCheck,
  Shield,
} from "lucide-react";

interface HeaderProps {
  activeTab?: NavigationMenu;
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  openContactModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: {
    id: NavigationMenu | "TRUST";
    path: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[] = [
    { id: "HOME", path: "/", label: "HOME", icon: <Home className="w-4 h-4" /> },
    { id: "ABOUT", path: "/about", label: "ABOUT", icon: <Info className="w-4 h-4" /> },
    { id: "SERVICE", path: "/service", label: "SERVICE", icon: <Briefcase className="w-4 h-4" /> },
    { id: "PROJECT", path: "/projects", label: "PROJECT", icon: <Images className="w-4 h-4" /> },
    { id: "INFORMATION", path: "/information", label: "INFORMATION", icon: <FileText className="w-4 h-4" /> },
    { id: "TRUST", path: "/trust", label: "안심 시공", icon: <Shield className="w-4 h-4 text-amber-400" /> },
    {
      id: "AI_ESTIMATE",
      path: "/ai-estimate",
      label: "AI 상담·견적",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      badge: "AI 추천",
    },
    { id: "CONTACT", path: "/contact", label: "CONTACT", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "ADMIN", path: "/admin", label: "상담 관리", icon: <UserCheck className="w-4 h-4 text-amber-400" /> },
  ];

  const isItemActive = (path: string, id: string) => {
    if (location.pathname === path) return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    if (activeTab && activeTab === id) return true;
    return false;
  };

  const handleNavClick = (path: string, tabId: any) => {
    if (setActiveTab) setActiveTab(tabId);
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-xl transition-all">
      {/* Top Banner Bar */}
      <div className="bg-stone-950 text-stone-300 text-xs py-2 px-4 border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              {SITE_CONFIG.company.licenseStatus}
            </span>
            <span className="hidden md:inline text-stone-400">|</span>
            <span className="text-stone-300 hidden md:inline">
              부산진구 · 전포동 · 서면 · 부산 전 지역 전문
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {SITE_CONFIG.company.phone ? (
              <a
                href={`tel:${SITE_CONFIG.company.phone}`}
                className="flex items-center gap-1.5 text-stone-200 hover:text-amber-400 transition-colors font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>전화상담 {SITE_CONFIG.company.phoneDisplay}</span>
              </a>
            ) : (
              <a
                href={SITE_CONFIG.company.naverPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>네이버 플레이스 정보</span>
              </a>
            )}
            <span className="text-stone-600">|</span>
            <span className="text-stone-400 hidden sm:inline">
              {SITE_CONFIG.company.operatingHours}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => {
            if (setActiveTab) setActiveTab("HOME");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-left group flex items-baseline gap-2.5 focus:outline-none"
        >
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors font-serif">
                {SITE_CONFIG.brand.nameKo}
              </span>
              <span className="text-xs lg:text-sm font-semibold tracking-widest text-amber-400/90 font-sans uppercase">
                {SITE_CONFIG.brand.nameEn}
              </span>
            </div>
            <span className="text-[11px] lg:text-xs text-stone-400 font-medium tracking-wider">
              부산진구 전포동 · 서면 실내건축 리모델링
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden xl:flex items-center space-x-1 lg:space-x-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item.path, item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path, item.id)}
                className={`relative px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? "text-amber-400 bg-stone-800/80 shadow-inner"
                    : "text-stone-300 hover:text-white hover:bg-stone-800/40"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-amber-500/30 ml-0.5">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link
            to="/ai-estimate"
            onClick={() => {
              if (setActiveTab) setActiveTab("AI_ESTIMATE");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-3.5 py-2 text-xs lg:text-sm font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>AI 견적 상담</span>
          </Link>
          <button
            onClick={openContactModal}
            className="px-4 py-2 text-xs lg:text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 shadow-md transition-all flex items-center gap-1 hover:shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
          >
            <span>무료 현장 실측</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 xl:hidden">
          <Link
            to="/ai-estimate"
            onClick={() => {
              if (setActiveTab) setActiveTab("AI_ESTIMATE");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="p-2 text-amber-400 bg-stone-800/90 rounded-lg border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI견적</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-200 hover:text-white bg-stone-800 rounded-lg focus:outline-none cursor-pointer"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-stone-900 border-b border-stone-800 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 mb-2">
            <p className="text-xs text-amber-400 font-semibold mb-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {SITE_CONFIG.company.licenseStatus}
            </p>
            <p className="text-xs text-stone-300">
              부산진구 전포동 · 서면 · 부산 전 지역 무료 방문 실측
            </p>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item.path, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path, item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-stone-300 hover:bg-stone-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded font-semibold border border-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 grid grid-cols-2 gap-2">
            {SITE_CONFIG.company.phone ? (
              <a
                href={`tel:${SITE_CONFIG.company.phone}`}
                className="py-2.5 px-3 bg-stone-800 text-stone-100 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-stone-700 active:bg-stone-700"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>전화 상담</span>
              </a>
            ) : (
              <a
                href={SITE_CONFIG.company.naverPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-stone-800 text-amber-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-stone-700 active:bg-stone-700"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>네이버 지도</span>
              </a>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openContactModal();
              }}
              className="py-2.5 px-3 bg-amber-500 text-stone-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow active:bg-amber-600 cursor-pointer"
            >
              <span>무료 실측 신청</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
