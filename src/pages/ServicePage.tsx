import React from "react";
import { SERVICES_DATA } from "../data/servicesData";
import { NavigationMenu, ProjectCategory } from "../types";
import {
  CheckCircle2,
  ChevronRight,
  Home,
  Store,
  Coffee,
  Building2,
  ShieldCheck,
  ArrowRight,
  Layers,
  Wrench,
} from "lucide-react";

interface ServicePageProps {
  setActiveTab: (tab: NavigationMenu) => void;
  setSelectedCategory: (cat: ProjectCategory) => void;
  openContactModal: () => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({
  setActiveTab,
  setSelectedCategory,
  openContactModal,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case "Home":
        return <Home className="w-6 h-6 text-amber-500" />;
      case "Store":
        return <Store className="w-6 h-6 text-amber-500" />;
      case "Coffee":
        return <Coffee className="w-6 h-6 text-amber-500" />;
      case "Building2":
        return <Building2 className="w-6 h-6 text-amber-500" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-amber-500" />;
      default:
        return <Wrench className="w-6 h-6 text-amber-500" />;
    }
  };

  const handleProjectFilterClick = (targetCategory: ProjectCategory) => {
    setSelectedCategory(targetCategory);
    setActiveTab("PROJECT");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          SERVICES CATEGORY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
          주요 인테리어 서비스
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          한신인테리어는 부산진구 전포동 및 서면, 부산 전역의 주거 및 상업·사무 공간을 위한 5가지 전문 영역의 인테리어 및 실내건축 서비스를 제공합니다.
        </p>
      </div>

      {/* 5 Card Categories Grid */}
      <div className="space-y-12">
        {SERVICES_DATA.map((service, index) => (
          <div
            key={service.id}
            id={service.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10"
          >
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                    {getIcon(service.iconName)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-700 block">
                      Category 0{index + 1}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                      {service.title}
                    </h2>
                  </div>
                </div>

                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  {service.fullDesc}
                </p>

                {/* Scope List */}
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-3">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>주요 공사 범위</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    {service.scopeList.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process Steps */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-stone-500">진행 스텝 요약:</h4>
                  <div className="flex flex-wrap gap-1.5 text-xs text-stone-600">
                    {service.processSteps.map((step, i) => (
                      <span
                        key={i}
                        className="bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Related Project Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-stone-100">
                <button
                  onClick={() => handleProjectFilterClick(service.targetCategory)}
                  className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>관련 시공사례 보기 ({service.targetCategory})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={openContactModal}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all"
                >
                  무료 실측 및 견적 문의
                </button>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 h-64 sm:h-80 lg:h-full rounded-2xl overflow-hidden relative border border-stone-200">
              <img
                src={service.bannerImage}
                alt={service.title}
                className="w-full h-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs p-3 bg-stone-900/80 backdrop-blur-md rounded-xl border border-stone-700">
                <span className="font-bold text-amber-400 block mb-0.5">
                  한신인테리어 맞춤 시공
                </span>
                <span>부산진구 전포동 · 서면 및 부산 전지역 출장 가능</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
