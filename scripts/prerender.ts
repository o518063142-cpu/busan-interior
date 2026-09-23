import fs from "fs";
import path from "path";

import {
  SITE_CONFIG,
  SITE_ENTITY,
} from "../src/config/siteConfig";

import {
  INFORMATION_ARTICLES,
} from "../src/data/informationData";

import {
  PROJECTS_DATA,
} from "../api/_data/projectsData.js";

import {
  getFirestoreAdmin,
  isProjectPublic,
} from "../api/_lib/firebaseAdmin.js";

/* =========================================================
   TYPES
========================================================= */

interface StaticRouteConfig {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  h1: string;
  summary: string;
  schemaType: "home" | "page" | "faq" | "trust";
}

interface PrerenderProject {
  id: string;
  slug?: string;
  isSample: boolean;

  title: string;
  location: string;
  category: string;

  spaceTypeDetail?: string;
  area?: string;
  duration?: string;
  scope?: string;
  description?: string;
}

/* =========================================================
   STATIC ROUTES
========================================================= */

const STATIC_ROUTES: StaticRouteConfig[] = [
  {
    path: "/",

    title:
      "지니 인테리어 (한신인테리어)｜부산진구 전포동·서면 실내건축공사업 등록업체",

    description:
      "부산진구 전포동 지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어). 실내건축공사업 정식 등록업체로 아파트, 주택, 상가, 매장, 카페, 사무실 리모델링 및 책임시공, 무료 현장 실측을 제공합니다.",

    h1:
      "부산진구 전포동 실내건축공사업 등록업체 지니 인테리어",

    summary:
      "지니 인테리어(GENE INTERIOR)는 법적 기준을 준수하는 실내건축공사업 정식 등록업체(법적상호: 한신인테리어)로서 부산진구, 전포동, 서면 및 부산 전 지역의 아파트, 상가, 매장, 카페, 사무실 인테리어 및 리모델링 공사를 책임 시공합니다.",

    schemaType: "home",
  },

  {
    path: "/about",

    title:
      "회사소개 (ABOUT)｜실내건축공사업 정식 등록 한신인테리어·지니 인테리어",

    description:
      "부산진구 전포동 실내건축공사업 정식 등록업체 지니 인테리어(한신인테리어) 회사소개. 면허 정보, 대표자 정보, 시공 철학 및 표준 공사 시스템 안내.",

    h1:
      "실내건축공사업 등록업체 지니 인테리어 소개",

    summary:
      "지니 인테리어(GENE INTERIOR)는 건설산업기본법에 따른 실내건축공사업 정식 등록업체(법적상호: 한신인테리어)입니다. 투명한 공정, 표준 시방서 준수, 엄격한 감리 및 책임 A/S를 바탕으로 고객 맞춤형 공간을 창조합니다.",

    schemaType: "page",
  },

  {
    path: "/service",

    title:
      "서비스 안내 (SERVICE)｜부산 주거·상가·카페·사무실 인테리어 리모델링",

    description:
      "부산진구 전포동 지니 인테리어의 전문 인테리어 서비스 영역. 아파트 올리모델링, 주택/빌라 개보수, 상가·매장, 카페·음식점 감성 인테리어, 사무실 인테리어.",

    h1:
      "지니 인테리어 전문 시공 서비스 안내",

    summary:
      "아파트·주택 올리모델링부터 상업공간(카페, 음식점, 쇼룸, 매장), 업무공간(오피스, 스튜디오)까지 공간 용도와 고객의 예산에 맞춘 최적화된 설계와 시공을 제공합니다.",

    schemaType: "page",
  },

  {
    path: "/projects",

    title:
      "시공사례 (PROJECT)｜부산 인테리어 포트폴리오｜지니 인테리어",

    description:
      "지니 인테리어(GENE INTERIOR)의 실제 시공사례 포트폴리오. 부산 아파트·빌라 리모델링과 학교·공공 교육시설 인테리어 공사 사례를 확인할 수 있습니다.",

    h1:
      "지니 인테리어 실제 시공사례 포트폴리오",

    summary:
      "부산 아파트·빌라 리모델링부터 학교·공공 교육시설까지 지니 인테리어가 실제 진행한 시공사례와 공사 정보를 확인하실 수 있습니다.",

    schemaType: "page",
  },

  {
    path: "/information",

    title:
      "이용안내 & FAQ｜실내건축공사업 정보 및 부산 인테리어 가이드",

    description:
      "지니 인테리어(GENE INTERIOR) 실내건축공사업 등록 정보, 공사 진행 수칙, 자주 묻는 질문(FAQ) 및 부산진구 전포동 시공 가이드.",

    h1:
      "이용안내, 시공 가이드 및 자주 묻는 질문(FAQ)",

    summary:
      "공사 절차 안내, 실내건축공사업 등록업체 확인 방법, 평형별 평균 공사 기간, 무료 현장 실측 및 투명 견적서 가이드 등 인테리어 필수 정보를 제공합니다.",

    schemaType: "faq",
  },

  {
    path: "/trust",

    title:
      "안심 시공 보증 (TRUST)｜실내건축공사업 등록업체의 투명한 책임 공사",

    description:
      "지니 인테리어의 5대 안심 보증 시스템. 실내건축공사업 정식 등록, 표준 계약서 작성, 투명 세부 내역 견적, 철저한 현장 감리, 신속한 사후관리(A/S).",

    h1:
      "지니 인테리어 5대 안심 시공 보증 시스템",

    summary:
      "건설산업기본법 기준을 준수하는 실내건축공사업 정식 등록업체로서 투명한 계약과 공정 관리, 책임 시공 및 사후관리를 제공합니다.",

    schemaType: "trust",
  },

  {
    path: "/contact",

    title:
      "무료 현장 실측 & 견적 문의｜지니 인테리어 (GENE INTERIOR)",

    description:
      "부산진구 전포동 지니 인테리어(GENE INTERIOR) 무료 현장 실측 및 상담 신청. 실내건축공사업 등록 전문가의 1:1 맞춤 견적.",

    h1:
      "무료 현장 실측 & 1:1 맞춤 견적 문의",

    summary:
      "부산진구 전포동, 서면 및 부산 전 지역 현장 실측을 진행합니다. 현장을 확인하고 공간 구조와 공사 범위에 맞는 상세 견적을 안내해 드립니다.",

    schemaType: "page",
  },

  {
    path: "/ai-estimate",

    title:
      "AI 상담·견적｜부산진구 인테리어 무료 예상 견적 산출",

    description:
      "인공지능 기반 맞춤 인테리어 예상 견적 및 공사 기간 산출. 부산진구 전포동·서면 아파트/상가/카페 맞춤 AI 시공 가이드.",

    h1:
      "AI 스마트 인테리어 상담 및 예상 견적 산출",

    summary:
      "공간 유형, 면적, 희망 스타일, 공사 범위를 입력하시면 예상 공사 금액과 기간, 단계별 시공 정보를 안내합니다.",

    schemaType: "page",
  },
];

