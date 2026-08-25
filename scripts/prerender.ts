import fs from "fs";
import path from "path";
import { SITE_CONFIG, SITE_ENTITY } from "../src/config/siteConfig";
import { INFORMATION_ARTICLES } from "../src/data/informationData";

interface StaticRouteConfig {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  h1: string;
  summary: string;
  schemaType: "home" | "page" | "faq" | "trust";
}

const STATIC_ROUTES: StaticRouteConfig[] = [
  {
    path: "/",
    title: "지니 인테리어 (한신인테리어)｜부산진구 전포동·서면 실내건축공사업 등록업체",
    description: "부산진구 전포동 지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어). 실내건축공사업 정식 등록업체로 아파트, 주택, 상가, 매장, 카페, 사무실 리모델링 및 책임시공, 무료 현장 실측을 제공합니다.",
    h1: "부산진구 전포동 실내건축공사업 등록업체 지니 인테리어",
    summary: "지니 인테리어(GENE INTERIOR)는 법적 기준을 준수하는 실내건축공사업 정식 등록업체(법적상호: 한신인테리어)로서 부산진구, 전포동, 서면 및 부산 전 지역의 아파트, 상가, 매장, 카페, 사무실 인테리어 및 리모델링 공사를 책임 시공합니다.",
    schemaType: "home",
  },
  {
    path: "/about",
    title: "회사소개 (ABOUT)｜실내건축공사업 정식 등록 한신인테리어·지니 인테리어",
    description: "부산진구 전포동 실내건축공사업 정식 등록업체 지니 인테리어(한신인테리어) 회사소개. 면허 정보, 대표자 정보, 시공 철학 및 표준 공사 시스템 안내.",
    h1: "실내건축공사업 등록업체 지니 인테리어 소개",
    summary: "지니 인테리어(GENE INTERIOR)는 건설산업기본법에 따른 실내건축공사업 정식 등록업체(법적상호: 한신인테리어)입니다. 투명한 공정, 표준 시방서 준수, 엄격한 감리 및 책임 A/S를 바탕으로 고객 맞춤형 공간을 창조합니다.",
    schemaType: "page",
  },
  {
    path: "/service",
    title: "서비스 안내 (SERVICE)｜부산 주거·상가·카페·사무실 인테리어 리모델링",
    description: "부산진구 전포동 지니 인테리어의 전문 인테리어 서비스 영역. 아파트 올리모델링, 주택/빌라 개보수, 상가·매장, 카페·음식점 감성 인테리어, 사무실 인테리어.",
    h1: "지니 인테리어 전문 시공 서비스 안내",
    summary: "아파트·주택 올리모델링부터 상업공간(카페, 음식점, 쇼룸, 매장), 업무공간(오피스, 스튜디오)까지 공간 용도와 고객의 예산에 맞춘 최적화된 설계와 시공을 제공합니다.",
    schemaType: "page",
  },
  {
    path: "/projects",
    title: "시공사례 (PROJECT)｜부산진구·전포동 인테리어 포트폴리오｜지니 인테리어",
    description: "지니 인테리어(GENE INTERIOR) 대표 시공사례 포트폴리오. 부산 주거·상가·카페·사무실 리모델링 완공 및 비포/애프터 공사 과정 공개.",
    h1: "지니 인테리어 대표 시공사례 포트폴리오",
    summary: "부산진구 전포동, 서면, 동래구, 해운대구 등 부산 주요 지역의 아파트, 상가, 카페, 사무실 시공 완공 사례와 상세 공사 내역을 확인하실 수 있습니다.",
    schemaType: "page",
  },
  {
    path: "/information",
    title: "이용안내 & FAQ｜실내건축공사업 정보 및 부산 인테리어 가이드",
    description: "지니 인테리어(GENE INTERIOR) 실내건축공사업 등록 정보, 공사 진행 수칙, 자주 묻는 질문(FAQ) 및 부산진구 전포동 시공 가이드.",
    h1: "이용안내, 시공 가이드 및 자주 묻는 질문(FAQ)",
    summary: "공사 절차 안내, 실내건축공사업 등록업체 확인 방법, 평형별 평균 공사 기간, 무료 현장 실측 및 투명 견적서 가이드 등 인테리어 필수 정보를 제공합니다.",
    schemaType: "faq",
  },
  {
    path: "/trust",
    title: "안심 시공 보증 (TRUST)｜실내건축공사업 등록업체의 투명한 책임 공사",
    description: "지니 인테리어의 5대 안심 보증 시스템. 실내건축공사업 정식 등록, 표준 계약서 작성, 투명 세부 내역 견적, 철저한 현장 감리, 신속한 사후관리(A/S).",
    h1: "지니 인테리어 5대 안심 시공 보증 시스템",
    summary: "건설산업기본법 기준을 준수하는 실내건축공사업 정식 등록업체로서, 무면허 무자격 시공의 위험으로부터 고객을 보호하고 100% 투명하고 안전한 시공 품질을 보증합니다.",
    schemaType: "trust",
  },
  {
    path: "/contact",
    title: "무료 현장 실측 & 견적 문의｜지니 인테리어 (GENE INTERIOR)",
    description: "부산진구 전포동 지니 인테리어(GENE INTERIOR) 무료 현장 실측 및 상담 신청. 실내건축공사업 등록 전문가의 1:1 맞춤 견적.",
    h1: "무료 현장 실측 & 1:1 맞춤 견적 문의",
    summary: "부산진구 전포동, 서면 및 부산 전 지역 현장 실측을 무료로 진행합니다. 실내건축 전문 기사가 직접 방문하여 공간 구조를 실측하고 상세 견적을 안내해 드립니다.",
    schemaType: "page",
  },
  {
    path: "/ai-estimate",
    title: "AI 상담·견적｜부산진구 인테리어 무료 예상 견적 산출",
    description: "인공지능 기반 맞춤 인테리어 예상 견적 및 공사 기간 산출. 부산진구 전포동·서면 아파트/상가/카페 맞춤 AI 시공 가이드.",
    h1: "AI 스마트 인테리어 상담 및 예상 견적 산출",
    summary: "공간 유형, 면적, 희망 스타일, 공사 범위를 입력하시면 부산 지역 최신 인테리어 시세를 분석하여 예상 공사 금액과 기간, 단계별 시공 팁을 안내합니다.",
    schemaType: "page",
  },
];

