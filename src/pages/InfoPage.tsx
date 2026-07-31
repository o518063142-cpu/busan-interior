import React, { useState } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import {
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Phone,
  Building,
  FileText,
  AlertCircle,
  Wrench,
} from "lucide-react";

interface InfoPageProps {
  setActiveTab: (tab: NavigationMenu) => void;
  openContactModal: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "현장 실측 및 상담 비용은 무료인가요?",
      a: "네, 한신인테리어의 부산진구, 전포동, 서면 및 부산 전 지역 현장 실측과 1:1 상담은 100% 무료로 진행됩니다.",
    },
    {
      q: "실내건축면허 보유 업체인가요?",
      a: "네, 한신인테리어는 합법적인 기준을 이행하는 실내건축공사업 면허 보유 업체입니다. 법적 공사 기준과 안전 기준을 철저히 준수합니다.",
    },
    {
      q: "아파트 및 상가 인테리어의 평균 공사 기간은 얼마인가요?",
      a: "일반적으로 30평형 아파트 올 리모델링은 약 3~4주, 상가/카페/매장 인테리어는 약 2~3주 정도 소요됩니다. 현장 상태 및 공사 범위에 따라 사전 협의하여 정확한 일정을 확정합니다.",
    },
    {
      q: "부분 리모델링(욕실, 주방, 도배 등)도 가능한가요?",
      a: "네, 전체 올 리모델링뿐만 아니라 욕실 교체, 주방 싱크대 제작, 창호 교체, 도배 및 마루 공사 등 부분 리모델링도 정성껏 시공해 드립니다.",
    },
    {
      q: "공사 완공 후 A/S 보증 기간은 어떻게 되나요?",
      a: "한신인테리어는 완공 후 하자 보증 이행 조항에 따라 하자에 대한 사후 관리 서비스를 제공해 드립니다.",
    },
    {
      q: "견적서에 명시되지 않은 추가금이 발생하나요?",
      a: "사전에 확정된 견적서와 자재 스펙을 바탕으로 진행되며, 현장에서 고객님의 추가 요청이 없는 한 임의로 추가금을 요구하지 않는 투명 견적을 원칙으로 합니다.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          INFORMATION & FAQ
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
          이용안내 & 시공 가이드
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          한신인테리어의 신뢰도 안내, 자주 묻는 질문(FAQ) 및 부산 지역 시공에 관한 유용한 수칙을 확인하세요.
        </p>
      </div>

      {/* License Trust Banner */}
      <div className="bg-stone-900 text-white p-8 rounded-3xl border border-stone-800 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold font-serif text-white">
              실내건축공사업 면허 보유 신뢰 보증
            </h2>
            <p className="text-xs text-amber-300">
              {SITE_CONFIG.company.licenseStatus} ({SITE_CONFIG.company.licenseNumber})
            </p>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
          실내건축 면허를 보유한 업체로서 불법 무면허 시공으로 인한 부실공사 및 하자 발생 리스크를 방지합니다. 정직한 자재 선택, 도면 준수, 엄격한 감리로 믿을 수 있는 결과물을 선사합니다.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-serif text-stone-900 flex items-center justify-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <span>자주 묻는 질문 (FAQ)</span>
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm">
            고객님들께서 자주 문의하시는 내용을 정리해 드렸습니다.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 text-sm sm:text-base hover:bg-stone-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-amber-600 font-serif">Q.</span>
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-stone-600 border-t border-stone-100 bg-stone-50/50 leading-relaxed">
                    <p className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold font-serif shrink-0">
                        A.
                      </span>
                      <span>{faq.a}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Guide & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="text-xl font-bold text-stone-900 font-serif flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>부산 지역 시공 공정 수칙</span>
          </h3>
          <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>
                <strong>입주자 동의 및 엘리베이터 보양:</strong> 아파트 및 오피스 공사 전 관리사무소 승인 절차를 진행합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>
                <strong>소음 공사 시간 준수:</strong> 공동주택 소음 공사 가능 시간(평일 09시~18시)을 엄수하여 이웃 민원을 최소화합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                <strong>상가 주방 방수 및 소방 검사:</strong> 카페, 음식점, 매장 상가의 경우 관계 법령 기준에 맞춰 방수 및 소방 자재를 검수합니다.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-stone-900 text-white p-8 rounded-3xl border border-stone-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>위치 및 오시는 길</span>
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              부산광역시 부산진구 전포동 소재 한신인테리어. 서면역 및 전포역 인근에 위치하여 빠르게 현장 실측 방문이 가능합니다.
            </p>
            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-1">
              <p>
                <strong className="text-amber-400">주소:</strong> {SITE_CONFIG.company.address} {SITE_CONFIG.company.addressDetail}
              </p>
              <p>
                <strong className="text-amber-400">전화:</strong> {SITE_CONFIG.company.phoneDisplay}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={SITE_CONFIG.company.naverPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold rounded-xl text-xs transition-all"
            >
              <span>네이버 지도에서 보기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