/* =========================================================
   FALLBACK REAL PROJECTS

   Firestore를 빌드 순간 읽지 못해도
   현재 정상 실제 사례 5개는 절대 사라지지 않게 보존.

   향후 Firestore 연결 성공 시 Firestore 데이터가 우선됨.
========================================================= */

const FALLBACK_REAL_PROJECTS: PrerenderProject[] = [
  {
    id: "busan-mangmi-jugong-apartment-remodeling",
    slug: "busan-mangmi-jugong-apartment-remodeling",
    isSample: false,
    title: "부산 망미주공 아파트 리모델링",
    location: "부산 수영구 망미동",
    category: "주거",
    description:
      "부산 수영구 망미동 주거 아파트 리모델링 시공사례",
  },

  {
    id: "busan-sinpyeong-samchang-apartment-remodeling",
    slug: "busan-sinpyeong-samchang-apartment-remodeling",
    isSample: false,
    title: "부산 신평 삼창아파트 리모델링",
    location: "부산 사하구 신평동",
    category: "주거",
    description:
      "부산 사하구 신평동 아파트 리모델링 시공사례",
  },

  {
    id: "busan-sajik-villa-remodeling",
    slug: "busan-sajik-villa-remodeling",
    isSample: false,
    title: "부산 사직동 빌라 리모델링",
    location: "부산 동래구 사직동",
    category: "주거",
    description:
      "부산 동래구 사직동 노후 빌라 리모델링 시공사례",
  },

  {
    id: "gyeongnam-elementary-school-vr-classroom-remodeling",
    slug: "gyeongnam-elementary-school-vr-classroom-remodeling",
    isSample: false,
    title: "경남 초등학교 VR교실 리모델링",
    location: "경상남도",
    category: "공공·교육시설",
    description:
      "초등학교 VR 교육공간 및 공공 교육시설 인테리어 시공사례",
  },

  {
    id: "ulsan-elementary-school-classroom-interior",
    slug: "ulsan-elementary-school-classroom-interior",
    isSample: false,
    title: "울산 초등학교 교실 인테리어",
    location: "울산광역시",
    category: "공공·교육시설",
    description:
      "울산 초등학교 교육공간 인테리어 시공사례",
  },
];

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   PROJECT NORMALIZER
========================================================= */