function generateJsonLd(route: StaticRouteConfig): string {
  const baseUrl = SITE_ENTITY.url;
  const canonicalUrl = `${baseUrl}${route.path === "/" ? "" : route.path}`;

  if (route.schemaType === "home") {
    const homeSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "HomeAndConstructionBusiness",
          "@id": `${baseUrl}/#organization`,
          "name": `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName})`,
          "alternateName": [SITE_CONFIG.brand.nameEn, "한신인테리어", "지니인테리어", "부산지니인테리어"],
          "url": baseUrl,
          "logo": `${baseUrl}/icon.png`,
          "image": `${baseUrl}/og-image.jpg`,
          "description": route.description,
          "telephone": SITE_CONFIG.company.phone,
          "email": SITE_CONFIG.company.email,
          "priceRange": "$$",
          "hasCredential": {
            "@type": "EducationalOccupationalCredential",
            "name": `실내건축공사업 등록 (${SITE_CONFIG.company.licenseStatus})`,
            "credentialCategory": "국가전문건설업면허",
            "recognizedBy": {
              "@type": "GovernmentOrganization",
              "name": "대한민국 국토교통부 / 지자체"
            }
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": `${SITE_CONFIG.company.address} ${SITE_CONFIG.company.addressDetail}`,
            "addressLocality": "부산광역시 부산진구",
            "addressRegion": "부산광역시",
            "postalCode": "47290",
            "addressCountry": "KR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 35.1558,
            "longitude": 129.0622
          },
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
              "opens": "09:00",
              "closes": "19:00"
            }
          ],
          "areaServed": [
            { "@type": "AdministrativeArea", "name": "부산광역시 부산진구" },
            { "@type": "AdministrativeArea", "name": "부산광역시 전포동" },
            { "@type": "AdministrativeArea", "name": "부산광역시 서면" },
            { "@type": "AdministrativeArea", "name": "부산광역시 전지역" }
          ]
        },
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          "url": baseUrl,
          "name": SITE_CONFIG.brand.nameKo,
          "description": route.description,
          "publisher": { "@id": `${baseUrl}/#organization` }
        }
      ]
    };
    return JSON.stringify(homeSchema);
  }

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": route.title,
    "description": route.description,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": SITE_CONFIG.brand.nameKo,
      "url": baseUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "홈",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": route.h1,
          "item": canonicalUrl
        }
      ]
    }
  };

  return JSON.stringify(pageSchema);
}

