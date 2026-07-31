import React from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import { Phone, Sparkles, Calendar, ChevronRight } from "lucide-react";

interface FloatingContactBarProps {
  setActiveTab: (tab: NavigationMenu) => void;
  openContactModal: () => void;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-xl border-t border-amber-500/30 p-2.5 sm:p-3 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.8)] xl:hidden">
      <div className="max-w-lg mx-auto grid grid-cols-12 gap-2 items-center">
        {/* Phone Button 1: Representative */}
        <a
          href={`tel:${SITE_CONFIG.company.phone}`}
          className="col-span-3 flex flex-col items-center justify-center py-2 px-1 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-[11px] font-extrabold border border-amber-500/40 shadow-md active:scale-95 transition-all text-center"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
          <span className="text-[10px] text-stone-400 font-medium">대표</span>
          <span className="text-amber-300 font-bold truncate">{SITE_CONFIG.company.phone}</span>
        </a>

        {/* Phone Button 2: Direct Mobile */}
        <a
          href={`tel:${SITE_CONFIG.company.mobilePhone}`}
          className="col-span-3 flex flex-col items-center justify-center py-2 px-1 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl text-[11px] font-extrabold border border-amber-500/40 shadow-md active:scale-95 transition-all text-center"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
          <span className="text-[10px] text-stone-400 font-medium">직통</span>
          <span className="text-amber-300 font-bold truncate">{SITE_CONFIG.company.mobilePhone}</span>
        </a>

        {/* AI Estimate Button */}
        <button
          onClick={() => {
            setActiveTab("AI_ESTIMATE");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="col-span-3 flex flex-col items-center justify-center py-2 px-1 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl text-[11px] font-bold border border-stone-800 active:scale-95 transition-all text-center"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 mb-0.5 animate-pulse" />
          <span className="text-[10px] text-stone-400 font-medium">AI분석</span>
          <span className="text-stone-300 font-bold">견적계산</span>
        </button>

        {/* Free Measurement Button */}
        <button
          onClick={openContactModal}
          className="col-span-3 flex flex-col items-center justify-center py-2 px-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-[11px] font-black shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-center"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0 mb-0.5" />
          <span className="text-[10px] text-stone-900 font-bold">무료</span>
          <span className="truncate font-black">실측신청</span>
        </button>
      </div>
    </div>
  );
};