function normalizeProject(
  id: string,
  data: any
): PrerenderProject {
  return {
    id,

    slug:
      data.slug ||
      (
        id === "wkv0to3v3LYzluyUtBU2"
          ? "busan-sajik-villa-remodeling"
          : id
      ),

    isSample:
      data.isSample === true,

    title:
      data.title || "",

    location:
      data.location || "",

    category:
      data.category || "주거",

    spaceTypeDetail:
      data.spaceTypeDetail ||
      data.spaceType ||
      "",

    area:
      data.area || "",

    duration:
      data.duration ||
      data.period ||
      "",

    scope:
      data.scope || "",

    description:
      data.description || "",
  };
}

/* =========================================================
   FIRESTORE REAL PROJECT FETCH
========================================================= */

async function fetchFirestoreProjects(): Promise<
  PrerenderProject[]
> {
  const projects: PrerenderProject[] = [];

  try {
    const db = await getFirestoreAdmin();

    if (!db) {
      console.warn(
        "[Static Pre-render] Firestore Admin unavailable. Using fallback real projects."
      );

      return projects;
    }

    const snap =
      await db.collection("projects").get();

    if (snap.empty) {
      console.warn(
        "[Static Pre-render] Firestore projects collection is empty."
      );

      return projects;
    }

    for (const doc of snap.docs) {
      const raw = doc.data();

      if (!isProjectPublic(raw)) {
        continue;
      }

      projects.push(
        normalizeProject(
          doc.id,
          raw
        )
      );
    }

    console.log(
      `[Static Pre-render] Firestore public projects loaded: ${projects.length}`
    );
  } catch (error) {
    console.warn(
      "[Static Pre-render] Firestore project fetch failed. Fallback projects will be preserved.",
      error
    );
  }

  return projects;
}

/* =========================================================
   MERGE PROJECTS

   1. Firestore 실제 사례 우선
   2. fallback 실제 5개 보존
   3. PROJECTS_DATA 샘플 6개 유지
========================================================= */

