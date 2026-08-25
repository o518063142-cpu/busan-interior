import React from "react";
import {
  ShieldCheck,
  FileCheck2,
  Eye,
  CheckCircle2,
  Wrench,
  ChevronRight,
  Building2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import { SITE_ENTITY } from "../config/siteConfig";

interface TrustPageProps {
  openContactModal?: () => void;
}

export const TrustPage: React.FC<TrustPageProps> = ({ openContactModal }) => {
  const trustSteps = [
    {
      step: "01",
      title: "실내건축공사업 공식 등록",
      desc: "지니 인테리어(법적상호: 한신인테리어)는 건설산업기본법에 따른 실내건축공사업 등록업체로서 법적 기술 인력 및 자격을 바탕으로 공사를 수행합니다.",
      icon: <Building2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "02",
      title: "투명한 공정별 내역서 & 표준계약",
      desc: "품목과 자재 단위가 모호한 일괄 견적을 지양하고, 공정별 세부 항목과 표준계약서를 통해 추가금 분쟁을 사전에 예방합니다.",
      icon: <FileCheck2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "03",
      title: "공사 진행 단계별 투명 공유",
      desc: "철거, 설비, 방수, 전기, 목공, 타일, 마감 등 각 주요 공정의 현장 상황을 고객과 실시간으로 공유하고 소통합니다.",
      icon: <Eye className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "04",
      title: "정밀 준공 점검 및 마감 검수",
      desc: "시공 완료 후 고객과 함께 도면 및 계약 항목에 맞춘 마감 검수를 진행하며, 미비 사항은 즉각 조치합니다.",
      icon: <CheckCircle2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "05",
      title: "하자보수 및 지속 가능한 사후관리",
      desc: "공사 완료 후에도 시공 하자에 대한 신속한 A/S 대응과 전문 관리를 통해 끝까지 신뢰를 책임집니다.",
      icon: <Wrench className="w-6 h-6 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-400 selection:text-stone-950">
      <MetaManager
        title="GENE TRUST SYSTEM｜실내건축공사업 안심 시공 기준"
        description="지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어)의 5단계 안심 시공 시스템. 실내건축공사업 등록, 투명 견적, 공정 공유, 준공 검수, 하자보수 사후관리."
        canonicalPath="/trust"
      />
      <StructuredData
        type="page"
        title="GENE TRUST SYSTEM | 지니 인테리어"
        description="실내건축공사업 등록업체 지니 인테리어의 5단계 투명 안심 시공 시스템"
        path="/trust"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 lg:px-8 border-b border-stone-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-stone-950 to-stone-950 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>GENE TRUST SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight">
            공사의 시작부터 사후관리까지
            <br />
            <span className="text-amber-400">투명하고 안전한 시공 기준</span>
          </h1>

          <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {SITE_ENTITY.brand.displayName}(법적상호: {SITE_ENTITY.legal.businessName})는 불안과 불신을 없애는
            체계적인 5단계 신뢰 관리 프로세스를 원칙으로 합니다.
          </p>
        </div>
      </section>

      {/* 5 Steps Grid */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-16 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/50 transition-all space-y-4 shadow-md group"
            >
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-mono font-extrabold text-2xl group-hover:scale-105 transition-transform">
                  {step.step}
                </span>
                <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700">
                  {step.icon}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white font-serif">
                {step.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-850 border border-stone-800 text-center space-y-4 shadow-xl">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
            <Sparkles className="w-4 h-4" />
            <span>부산 전지역 1:1 맞춤 상담</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
            정직한 견적과 신뢰할 수 있는 시공을 지금 경험해보세요.
          </h3>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {openContactModal ? (
              <button
                onClick={openContactModal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <span>무료 현장 실측 신청하기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm transition-all shadow flex items-center justify-center gap-2"
              >
                <span>무료 현장 실측 상담신청</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/projects"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-bold border border-stone-700 transition-all text-center"
            >
              실제 시공사례 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
