import React from "react";
import {
  FileText,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_ENTITY } from "../../config/siteConfig";
import { InformationArticleData } from "../../data/informationData";

export type { InformationArticleData };

interface InformationDetailContentProps {
  article: InformationArticleData;
  onOpenContactModal?: () => void;
}

export const InformationDetailContent: React.FC<InformationDetailContentProps> = ({
  article,
  onOpenContactModal,
}) => {
  return (
    <article className="max-w-4xl mx-auto px-4 lg:px-8 py-12 space-y-10 text-stone-900">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 text-xs text-stone-500">
        <Link
          to="/information"
          className="inline-flex items-center gap-1 text-stone-600 hover:text-amber-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>지식센터 목록으로</span>
        </Link>
        <div className="flex items-center gap-2">
          <span>홈</span>
          <span>/</span>
          <span>지식센터</span>
          <span>/</span>
          <span className="text-stone-800 font-bold">{article.category || "인테리어 가이드"}</span>
        </div>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
            {article.category || "인테리어 Q&A"}
          </span>
          <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            {SITE_ENTITY.brand.nameKo} 공식 자문
          </span>
          {article.publishedAt && (
            <span className="text-xs text-stone-400">
              발행: {article.publishedAt}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-950 font-serif leading-tight">
          {article.title}
        </h1>
      </header>

      {/* Short Answer / Executive Summary Box */}
      {article.shortAnswer && (
        <section className="bg-amber-50/80 border-2 border-amber-400/80 rounded-2xl p-6 sm:p-7 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>핵심 요약 및 전문 답변</span>
          </div>
          <p className="text-stone-900 text-sm sm:text-base font-medium leading-relaxed">
            {article.shortAnswer}
          </p>
        </section>
      )}

      {/* Main Content Body */}
      <section className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
        {article.content}
      </section>

      {/* Consumer Checklist */}
      {article.consumerChecklist && article.consumerChecklist.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-stone-950 font-bold text-base sm:text-lg font-serif">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2>소비자 필수 체크리스트</h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
            {article.consumerChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium leading-normal">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ Accordion or List if available */}
      {article.faq && article.faq.length > 0 && (
        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-stone-950 font-bold text-base sm:text-lg font-serif">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <h2>관련 자주 묻는 질문</h2>
          </div>
          <div className="space-y-3">
            {article.faq.map((q, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                <p className="font-bold text-stone-900 text-sm">
                  Q. {q.question}
                </p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                  A. {q.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trust & Consultation Bridge */}
      <section className="bg-stone-950 text-stone-100 rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-800 shadow-xl">
        <div className="space-y-2">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
            GENE TRUST SYSTEM
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
            부산 실내건축공사업 등록업체 지니 인테리어의 안심 시공 기준
          </h3>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
            실내건축공사업 등록업체 {SITE_ENTITY.brand.nameKo}(법적상호: {SITE_ENTITY.legal.businessName})는 표준계약서 작성, 투명한 공정별 내역서, 정직한 마감 점검을 준수합니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            to="/trust"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold text-center border border-stone-700 transition-all flex items-center justify-center gap-1.5"
          >
            <span>GENE 안심 시스템 5단계 보기</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          {onOpenContactModal ? (
            <button
              onClick={onOpenContactModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>무료 현장 실측 상담 신청</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow text-center flex items-center justify-center gap-1.5"
            >
              <span>무료 현장 실측 문의하기</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>
    </article>
  );
};