async function getCombinedProjects(): Promise<{
  realProjects: PrerenderProject[];
  sampleProjects: PrerenderProject[];
}> {
  const firestoreProjects =
    await fetchFirestoreProjects();

  const realMap =
    new Map<string, PrerenderProject>();

  const sampleMap =
    new Map<string, PrerenderProject>();

  /* -----------------------------------------
     1. Firestore
  ----------------------------------------- */

  for (const project of firestoreProjects) {
    const key =
      project.slug ||
      project.id;

    if (project.isSample) {
      sampleMap.set(
        key,
        project
      );
    } else {
      realMap.set(
        key,
        project
      );
    }
  }

  /* -----------------------------------------
     2. 현재 실제 사례 fallback
  ----------------------------------------- */

  for (
    const project
    of FALLBACK_REAL_PROJECTS
  ) {
    const key =
      project.slug ||
      project.id;

    if (!realMap.has(key)) {
      realMap.set(
        key,
        project
      );
    }
  }

  /* -----------------------------------------
     3. 샘플 프로젝트 6개
  ----------------------------------------- */

  for (const project of PROJECTS_DATA) {
    const normalized: PrerenderProject = {
      id: project.id,

      slug:
        project.slug ||
        project.id,

      isSample:
        project.isSample === true,

      title:
        project.title,

      location:
        project.location,

      category:
        project.category,

      spaceTypeDetail:
        project.spaceTypeDetail,

      area:
        project.area,

      duration:
        project.duration,

      scope:
        project.scope,

      description:
        project.description,
    };

    const key =
      normalized.slug ||
      normalized.id;

    if (normalized.isSample) {
      if (!sampleMap.has(key)) {
        sampleMap.set(
          key,
          normalized
        );
      }
    } else {
      if (!realMap.has(key)) {
        realMap.set(
          key,
          normalized
        );
      }
    }
  }

  const realProjects =
    Array.from(
      realMap.values()
    );

  const sampleProjects =
    Array.from(
      sampleMap.values()
    );

  console.log(
    `[Static Pre-render] Combined projects → real: ${realProjects.length}, sample: ${sampleProjects.length}`
  );

  return {
    realProjects,
    sampleProjects,
  };
}

/* =========================================================
   JSON-LD
========================================================= */

function generateJsonLd(
  route: StaticRouteConfig
): string {
  const baseUrl =
    SITE_ENTITY.url.replace(
      /\/$/,
      ""
    );

  const canonicalUrl =
    route.path === "/"
      ? `${baseUrl}/`
      : `${baseUrl}${route.path}`;

  if (
    route.schemaType === "home"
  ) {
    return JSON.stringify({
      "@context":
        "https://schema.org",

      "@graph": [
        {
          "@type":
            "HomeAndConstructionBusiness",

          "@id":
            `${baseUrl}/#organization`,

          name:
            `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName})`,

          alternateName: [
            SITE_CONFIG.brand.nameEn,
            "한신인테리어",
            "지니인테리어",
            "부산지니인테리어",
          ],

          url:
            `${baseUrl}/`,

          logo:
            `${baseUrl}/icon.png`,

          image:
            `${baseUrl}/og-image.jpg`,

          description:
            route.description,

          telephone:
            SITE_CONFIG.company.phone,

          email:
            SITE_CONFIG.company.email,

          priceRange:
            "$$",

          hasCredential: {
            "@type":
              "EducationalOccupationalCredential",

            name:
              `실내건축공사업 등록 (${SITE_CONFIG.company.licenseStatus})`,

            credentialCategory:
              "전문건설업",
          },

          address: {
            "@type":
              "PostalAddress",

            streetAddress:
              `${SITE_CONFIG.company.address} ${SITE_CONFIG.company.addressDetail}`,

            addressLocality:
              "부산광역시 부산진구",

            addressRegion:
              "부산광역시",

            postalCode:
              "47290",

            addressCountry:
              "KR",
          },

          geo: {
            "@type":
              "GeoCoordinates",

            latitude:
              35.1558,

            longitude:
              129.0622,
          },

          openingHoursSpecification: [
            {
              "@type":
                "OpeningHoursSpecification",

              dayOfWeek: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ],

              opens:
                "09:00",

              closes:
                "19:00",
            },
          ],

          areaServed: [
            {
              "@type":
                "AdministrativeArea",

              name:
                "부산광역시",
            },

            {
              "@type":
                "AdministrativeArea",

              name:
                "부산광역시 부산진구",
            },

            {
              "@type":
                "AdministrativeArea",

              name:
                "부산광역시 전포동",
            },

            {
              "@type":
                "AdministrativeArea",

              name:
                "부산광역시 서면",
            },
          ],
        },

        {
          "@type":
            "WebSite",

          "@id":
            `${baseUrl}/#website`,

          url:
            `${baseUrl}/`,

          name:
            SITE_CONFIG.brand.nameKo,

          alternateName:
            SITE_CONFIG.brand.nameEn,

          description:
            route.description,

          publisher: {
            "@id":
              `${baseUrl}/#organization`,
          },

          inLanguage:
            "ko-KR",
        },
      ],
    });
  }

  return JSON.stringify({
    "@context":
      "https://schema.org",

    "@type":
      "WebPage",

    name:
      route.title,

    description:
      route.description,

    url:
      canonicalUrl,

    inLanguage:
      "ko-KR",

    isPartOf: {
      "@type":
        "WebSite",

      "@id":
        `${baseUrl}/#website`,

      name:
        SITE_CONFIG.brand.nameKo,

      url:
        `${baseUrl}/`,
    },

    breadcrumb: {
      "@type":
        "BreadcrumbList",

      itemListElement: [
        {
          "@type":
            "ListItem",

          position:
            1,

          name:
            "홈",

          item:
            `${baseUrl}/`,
        },

        {
          "@type":
            "ListItem",

          position:
            2,

          name:
            route.h1,

          item:
            canonicalUrl,
        },
      ],
    },
  });
}

