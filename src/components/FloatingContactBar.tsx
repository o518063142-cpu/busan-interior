import React from "react";
import { useNavigate } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import { Phone, Sparkles, Calendar } from "lucide-react";

interface FloatingContactBarProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal: () => void;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md border-t border-stone-800/90 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_20px_rgba(0,0,0,0.3)] xl:hidden">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 sm:gap-2 items-center">
        {/* Action 1: 대표 전화 */}
        <a
          href={`tel:${SITE_CONFIG.company.phone}`}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800 active:scale-95 transition-all text-center"
          aria-label="회사 전화 상담"
        >
          <Phone className="w-4 h-4 text-[#B38F4D] mb-1" />
          <span className="text-[11px] font-semibold tracking-tight">전화</span>
        </a>

        {/* Action 2: 직통 문의 */}
        <a
          href={`tel:${SITE_CONFIG.company.mobilePhone}`}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800 active:scale-95 transition-all text-center"
          aria-label="담당자 직통 전화"
        >
          <Phone className="w-4 h-4 text-[#B38F4D] mb-1" />
          <span className="text-[11px] font-semibold tracking-tight">직통</span>
        </a>

        {/* Action 3: AI 견적 */}
        <button
          onClick={() => {
            if (setActiveTab) setActiveTab("AI_ESTIMATE");
            navigate("/ai-estimate");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-stone-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-800 active:scale-95 transition-all text-center cursor-pointer"
          aria-label="AI 견적 분석"
        >
          <Sparkles className="w-4 h-4 text-[#B38F4D] mb-1" />
          <span className="text-[11px] font-semibold tracking-tight">AI 견적</span>
        </button>

        {/* Action 4: 무료 실측 신청 */}
        <button
          onClick={openContactModal}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-stone-900/90 hover:bg-stone-800 text-stone-100 border border-[#B38F4D]/40 shadow-xs active:scale-95 transition-all text-center cursor-pointer"
          aria-label="무료 현장 실측 신청"
        >
          <Calendar className="w-4 h-4 text-[#D4AF37] mb-1" />
          <span className="text-[11px] font-bold text-[#E5D8B8] tracking-tight">무료 실측</span>
        </button>
      </div>
    </div>
  );
};

