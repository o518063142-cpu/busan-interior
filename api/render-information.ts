import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SITE_CONFIG, SITE_ENTITY } from "./_config/siteConfig.js";
import { getFirestoreAdmin } from "./_lib/firebaseAdmin.js";
import { PILLAR_ARTICLES } from "./_data/informationData.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const slugStr = Array.isArray(slug) ? slug[0] : slug || "";

  if (!slugStr) {
    return res.status(400).send("Invalid slug parameter");
  }

  // 301 Permanent Redirect for consolidated legacy slug to canonical URL
  if (slugStr === "busanjin-remodeling-checklist") {
    res.setHeader("Location", "/information/busan-interior-remodeling-checklist");
    return res.status(301).end();
  }

  let articleData: any = PILLAR_ARTICLES[slugStr] || null;

  if (!articleData) {
    try {
      const db = await getFirestoreAdmin();
      if (db) {
        let snapshot = await db.collection("articles").where("slug", "==", slugStr).where("status", "==", "published").limit(1).get();
        if (snapshot.empty) {
          snapshot = await db.collection("articles").where("slug", "==", slugStr).where("status", "==", "public").limit(1).get();
        }
        if (snapshot.empty) {
          snapshot = await db.collection("information_articles").where("slug", "==", slugStr).limit(1).get();
        }
        if (!snapshot.empty) {
          articleData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
      }
    } catch (err) {
      console.warn("Firestore fetch warning:", err);
    }
  }

  const baseUrl = SITE_ENTITY.url.replace(/\/$/, "");
  const canonicalUrl = `${baseUrl}/information/${slugStr}`;

  if (!articleData) {
    const notFoundHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>문서를 찾을 수 없습니다｜지니 인테리어</title>
  <meta name="robots" content="noindex, follow" />
</head>
<body style="font-family:sans-serif; text-align:center; padding:50px;">
  <h1>요청하신 지식센터 문서를 찾을 수 없습니다.</h1>
  <p><a href="/information">이용안내 및 정보 허브로 돌아가기</a></p>
</body>
</html>`;
    return res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(notFoundHtml);
  }

  const pageTitle = `${articleData.title}｜지니 인테리어 공식 가이드`;
  const pageDesc = articleData.description || `${SITE_CONFIG.brand.nameKo} 전문 실내건축 가이드 문서.`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "headline": articleData.title,
        "description": pageDesc,
        "url": canonicalUrl,
        "inLanguage": "ko-KR",
        "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
        "author": { "@type": "Organization", "name": SITE_CONFIG.brand.nameKo, "url": baseUrl },
        "publisher": {
          "@type": "Organization",
          "name": `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName})`,
          "logo": { "@type": "ImageObject", "url": `${baseUrl}/icon.png` }
        },
        "datePublished": articleData.createdAt || articleData.publishedAt || "2025-01-15",
        "dateModified": articleData.updatedAt || articleData.createdAt || "2025-02-12"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": `${baseUrl}/` },
          { "@type": "ListItem", "position": 2, "name": "이용안내 & 정보 허브", "item": `${baseUrl}/information` },
          { "@type": "ListItem", "position": 3, "name": articleData.category || "정보", "item": canonicalUrl }
        ]
      }
    ]
  });

  const shortAnswerHtml = articleData.shortAnswer
    ? `<div style="background-color:#fef3c7; border:1px solid #f59e0b; border-radius:16px; padding:20px; margin-bottom:28px;">
        <strong style="color:#92400e; font-size:0.95rem; display:block; margin-bottom:8px;">💡 핵심 요약 및 전문 답변</strong>
        <p style="margin:0; color:#1c1917; font-size:0.95rem; line-height:1.6; font-weight:500;">${articleData.shortAnswer}</p>
      </div>`
    : "";

  let sectionsHtml = "";
  if (Array.isArray(articleData.sections) && articleData.sections.length > 0) {
    sectionsHtml = articleData.sections
      .map(
        (sec: any) => `
      <section style="margin-bottom: 24px;">
        ${sec.heading ? `<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 8px;">${sec.heading}</h2>` : ""}
        <div style="font-size: 0.95rem; line-height: 1.6; color: #44403c; white-space: pre-line;">${sec.content}</div>
      </section>
    `
      )
      .join("");
  } else if (articleData.content) {
    sectionsHtml = `<div style="font-size:0.95rem; line-height:1.7; color:#44403c; white-space:pre-line;">${articleData.content}</div>`;
  }

  let checklistHtml = "";
  if (Array.isArray(articleData.consumerChecklist) && articleData.consumerChecklist.length > 0) {
    checklistHtml = `
      <section style="background-color:#f5f5f4; border-radius:16px; padding:20px; margin-top:24px; border:1px solid #e7e5e4;">
        <h2 style="font-size:1.1rem; font-weight:bold; color:#1c1917; margin-top:0; margin-bottom:12px;">소비자 필수 체크리스트</h2>
        <ul style="margin:0; padding-left:20px; color:#44403c; font-size:0.9rem; line-height:1.6;">
          ${articleData.consumerChecklist.map((item: string) => `<li style="margin-bottom:6px;">${item}</li>`).join("")}
        </ul>
      </section>
    `;
  }

  let relatedProjectsHtml = "";
  if (slugStr === "busan-interior-remodeling-checklist") {
    relatedProjectsHtml = `
      <section style="background-color:#ffffff; border:1px solid #e7e5e4; border-radius:16px; padding:24px; margin-top:24px;">
        <h2 style="font-size:1.15rem; font-weight:bold; color:#1c1917; margin-top:0; margin-bottom:8px;">관련 실제 시공사례</h2>
        <p style="font-size:0.875rem; color:#57534e; margin-bottom:16px;">지니 인테리어의 실제 부산 구축 주거 공간 리모델링 시공사례를 확인하실 수 있습니다.</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
          <div style="background-color:#fafaf9; border:1px solid #e7e5e4; border-radius:12px; padding:16px;">
            <span style="background-color:#d1fae5; color:#065f46; font-size:0.75rem; font-weight:bold; padding:2px 8px; border-radius:9999px;">실제 시공사례</span>
            <span style="font-size:0.75rem; color:#78716c; margin-left:6px;">부산 동래구 사직동</span>
            <h3 style="font-size:1rem; font-weight:bold; margin:8px 0 4px 0;">
              <a href="/projects/busan-sajik-villa-remodeling" style="color:#1c1917; text-decoration:none;">부산 사직동 구축 빌라 리모델링</a>
            </h3>
            <p style="font-size:0.8rem; color:#57534e; margin:0 0 10px 0;">29평 구축 빌라 올리모델링 (화이트 톤 공간 구성 및 실용적 동선 개선)</p>
            <a href="/projects/busan-sajik-villa-remodeling" style="color:#b45309; font-weight:bold; font-size:0.8rem; text-decoration:underline;">사직동 시공사례 보러가기 &rarr;</a>
          </div>
          <div style="background-color:#fafaf9; border:1px solid #e7e5e4; border-radius:12px; padding:16px;">
            <span style="background-color:#d1fae5; color:#065f46; font-size:0.75rem; font-weight:bold; padding:2px 8px; border-radius:9999px;">실제 시공사례</span>
            <span style="font-size:0.75rem; color:#78716c; margin-left:6px;">부산 수영구 망미동</span>
            <h3 style="font-size:1rem; font-weight:bold; margin:8px 0 4px 0;">
              <a href="/projects/busan-mangmi-jugong-apartment-remodeling" style="color:#1c1917; text-decoration:none;">부산 망미 주공 아파트 27평 리모델링</a>
            </h3>
            <p style="font-size:0.8rem; color:#57534e; margin:0 0 10px 0;">27평 구축 아파트 주거 리모델링 (맞춤 주방 가구 및 시스템 수납 설계)</p>
            <a href="/projects/busan-mangmi-jugong-apartment-remodeling" style="color:#b45309; font-weight:bold; font-size:0.8rem; text-decoration:underline;">망미주공 시공사례 보러가기 &rarr;</a>
          </div>
        </div>
      </section>
    `;
  }

  const initialDataPayload = JSON.stringify({
    type: "article",
    slug: slugStr,
    data: articleData,
  }).replace(/</g, "\\u003c");

  const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${SITE_CONFIG.brand.nameKo}" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${pageTitle}" />
  <meta name="twitter:description" content="${pageDesc}" />
  <script type="application/ld+json">${jsonLd}</script>
  <script>window.__GENE_INITIAL_DATA__ = ${initialDataPayload};</script>
</head>
<body style="margin:0; background-color:#fafaf9; color:#1c1917; font-family:sans-serif;">
  <div id="root">
    <header style="background-color:#1c1917; color:#f5f5f4; padding:16px;">
      <div style="max-width:1200px; margin:auto; display:flex; justify-content:space-between; align-items:center;">
        <a href="/" style="color:#ffffff; text-decoration:none; font-weight:bold; font-size:1.25rem;">${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})</a>
        <span style="color:#fbbf24; font-size:0.75rem; border:1px solid #78350f; padding:4px 8px; border-radius:4px;">${SITE_CONFIG.company.licenseStatus}</span>
      </div>
    </header>
    <main style="max-width:800px; margin:40px auto; padding:0 16px;">
      <nav style="font-size:0.75rem; color:#78716c; margin-bottom:16px;">
        <a href="/" style="color:inherit; text-decoration:underline;">홈</a> &gt;
        <a href="/information" style="color:inherit; text-decoration:underline;">이용안내 & 정보 허브</a> &gt;
        <span style="font-weight:bold; color:#1c1917;">${articleData.category || "정보"}</span>
      </nav>
      <article style="background-color:#ffffff; padding:32px; border-radius:24px; border:1px solid #e7e5e4; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #f5f5f4; padding-bottom:16px; margin-bottom:24px;">
          <span style="color:#d97706; font-weight:bold; font-size:0.75rem; background-color:#fef3c7; padding:4px 8px; border-radius:9999px;">${articleData.category || "정보"}</span>
          <h1 style="font-size:1.75rem; font-weight:bold; margin-top:12px; margin-bottom:8px; line-height:1.3;">${articleData.title}</h1>
          <p style="color:#57534e; font-size:0.875rem;">${pageDesc}</p>
        </header>
        ${shortAnswerHtml}
        <div>
          ${sectionsHtml}
        </div>
        ${checklistHtml}
        ${relatedProjectsHtml}
      </article>
    </main>
    <footer style="background-color:#0c0a09; color:#a8a29e; padding:32px; font-size:0.75rem; text-align:center;">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName}). All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(fullHtml);
}
