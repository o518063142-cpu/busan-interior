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
      <header className="space-y-4 font-sans">
        <div className="flex items-center gap-2 flex-wrap font-sans">
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full font-sans">
            {article.category || "인테리어 Q&A"}
          </span>
          <span className="text-xs text-stone-500 flex items-center gap-1 font-medium font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            {SITE_ENTITY.brand.nameKo} 공식 자문
          </span>
          {article.publishedAt && (
            <span className="text-xs text-stone-400 font-mono">
              발행: {article.publishedAt}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-950 font-sans leading-tight break-keep">
          {article.title}
        </h1>
      </header>

      {/* Short Answer / Executive Summary Box */}
      {article.shortAnswer && (
        <section className="bg-amber-50/80 border-2 border-amber-400/80 rounded-2xl p-6 sm:p-7 space-y-3 shadow-sm font-sans">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm font-sans">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>핵심 요약 및 전문 답변</span>
          </div>
          <p className="text-stone-900 text-sm sm:text-base font-medium leading-relaxed font-sans break-keep">
            {article.shortAnswer}
          </p>
        </section>
      )}

      {/* Main Content Body */}
      <section className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-sans break-keep">
        {article.content}
      </section>

      {/* Consumer Checklist */}
      {article.consumerChecklist && article.consumerChecklist.length > 0 && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm font-sans">
          <div className="flex items-center gap-2 text-stone-950 font-bold text-base sm:text-lg font-sans">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h2 className="break-keep">소비자 필수 체크리스트</h2>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700 font-sans">
            {article.consumerChecklist.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-100 font-sans">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium leading-normal break-keep">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* FAQ Accordion or List if available */}
      {article.faq && article.faq.length > 0 && (
        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 font-sans">
          <div className="flex items-center gap-2 text-stone-950 font-bold text-base sm:text-lg font-sans">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="break-keep">관련 자주 묻는 질문</h2>
          </div>
          <div className="space-y-3 font-sans">
            {article.faq.map((q, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 font-sans">
                <p className="font-bold text-stone-900 text-sm font-sans break-keep">
                  Q. {q.question}
                </p>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans break-keep">
                  A. {q.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Real Projects (관련 실제 시공사례) */}
      {article.slug === "busan-interior-remodeling-checklist" && (
        <section className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm font-sans">
          <div className="flex items-center gap-2 text-stone-950 font-bold text-base sm:text-lg font-sans">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <h2 className="break-keep">관련 실제 시공사례</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 font-sans break-keep">
            지니 인테리어의 실제 부산 구축 주거 공간 리모델링 시공사례를 확인하실 수 있습니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-sans">
            <Link
              to="/projects/busan-sajik-villa-remodeling"
              className="group p-4 bg-stone-50 hover:bg-amber-50/50 rounded-xl border border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    실제 시공사례
                  </span>
                  <span className="text-xs text-stone-500 font-medium">부산 동래구 사직동</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors break-keep">
                  부산 사직동 구축 빌라 리모델링
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2">
                  29평 구축 빌라 올리모델링 (화이트 톤 공간 구성 및 실용적 동선 개선)
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 group-hover:text-amber-700 pt-1">
                <span>사직동 시공사례 보러가기</span>
                <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            <Link
              to="/projects/busan-mangmi-jugong-apartment-remodeling"
              className="group p-4 bg-stone-50 hover:bg-amber-50/50 rounded-xl border border-stone-200 hover:border-amber-400 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    실제 시공사례
                  </span>
                  <span className="text-xs text-stone-500 font-medium">부산 수영구 망미동</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors break-keep">
                  부산 망미 주공 아파트 27평 리모델링
                </h3>
                <p className="text-xs text-stone-600 line-clamp-2">
                  27평 구축 아파트 주거 리모델링 (맞춤 주방 가구 및 시스템 수납 설계)
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-stone-700 group-hover:text-amber-700 pt-1">
                <span>망미주공 시공사례 보러가기</span>
                <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Trust & Consultation Bridge */}
      <section className="bg-stone-950 text-stone-100 rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-800 shadow-xl font-sans">
        <div className="space-y-2 font-sans">
          <span className="text-amber-400 font-bold text-xs uppercase tracking-wider font-sans">
            GENE TRUST SYSTEM
          </span>
          <h3 className="text-xl sm:text-2xl font-bold font-sans text-white break-keep">
            부산 실내건축공사업 등록업체 지니 인테리어의 안심 시공 기준
          </h3>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed font-sans break-keep">
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