/* =========================================================
   PROJECT HTML
========================================================= */

function renderProjectCard(
  project: PrerenderProject,
  isSample: boolean
): string {
  const slug =
    project.slug ||
    project.id;

  const title =
    escapeHtml(
      project.title
    );

  const location =
    escapeHtml(
      project.location
    );

  const category =
    escapeHtml(
      project.category
    );

  const detail =
    escapeHtml(
      project.spaceTypeDetail || ""
    );

  const duration =
    escapeHtml(
      project.duration || ""
    );

  const scope =
    escapeHtml(
      project.scope || ""
    );

  const description =
    escapeHtml(
      project.description || ""
    );

  return `
    <article class="p-5 border border-stone-200 rounded-2xl space-y-2">

      ${
        isSample
          ? `
            <span class="inline-block px-2 py-1 text-xs font-bold bg-amber-50 text-amber-800 rounded">
              샘플 프로젝트
            </span>
          `
          : ""
      }

      <h3 class="font-bold text-stone-900">

        <a
          href="/projects/${encodeURIComponent(slug)}"
          class="hover:text-amber-700 underline"
        >
          ${title}
        </a>

      </h3>

      ${
        location
          ? `
            <p class="text-sm text-stone-600">
              <strong>지역:</strong>
              ${location}
            </p>
          `
          : ""
      }

      ${
        category
          ? `
            <p class="text-sm text-stone-600">
              <strong>공간 유형:</strong>
              ${category}
              ${
                detail
                  ? ` · ${detail}`
                  : ""
              }
            </p>
          `
          : ""
      }

      ${
        duration
          ? `
            <p class="text-sm text-stone-600">
              <strong>공사 기간:</strong>
              ${duration}
            </p>
          `
          : ""
      }

      ${
        scope
          ? `
            <p class="text-xs text-stone-500 leading-relaxed">
              <strong>공사 범위:</strong>
              ${scope}
            </p>
          `
          : ""
      }

      ${
        description
          ? `
            <p class="text-xs text-stone-500 leading-relaxed">
              ${description}
            </p>
          `
          : ""
      }

    </article>
  `;
}

/* =========================================================
   HTML SHELL
========================================================= */

