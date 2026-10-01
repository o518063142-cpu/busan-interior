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
      title: "실내건축공사업 등록업체",
      desc: "지니 인테리어(법적상호: 지니인테리어)는 실내건축공사업 등록업체로, 현장 조건과 공사 범위를 확인하여 실내건축·인테리어·리모델링 공사를 진행합니다.",
      icon: <Building2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "02",
      title: "공정별 견적 및 계약 안내",
      desc: "공사 범위와 현장 조건을 확인하고 주요 공정과 자재 항목을 구분하여 견적과 계약 내용을 안내합니다.",
      icon: <FileCheck2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "03",
      title: "공사 진행 단계별 소통",
      desc: "철거, 설비, 방수, 전기, 목공, 타일, 마감 등 주요 공정의 진행 상황을 확인하고 필요한 내용을 고객과 공유합니다.",
      icon: <Eye className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "04",
      title: "준공 점검 및 마감 확인",
      desc: "시공 완료 후 계약된 공사 범위와 주요 마감 상태를 확인하고 필요한 사항을 점검합니다.",
      icon: <CheckCircle2 className="w-6 h-6 text-amber-500" />,
    },
    {
      step: "05",
      title: "하자보수 및 사후관리",
      desc: "공사 완료 후 시공 범위와 계약 내용에 따라 하자보수 및 사후관리를 안내합니다.",
      icon: <Wrench className="w-6 h-6 text-amber-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-amber-400 selection:text-stone-950">
      <MetaManager
        title="GENE TRUST SYSTEM｜부산 실내건축공사업 등록업체 지니 인테리어"
        description="부산 동래구 명륜동 지니 인테리어(GENE INTERIOR / 법적상호: 지니인테리어)의 시공 관리 기준. 실내건축공사업 등록, 공정별 견적, 공사 진행 공유, 준공 점검 및 사후관리."
        canonicalPath="/trust"
      />

      <StructuredData
        type="page"
        title="GENE TRUST SYSTEM | 지니 인테리어"
        description="부산 동래구 명륜동 실내건축공사업 등록업체 지니 인테리어의 시공 관리 기준"
        path="/trust"
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 lg:px-8 border-b border-stone-800/80 overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-stone-950 to-stone-950 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase font-sans">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>GENE TRUST SYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-sans tracking-tight leading-tight break-keep">
            공사의 시작부터 사후관리까지
            <br />
            <span className="text-amber-400">
              투명하고 체계적인 시공 관리
            </span>
          </h1>

          <p className="text-stone-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-sans break-keep">
            {SITE_ENTITY.brand.displayName}(법적상호:{" "}
            {SITE_ENTITY.legal.businessName})는 상담과 견적부터 공사 진행,
            준공 확인과 사후관리까지 각 단계의 내용을 명확하게
            안내하고 소통하는 것을 중요하게 생각합니다.
          </p>
        </div>
      </section>

      {/* 5 Steps Grid */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-16 space-y-8 font-sans">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {trustSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-stone-900/70 border border-stone-800 hover:border-amber-500/50 transition-all space-y-4 shadow-md group font-sans"
            >
              <div className="flex items-center justify-between font-sans">
                <span className="text-amber-400 font-mono font-extrabold text-2xl group-hover:scale-105 transition-transform">
                  {step.step}
                </span>

                <div className="p-2.5 rounded-xl bg-stone-800/80 border border-stone-700">
                  {step.icon}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white font-sans break-keep">
                {step.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans break-keep">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-stone-900 to-stone-850 border border-stone-800 text-center space-y-4 shadow-xl font-sans">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold font-sans">
            <Sparkles className="w-4 h-4" />
            <span>부산 전 지역 1:1 맞춤 상담</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-sans text-white break-keep">
            공간과 현장 조건에 맞는 인테리어 상담을 받아보세요.
          </h3>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {openContactModal ? (
              <button
                onClick={openContactModal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <span>현장 실측·견적 상담 신청</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm transition-all shadow flex items-center justify-center gap-2"
              >
                <span>현장 실측·견적 상담 신청</span>
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
