import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import {
  Phone,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Home,
  Info,
  Briefcase,
  Images,
  FileText,
  MessageSquare,
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
    { id: "TRUST", path: "/trust", label: "안심시공", icon: <Shield className="w-4 h-4 text-[#B38F4D]" /> },
    {
      id: "AI_ESTIMATE",
      path: "/ai-estimate",
      label: "AI 상담·견적",
      icon: <Sparkles className="w-4 h-4 text-[#B38F4D]" />,
      badge: "AI",
    },
    { id: "CONTACT", path: "/contact", label: "CONTACT", icon: <MessageSquare className="w-4 h-4" /> },
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-stone-900 border-b border-stone-200/90 shadow-sm transition-all">
      {/* Main Navigation Header */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 2xl:px-8 py-3 lg:py-3.5 flex items-center justify-between gap-2 xl:gap-3 2xl:gap-4">
        {/* Brand Official Logo */}
        <Link
          to="/"
          onClick={() => {
            if (setActiveTab) setActiveTab("HOME");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-left group flex items-baseline gap-1.5 sm:gap-2 focus:outline-none shrink-0"
        >
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-base sm:text-lg lg:text-xl 2xl:text-2xl font-extrabold tracking-tight text-stone-950 group-hover:text-stone-700 transition-colors font-sans whitespace-nowrap">
              {SITE_CONFIG.brand.nameKo}
            </span>
            <span className="text-[10px] sm:text-[11px] lg:text-xs 2xl:text-sm font-bold tracking-[0.12em] text-[#B38F4D] font-sans uppercase whitespace-nowrap">
              {SITE_CONFIG.brand.nameEn}
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden xl:flex items-center space-x-1 2xl:space-x-1.5 shrink-0">
          {navItems.map((item) => {
            const active = isItemActive(item.path, item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path, item.id)}
                className={`relative px-2.5 2xl:px-3 py-2 text-xs 2xl:text-[13.5px] font-medium rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "text-stone-950 font-bold bg-stone-100"
                    : "text-stone-600 hover:text-stone-950 hover:bg-stone-50"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#FAF6EC] text-[#9A7424] text-[9px] 2xl:text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#E9D9B2] shrink-0 whitespace-nowrap">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#B38F4D] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* CTA Button (Desktop) */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            onClick={openContactModal}
            className="px-4 2xl:px-5 py-2 text-xs 2xl:text-sm font-bold rounded-lg bg-stone-950 hover:bg-stone-800 text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="whitespace-nowrap">무료 현장 실측</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle & AI estimate CTA */}
        <div className="flex items-center gap-2 xl:hidden">
          <Link
            to="/ai-estimate"
            onClick={() => {
              if (setActiveTab) setActiveTab("AI_ESTIMATE");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="p-2 text-[#8C6D23] bg-[#FAF8F5] rounded-lg border border-[#E5D8B8] text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B38F4D]" />
            <span className="hidden sm:inline">AI견적</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg focus:outline-none cursor-pointer transition-colors"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item.path, item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path, item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[#FAF8F5] text-[#8C6D23] font-semibold border border-[#E5D8B8]"
                      : "text-stone-700 hover:bg-stone-50 hover:text-stone-950"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#FAF6EC] text-[#9A7424] text-xs px-2 py-0.5 rounded font-semibold border border-[#E9D9B2]">
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
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-stone-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#B38F4D]" />
                <span>전화 상담</span>
              </a>
            ) : (
              <a
                href={SITE_CONFIG.company.naverPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-stone-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-[#B38F4D]" />
                <span>네이버 지도</span>
              </a>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openContactModal();
              }}
              className="py-2.5 px-3 bg-stone-950 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:bg-stone-900 cursor-pointer transition-colors"
            >
              <span>무료 실측 신청</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