function renderHtmlShell(
  route: StaticRouteConfig,
  realProjects: PrerenderProject[],
  sampleProjects: PrerenderProject[]
): string {
  let extraContent = "";

  /* -------------------------------------------------------
     INFORMATION
  ------------------------------------------------------- */

  if (
    route.path === "/information"
  ) {
    extraContent = `
      <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">

        <div class="text-center space-y-2">

          <span class="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full">
            GENE KNOWLEDGE CENTER · 실내건축 전문 지식
          </span>

          <h2 class="text-2xl font-bold font-serif text-stone-900">
            소비자가 계약 전에 꼭 알아야 할 인테리어 핵심 가이드
          </h2>

          <p class="text-stone-600 text-sm">
            견적·계약·면허·공사비·시공 과정에서 소비자가 실제로 확인해야 할 내용을
            지니 인테리어의 실무 기준으로 정리합니다.
          </p>

        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">

          ${INFORMATION_ARTICLES.map(
            (art) => `
              <article class="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-3">

                <div class="flex items-center justify-between text-xs">

                  <span class="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full">
                    ${escapeHtml(
                      art.category ||
                      "인테리어 가이드"
                    )}
                  </span>

                  <span class="text-stone-400">
                    ${escapeHtml(
                      art.publishedAt ||
                      ""
                    )}
                  </span>

                </div>

                <h3 class="text-lg font-bold text-stone-900 font-serif">

                  <a
                    href="/information/${encodeURIComponent(
                      art.slug
                    )}"
                    class="hover:text-amber-600 underline"
                  >
                    ${escapeHtml(
                      art.title
                    )}
                  </a>

                </h3>

                <p class="text-xs text-stone-600 leading-relaxed">
                  ${escapeHtml(
                    art.shortAnswer
                  )}
                </p>

                <div class="pt-2 text-xs font-bold text-amber-700">

                  <a
                    href="/information/${encodeURIComponent(
                      art.slug
                    )}"
                  >
                    자세히 읽기 →
                  </a>

                </div>

              </article>
            `
          ).join("")}

        </div>

      </section>
    `;
  }

  /* -------------------------------------------------------
     PROJECTS
  ------------------------------------------------------- */

  if (
    route.path === "/projects"
  ) {
    const realHtml =
      realProjects
        .map(
          (project) =>
            renderProjectCard(
              project,
              false
            )
        )
        .join("");

    const sampleHtml =
      sampleProjects
        .map(
          (project) =>
            renderProjectCard(
              project,
              true
            )
        )
        .join("");

    extraContent = `
      <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">

        <div class="space-y-2">

          <span class="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full">
            GENE INTERIOR · 실제 시공사례
          </span>

          <h2 class="text-2xl font-bold font-serif text-stone-900">
            부산·울산·경남 실제 인테리어 시공사례
          </h2>

          <p class="text-stone-600 text-sm leading-relaxed">
            지니 인테리어가 실제 진행한 주거 리모델링 및
            학교·공공 교육시설 시공사례입니다.
            각 현장의 공사 내용과 시공 정보를 확인하실 수 있습니다.
          </p>

        </div>

        <div>

          <h2 class="text-xl font-bold text-stone-900 mb-4">
            실제 시공사례 (${realProjects.length}건)
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${realHtml}
          </div>

        </div>

        <div class="pt-6 border-t border-stone-200">

          <h2 class="text-xl font-bold text-stone-900 mb-2">
            샘플 프로젝트 (${sampleProjects.length}건)
          </h2>

          <p class="text-xs text-stone-500 leading-relaxed mb-4">
            아래 프로젝트는 디자인 및 공간 구성 예시를 위한 샘플 프로젝트이며,
            실제 시공실적과 구분하여 표시합니다.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${sampleHtml}
          </div>

        </div>

      </section>
    `;
  }

  /* -------------------------------------------------------
     COMMON SHELL
  ------------------------------------------------------- */

  return `
    <header class="bg-stone-900 text-stone-100 p-4 border-b border-stone-800">

      <div class="max-w-7xl mx-auto flex items-center justify-between">

        <a
          href="/"
          class="text-xl font-bold font-serif text-white"
        >
          ${escapeHtml(
            SITE_CONFIG.brand.nameKo
          )}
          (${escapeHtml(
            SITE_CONFIG.brand.nameEn
          )})
        </a>

        <span class="text-xs text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/50">
          ${escapeHtml(
            SITE_CONFIG.company.licenseStatus
          )}
        </span>

      </div>

    </header>

    <main class="max-w-7xl mx-auto px-4 py-12 space-y-8">

      <header class="text-center space-y-4 max-w-3xl mx-auto">

        <h1 class="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
          ${escapeHtml(
            route.h1
          )}
        </h1>

        <p class="text-stone-600 text-base leading-relaxed">
          ${escapeHtml(
            route.summary
          )}
        </p>

      </header>

      <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">

        <h2 class="text-xl font-bold text-stone-900">
          ${escapeHtml(
            SITE_CONFIG.brand.nameKo
          )}
          공식 정보 및 책임시공 가이드
        </h2>

        <p class="text-stone-700 leading-relaxed text-sm">
          ${escapeHtml(
            route.description
          )}
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs text-stone-600 border-t border-stone-100">

          <div>

            <p>
              <strong>상호명:</strong>
              ${escapeHtml(
                SITE_CONFIG.legal.businessName
              )}
              /
              <strong>서비스 브랜드:</strong>
              ${escapeHtml(
                SITE_CONFIG.brand.nameKo
              )}
            </p>

            <p>
              <strong>등록 면허:</strong>
              ${escapeHtml(
                SITE_CONFIG.legal.licenseStatus
              )}
              (${escapeHtml(
                SITE_CONFIG.legal.licenseNumber
              )})
            </p>

            <p>
              <strong>대표자:</strong>
              ${escapeHtml(
                SITE_CONFIG.legal.representative
              )}
              |
              <strong>사업자등록번호:</strong>
              ${escapeHtml(
                SITE_CONFIG.legal.businessNumber
              )}
            </p>

          </div>

          <div>

            <p>
              <strong>사업장 주소:</strong>
              ${escapeHtml(
                SITE_CONFIG.company.address
              )}
              ${escapeHtml(
                SITE_CONFIG.company.addressDetail
              )}
            </p>

            <p>
              <strong>대표 전화:</strong>
              ${escapeHtml(
                SITE_CONFIG.company.phone
              )}
              |
              <strong>직통 문의:</strong>
              ${escapeHtml(
                SITE_CONFIG.company.mobilePhone
              )}
            </p>

            <p>
              <strong>영업 시간:</strong>
              ${escapeHtml(
                SITE_CONFIG.company.operatingHours
              )}
              (${escapeHtml(
                SITE_CONFIG.company.closedDays
              )})
            </p>

          </div>

        </div>

      </section>

      ${
        route.path === "/"
          ? `
            <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">

              <h2 class="text-xl font-bold text-stone-900">
                지니 인테리어 실제 시공사례
              </h2>

              <p class="text-stone-700 leading-relaxed text-sm">
                부산 아파트·빌라 리모델링부터 학교·공공 교육시설까지
                지니 인테리어가 직접 진행한 실제 시공사례와 공사 정보를
                확인하실 수 있습니다.
              </p>

              <p class="pt-2">

                <a
                  href="/projects"
                  class="font-bold text-amber-700 underline"
                >
                  실제 시공사례 포트폴리오 보기 →
                </a>

              </p>

            </section>
          `
          : ""
      }

      ${extraContent}

    </main>

    <footer class="bg-stone-950 text-stone-400 p-8 text-xs border-t border-stone-800 text-center">

      <p>
        © ${new Date().getFullYear()}
        ${escapeHtml(
          SITE_CONFIG.brand.nameKo
        )}
        (${escapeHtml(
          SITE_CONFIG.legal.businessName
        )}).
        All rights reserved.
      </p>

    </footer>
  `;
}