function renderHtmlShell(route: StaticRouteConfig): string {
  let extraContent = "";

  if (route.path === "/information") {
    extraContent = `
      <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div class="text-center space-y-2">
          <span class="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold rounded-full">
            GENE KNOWLEDGE CENTER · 실내건축 전문 지식
          </span>
          <h2 class="text-2xl font-bold font-serif text-stone-900">소비자가 계약 전에 꼭 알아야 할 인테리어 핵심 가이드</h2>
          <p class="text-stone-600 text-sm">견적·계약·면허·공사비·시공 과정에서 소비자가 실제로 확인해야 할 내용을 GENE INTERIOR의 실무 기준으로 정리합니다.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          ${INFORMATION_ARTICLES.map(
            (art) => `
            <article class="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full">${art.category || "인테리어 가이드"}</span>
                <span class="text-stone-400">${art.publishedAt || ""}</span>
              </div>
              <h3 class="text-lg font-bold text-stone-900 font-serif">
                <a href="/information/${art.slug}" class="hover:text-amber-600 underline">${art.title}</a>
              </h3>
              <p class="text-xs text-stone-600 leading-relaxed">${art.shortAnswer}</p>
              <div class="pt-2 text-xs font-bold text-amber-700">
                <a href="/information/${art.slug}">자세히 읽기 →</a>
              </div>
            </article>
          `
          ).join("")}
        </div>
      </section>
    `;
  }

  return `
    <header class="bg-stone-900 text-stone-100 p-4 border-b border-stone-800">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" class="text-xl font-bold font-serif text-white">${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})</a>
        <span class="text-xs text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/50">${SITE_CONFIG.company.licenseStatus}</span>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <header class="text-center space-y-4 max-w-3xl mx-auto">
        <h1 class="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">${route.h1}</h1>
        <p class="text-stone-600 text-base leading-relaxed">${route.summary}</p>
      </header>
      <section class="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h2 class="text-xl font-bold text-stone-900">${SITE_CONFIG.brand.nameKo} 공식 정보 및 책임시공 가이드</h2>
        <p class="text-stone-700 leading-relaxed text-sm">${route.description}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-xs text-stone-600 border-t border-stone-100">
          <div>
            <p><strong>상호명:</strong> ${SITE_CONFIG.legal.businessName} / <strong>서비스 브랜드:</strong> ${SITE_CONFIG.brand.nameKo}</p>
            <p><strong>등록 면허:</strong> ${SITE_CONFIG.legal.licenseStatus} (${SITE_CONFIG.legal.licenseNumber})</p>
            <p><strong>대표자:</strong> ${SITE_CONFIG.legal.representative} | <strong>사업자등록번호:</strong> ${SITE_CONFIG.legal.businessNumber}</p>
          </div>
          <div>
            <p><strong>사업장 주소:</strong> ${SITE_CONFIG.company.address} ${SITE_CONFIG.company.addressDetail}</p>
            <p><strong>대표 전화:</strong> ${SITE_CONFIG.company.phone} | <strong>직통 문의:</strong> ${SITE_CONFIG.company.mobilePhone}</p>
            <p><strong>영업 시간:</strong> ${SITE_CONFIG.company.operatingHours} (${SITE_CONFIG.company.closedDays})</p>
          </div>
        </div>
      </section>
      ${extraContent}
    </main>
    <footer class="bg-stone-950 text-stone-400 p-8 text-xs border-t border-stone-800 text-center">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName}). All rights reserved.</p>
    </footer>
  `;
}

export async function runPrerender() {
  const distDir = path.resolve(process.cwd(), "dist");
  const baseHtmlPath = path.join(distDir, "index.html");

  if (!fs.existsSync(baseHtmlPath)) {
    console.error("Base dist/index.html not found. Run vite build first.");
    return;
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, "utf-8");

  console.log(`[Static Pre-render] Starting pre-render for ${STATIC_ROUTES.length} fixed routes...`);

  for (const route of STATIC_ROUTES) {
    const canonicalUrl = `${SITE_ENTITY.url}${route.path === "/" ? "" : route.path}`;
    const jsonLdString = generateJsonLd(route);
    const contentHtml = renderHtmlShell(route);

    let html = baseHtml;

    // Replace Title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${route.title}</title>`);

    // Replace Meta Description
    html = html.replace(
      /<meta name="description" content=".*?"\s*\/?>/i,
      `<meta name="description" content="${route.description}" />`
    );

    // Replace or Inject Canonical URL
    if (html.includes('<link rel="canonical"')) {
      html = html.replace(
        /<link rel="canonical" href=".*?"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );
    } else {
      html = html.replace("</head>", `  <link rel="canonical" href="${canonicalUrl}" />\n</head>`);
    }

    // Inject or update OpenGraph Meta
    const ogBlock = `
  <meta property="og:title" content="${route.title}" />
  <meta property="og:description" content="${route.description}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="ko_KR" />
  <meta property="og:site_name" content="${SITE_CONFIG.brand.nameKo}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${route.title}" />
  <meta name="twitter:description" content="${route.description}" />
  <script type="application/ld+json">${jsonLdString}</script>
`;
    html = html.replace("</head>", `${ogBlock}</head>`);

    // Inject semantic content shell inside root for crawler visibility
    html = html.replace('<div id="root"></div>', `<div id="root">${contentHtml}</div>`);

    // Output target directory
    const targetDir = route.path === "/" ? distDir : path.join(distDir, route.path.replace(/^\//, ""));
    fs.mkdirSync(targetDir, { recursive: true });

    const targetFile = path.join(targetDir, "index.html");
    fs.writeFileSync(targetFile, html, "utf-8");
    console.log(`[Static Pre-render] Generated: ${targetFile}`);
  }

  console.log("[Static Pre-render] Completed successfully!");
}

// Execute directly if run via tsx scripts/prerender.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  runPrerender().catch(console.error);
}
