import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import {
  INFORMATION_ARTICLES,
  InformationArticleData,
} from "../data/informationData";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Wrench,
} from "lucide-react";

interface InfoPageProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModal?: () => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({
  setActiveTab,
  openContactModal,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [dynamicArticles, setDynamicArticles] = useState<
    InformationArticleData[]
  >([]);

  // Fetch published articles from Firestore
  useEffect(() => {
    try {
      const q = query(
        collection(db, "articles"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: InformationArticleData[] = [];

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();

            // Filter published only
            if (
              data.status !== "draft" &&
              data.status !== "private"
            ) {
              // Avoid duplicate with static articles
              const isStatic = INFORMATION_ARTICLES.some(
                (sa) => sa.slug === data.slug
              );

              if (!isStatic) {
                list.push({
                  id: docSnap.id,
                  slug: data.slug || docSnap.id,
                  title: data.title || "인테리어 정보",
                  shortAnswer:
                    data.shortAnswer || data.summary || "",
                  content: data.content || "",
                  category:
                    data.category || "인테리어 가이드",
                  consumerChecklist: Array.isArray(
                    data.consumerChecklist
                  )
                    ? data.consumerChecklist
                    : [],
                  faq: Array.isArray(data.faq)
                    ? data.faq
                    : [],
                  featuredImage:
                    data.featuredImage ||
                    data.coverImage ||
                    "",
                  publishedAt: data.publishedAt || "",
                  updatedAt: data.updatedAt || "",
                });
              }
            }
          });

          setDynamicArticles(list);
        },
        (err) => {
          console.warn(
            "Firestore articles load notice in InfoPage:",
            err
          );
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn("Error subscribing to articles:", err);
    }
  }, []);

  const combinedArticles = [
    ...INFORMATION_ARTICLES,
    ...dynamicArticles,
  ];

  const faqs = [
    {
      q: "현장 실측 및 상담은 어떻게 진행되나요?",
      a: "지니 인테리어는 상담 내용을 먼저 확인한 뒤 현장 위치, 공간 유형, 공사 범위와 일정 등을 검토하여 현장 실측 및 견적 상담을 안내합니다.",
    },
    {
      q: "실내건축공사업 등록업체인가요?",
      a: "네. 지니 인테리어(GENE INTERIOR / 법적상호: 지니인테리어)는 실내건축공사업 등록업체입니다. 공식 사업자 및 등록 정보는 홈페이지 회사소개와 업체 정보에서 확인하실 수 있습니다.",
    },
    {
      q: "아파트 및 상가 인테리어의 공사 기간은 얼마인가요?",
      a: "공사 기간은 공간의 면적, 현장 상태, 철거 범위, 자재 발주 일정과 공사 범위에 따라 달라집니다. 현장 확인과 상담 후 실제 공사 범위에 맞춰 일정을 안내합니다.",
    },
    {
      q: "부분 리모델링(욕실, 주방, 도배 등)도 가능한가요?",
      a: "네. 전체 리모델링뿐 아니라 현장 조건과 공사 범위에 따라 욕실, 주방, 창호, 도배, 바닥 등 부분 리모델링 상담도 가능합니다.",
    },
    {
      q: "공사 완료 후 A/S는 어떻게 진행되나요?",
      a: "공사 완료 후 발생한 사항은 시공 범위와 계약 내용을 확인한 뒤 하자보수 및 사후관리 기준에 따라 안내합니다.",
    },
    {
      q: "견적서에 없는 추가 공사가 필요한 경우는 어떻게 하나요?",
      a: "기존 견적과 계약 범위를 기준으로 공사를 진행하며, 현장 여건의 변경이나 고객의 추가 요청 등으로 새로운 공사가 필요한 경우 해당 내용을 확인하고 협의한 뒤 진행합니다.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      <MetaManager
        title="이용안내 & FAQ｜부산 인테리어·실내건축 가이드｜지니 인테리어"
        description="부산 동래구 명륜동 지니 인테리어(GENE INTERIOR)의 실내건축공사업 등록 정보, 공사 진행 안내, 자주 묻는 질문(FAQ)과 인테리어·리모델링 가이드."
        canonicalPath="/information"
      />

      <StructuredData
        type="page"
        title="이용안내 & FAQ | 지니 인테리어"
        description="부산 동래구 명륜동 지니 인테리어의 실내건축공사업 등록 정보, 공사 진행 안내, FAQ 및 인테리어 가이드"
        path="/information"
      />

      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto font-sans">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-sans">
          INFORMATION & FAQ
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-sans break-keep">
          이용안내 & 시공 가이드
        </h1>

        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans break-keep">
          {SITE_CONFIG.brand.nameKo}({SITE_CONFIG.brand.nameEn})의
          업체 정보, 자주 묻는 질문(FAQ) 및 인테리어·리모델링
          시공에 관한 실무 정보를 확인하세요.
        </p>
      </div>

      {/* License Trust Banner */}
      <div className="bg-stone-900 text-white p-8 rounded-3xl border border-stone-800 space-y-4 shadow-lg font-sans">
        <div className="flex items-center gap-3 font-sans">
          <ShieldCheck className="w-8 h-8 text-amber-400" />

          <div>
            <h2 className="text-xl font-bold font-sans text-white break-keep">
              실내건축공사업 등록업체
            </h2>

            <p className="text-xs text-amber-300 font-sans">
              {SITE_CONFIG.company.licenseStatus} (
              {SITE_CONFIG.company.licenseNumber})
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans break-keep">
          지니 인테리어는 실내건축공사업 등록업체로서 현장
          상태와 공사 범위를 확인하고, 상담·견적·계약 내용을
          바탕으로 실내건축·인테리어·리모델링 공사를
          진행합니다.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6 font-sans">
        <div className="text-center space-y-2 font-sans">
          <h2 className="text-2xl font-bold font-sans text-stone-900 flex items-center justify-center gap-2 break-keep">
            <HelpCircle className="w-6 h-6 text-amber-600" />
            <span>자주 묻는 질문 (FAQ)</span>
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm font-sans">
            고객님들께서 자주 문의하시는 내용을 정리했습니다.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3 font-sans">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm transition-all font-sans"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(isOpen ? null : index)
                  }
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-stone-900 text-sm sm:text-base hover:bg-stone-50 transition-colors cursor-pointer font-sans"
                >
                  <span className="flex items-center gap-2 font-sans">
                    <span className="text-amber-600 font-bold font-sans">
                      Q.
                    </span>
                    <span className="break-keep">
                      {faq.q}
                    </span>
                  </span>

                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-stone-600 border-t border-stone-100 bg-stone-50/50 leading-relaxed font-sans">
                    <p className="flex items-start gap-2 font-sans">
                      <span className="text-amber-600 font-bold font-sans shrink-0">
                        A.
                      </span>

                      <span className="break-keep">
                        {faq.a}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GENE KNOWLEDGE CENTER */}
      <section className="space-y-8 pt-4 font-sans">
        <div className="text-center space-y-3 max-w-2xl mx-auto font-sans">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>GENE KNOWLEDGE CENTER</span>
            <span className="text-amber-400">·</span>
            <span className="text-amber-800 font-medium">
              실내건축 전문 정보
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-sans text-stone-900 leading-tight break-keep">
            소비자가 계약 전에 꼭 알아야 할
            <br className="hidden sm:inline" /> 인테리어 핵심
            가이드
          </h2>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-sans break-keep">
            견적·계약·실내건축공사업 등록·공사비·시공 과정에서
            소비자가 확인하면 좋은 내용을 지니 인테리어의 실무
            경험을 바탕으로 정리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {combinedArticles.map((article) => (
            <Link
              key={article.slug}
              to={`/information/${article.slug}`}
              className="group bg-white rounded-3xl p-7 sm:p-8 border border-stone-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6 font-sans text-inherit no-underline"
            >
              <div className="space-y-4 font-sans">
                <div className="flex items-center justify-between gap-2 flex-wrap font-sans">
                  <span className="px-3 py-1 bg-stone-100 group-hover:bg-amber-100 text-stone-700 group-hover:text-amber-900 text-xs font-bold rounded-full transition-colors font-sans">
                    {article.category ||
                      "인테리어 가이드"}
                  </span>

                  {article.publishedAt && (
                    <span className="text-xs text-stone-400 font-mono">
                      {article.publishedAt}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-sans leading-snug group-hover:text-amber-700 transition-colors break-keep">
                  {article.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3 font-sans break-keep">
                  {article.shortAnswer}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-amber-600 transition-colors font-sans">
                <span>자세히 읽기</span>

                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Regional Guide & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 space-y-4 font-sans">
          <h3 className="text-xl font-bold text-stone-900 font-sans flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            <span>공사 전 확인사항</span>
          </h3>

          <ul className="space-y-3 text-xs sm:text-sm text-stone-700 font-sans">
            <li className="flex items-start gap-2 font-sans">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>

              <span className="break-keep">
                <strong>관리사무소 공사 절차 확인:</strong>{" "}
                공동주택의 경우 공사 신고, 엘리베이터 사용,
                보양 및 작업 가능 시간 등 해당 단지의 관리
                기준을 사전에 확인합니다.
              </span>
            </li>

            <li className="flex items-start gap-2 font-sans">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>

              <span className="break-keep">
                <strong>소음 공사 가능 시간 확인:</strong>{" "}
                철거 등 소음이 발생하는 작업은 건물과
                관리주체가 정한 작업 가능 시간과 절차를
                확인하여 진행합니다.
              </span>
            </li>

            <li className="flex items-start gap-2 font-sans">
              <span className="w-5 h-5 bg-amber-100 text-amber-800 font-bold rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>

              <span className="break-keep">
                <strong>상업공간 관련 기준 확인:</strong>{" "}
                음식점·카페·매장 등은 공간의 용도와 공사
                범위에 따라 설비, 방수, 전기, 소방 등 필요한
                사항을 현장별로 확인합니다.
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-stone-900 text-white p-8 rounded-3xl border border-stone-800 space-y-4 flex flex-col justify-between font-sans">
          <div className="space-y-3 font-sans">
            <h3 className="text-xl font-bold font-sans text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>위치 및 오시는 길</span>
            </h3>

            <p className="text-xs text-stone-300 leading-relaxed font-sans break-keep">
              지니 인테리어(GENE INTERIOR)는 부산광역시
              동래구 명륜동에 위치하며, 부산 전 지역을
              중심으로 현장 상담 및 실내건축·인테리어·리모델링
              업무를 진행합니다.
            </p>

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs space-y-1 font-sans">
              <p>
                <strong className="text-amber-400">
                  주소:
                </strong>{" "}
                {SITE_CONFIG.company.address}{" "}
                {SITE_CONFIG.company.addressDetail}
              </p>

              <p>
                <strong className="text-amber-400">
                  전화:
                </strong>{" "}
                {SITE_CONFIG.company.phoneDisplay}
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