/* =========================================================
   PRERENDER
========================================================= */

export async function runPrerender() {
  const distDir =
    path.resolve(
      process.cwd(),
      "dist"
    );

  const baseHtmlPath =
    path.join(
      distDir,
      "index.html"
    );

  if (
    !fs.existsSync(
      baseHtmlPath
    )
  ) {
    throw new Error(
      "Base dist/index.html not found. Run vite build first."
    );
  }

  const baseHtml =
    fs.readFileSync(
      baseHtmlPath,
      "utf-8"
    );

  console.log(
    `[Static Pre-render] Starting pre-render for ${STATIC_ROUTES.length} fixed routes...`
  );

  /* -------------------------------------------------------
     프로젝트는 빌드당 한 번만 가져온다.
  ------------------------------------------------------- */

  const {
    realProjects,
    sampleProjects,
  } =
    await getCombinedProjects();

  /* -------------------------------------------------------
     ROUTES
  ------------------------------------------------------- */

  for (
    const route
    of STATIC_ROUTES
  ) {
    const baseUrl =
      SITE_ENTITY.url.replace(
        /\/$/,
        ""
      );

    const canonicalUrl =
      route.path === "/"
        ? `${baseUrl}/`
        : `${baseUrl}${route.path}`;

    const jsonLdString =
      generateJsonLd(
        route
      );

    const contentHtml =
      renderHtmlShell(
        route,
        realProjects,
        sampleProjects
      );

    let html =
      baseHtml;

    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    if (
      /<title>.*?<\/title>/i.test(
        html
      )
    ) {
      html =
        html.replace(
          /<title>.*?<\/title>/i,
          `<title>${escapeHtml(
            route.title
          )}</title>`
        );
    } else {
      html =
        html.replace(
          "</head>",
          `  <title>${escapeHtml(
            route.title
          )}</title>\n</head>`
        );
    }

    /* -----------------------------------------------------
       META DESCRIPTION
    ----------------------------------------------------- */

    if (
      /<meta\s+name=["']description["']/i.test(
        html
      )
    ) {
      html =
        html.replace(
          /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,

          `<meta name="description" content="${escapeHtml(
            route.description
          )}" />`
        );
    } else {
      html =
        html.replace(
          "</head>",

          `  <meta name="description" content="${escapeHtml(
            route.description
          )}" />\n</head>`
        );
    }

    /* -----------------------------------------------------
       CANONICAL
    ----------------------------------------------------- */

    if (
      /<link\s+rel=["']canonical["']/i.test(
        html
      )
    ) {
      html =
        html.replace(
          /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,

          `<link rel="canonical" href="${canonicalUrl}" />`
        );
    } else {
      html =
        html.replace(
          "</head>",

          `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`
        );
    }

    /* -----------------------------------------------------
       SEO BLOCK
    ----------------------------------------------------- */

    const seoBlock = `
  <meta name="robots" content="index, follow" />

  <meta property="og:title" content="${escapeHtml(
    route.title
  )}" />

  <meta property="og:description" content="${escapeHtml(
    route.description
  )}" />

  <meta property="og:url" content="${canonicalUrl}" />

  <meta property="og:type" content="website" />

  <meta property="og:locale" content="ko_KR" />

  <meta property="og:site_name" content="${escapeHtml(
    SITE_CONFIG.brand.nameKo
  )}" />

  <meta name="twitter:card" content="summary_large_image" />

  <meta name="twitter:title" content="${escapeHtml(
    route.title
  )}" />

  <meta name="twitter:description" content="${escapeHtml(
    route.description
  )}" />

  <script type="application/ld+json">${jsonLdString}</script>
`;

    html =
      html.replace(
        "</head>",
        `${seoBlock}</head>`
      );

    /* -----------------------------------------------------
       ROOT SEMANTIC HTML
    ----------------------------------------------------- */

    if (
      html.includes(
        '<div id="root"></div>'
      )
    ) {
      html =
        html.replace(
          '<div id="root"></div>',

          `<div id="root">${contentHtml}</div>`
        );
    } else if (
      html.includes(
        "<div id='root'></div>"
      )
    ) {
      html =
        html.replace(
          "<div id='root'></div>",

          `<div id="root">${contentHtml}</div>`
        );
    } else {
      throw new Error(
        `[Static Pre-render] root element not found for ${route.path}`
      );
    }

    /* -----------------------------------------------------
       OUTPUT
    ----------------------------------------------------- */

    const targetDir =
      route.path === "/"
        ? distDir
        : path.join(
            distDir,
            route.path.replace(
              /^\//,
              ""
            )
          );

    fs.mkdirSync(
      targetDir,
      {
        recursive: true,
      }
    );

    const targetFile =
      path.join(
        targetDir,
        "index.html"
      );

    fs.writeFileSync(
      targetFile,
      html,
      "utf-8"
    );

    console.log(
      `[Static Pre-render] Generated: ${targetFile}`
    );
  }

  console.log(
    `[Static Pre-render] Completed successfully. Real projects: ${realProjects.length}, Sample projects: ${sampleProjects.length}`
  );
}

/* =========================================================
   DIRECT EXECUTION
========================================================= */

if (
  import.meta.url ===
  `file://${process.argv[1]}`
) {
  runPrerender()
    .catch(
      (error) => {
        console.error(
          "[Static Pre-render] Failed:",
          error
        );

        process.exitCode = 1;
      }
    );
}
