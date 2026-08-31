import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SITE_CONFIG, SITE_ENTITY } from "./_config/siteConfig.js";
import { PROJECTS_DATA } from "./_data/projectsData.js";
import { getFirestoreAdmin, isProjectPublic } from "./_lib/firebaseAdmin.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;
  const slugStr = Array.isArray(slug) ? slug[0] : slug || "";

  if (!slugStr) {
    return res.status(400).send("Invalid slug parameter");
  }

  // 1. Check built-in 6 static projects first
  const staticFound = PROJECTS_DATA.find(
    (p) => p.id === slugStr || p.title.replace(/\s+/g, "-") === slugStr
  );

  let projectData: any = staticFound ? { ...staticFound } : null;

  // 2. If not found in static data, query Firestore
  if (!projectData) {
    try {
      const db = await getFirestoreAdmin();
      if (db) {
        // A. Try direct document ID lookup
        const docSnap = await db.collection("projects").doc(slugStr).get();
        if (docSnap.exists) {
          const raw = docSnap.data();
          if (isProjectPublic(raw)) {
            projectData = { id: docSnap.id, ...raw };
          }
        }

        // B. If not found by docId, try where slug == slugStr
        if (!projectData) {
          const qSnap = await db.collection("projects").where("slug", "==", slugStr).limit(1).get();
          if (!qSnap.empty) {
            const raw = qSnap.docs[0].data();
            if (isProjectPublic(raw)) {
              projectData = { id: qSnap.docs[0].id, ...raw };
            }
          }
        }

        // C. Fallback for Sajik-dong villa project if slug hasn't been written to Firestore yet
        if (!projectData && slugStr === "busan-sajik-villa-remodeling") {
          const sajikDoc = await db.collection("projects").doc("wkv0to3v3LYzluyUtBU2").get();
          if (sajikDoc.exists) {
            const raw = sajikDoc.data();
            if (isProjectPublic(raw)) {
              projectData = { id: sajikDoc.id, slug: "busan-sajik-villa-remodeling", ...raw };
            }
          }
        }
      }
    } catch (err) {
      console.warn("Firestore project fetch warning:", err);
    }
  }

  if (!projectData) {
    const notFoundHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>시공사례를 찾을 수 없습니다｜지니 인테리어</title>
  <meta name="robots" content="noindex, follow" />
</head>
<body style="font-family:sans-serif; text-align:center; padding:50px;">
  <h1>요청하신 시공사례를 찾을 수 없습니다.</h1>
  <p><a href="/projects">시공사례 포트폴리오 목록으로 이동</a></p>
</body>
</html>`;
    return res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(notFoundHtml);
  }

  const baseUrl = SITE_ENTITY.url.replace(/\/$/, "");
  const canonicalSlug =
    projectData.slug ||
    (projectData.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : projectData.id);

  // 301 Permanent Redirect if accessed via old docId or non-slug URL and a valid slug exists
  if (slugStr !== canonicalSlug && (projectData.slug || projectData.id === "wkv0to3v3LYzluyUtBU2")) {
    res.setHeader("Location", `/projects/${canonicalSlug}`);
    return res.status(301).send("");
  }

  const canonicalUrl = `${baseUrl}/projects/${canonicalSlug}`;

  const primaryImage =
    (projectData.afterImages && projectData.afterImages[0]) ||
    projectData.beforeImage ||
    projectData.imageUrl ||
    `${baseUrl}/images/hanshin_hero_bg_1784852933011.jpg`;

  const pageTitle = `${projectData.title}｜지니 인테리어 대표 시공사례`;
  const pageDesc =
    projectData.description ||
    `${SITE_CONFIG.brand.nameKo} 부산 ${projectData.location} ${projectData.category} 맞춤 리모델링 시공사례.`;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${canonicalUrl}#project`,
        "name": projectData.title,
        "description": pageDesc,
        "image": primaryImage,
        "url": canonicalUrl,
        "inLanguage": "ko-KR",
        "creator": {
          "@type": "Organization",
          "name": `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName})`,
          "url": baseUrl
        },
        "genre": projectData.category || "인테리어",
        "contentLocation": {
          "@type": "Place",
          "name": projectData.location || "부산광역시"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "홈", "item": `${baseUrl}/` },
          { "@type": "ListItem", "position": 2, "name": "시공사례", "item": `${baseUrl}/projects` },
          { "@type": "ListItem", "position": 3, "name": projectData.title, "item": canonicalUrl }
        ]
      }
    ]
  });

  const scopeText = typeof projectData.scope === "string" ? projectData.scope : "";
  const keyFeaturesList = Array.isArray(projectData.keyFeatures) ? projectData.keyFeatures : [];

  const initialDataPayload = JSON.stringify({
    type: "project",
    slug: slugStr,
    data: projectData,
  }).replace(/</g, "\\u003c");

  const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${pageTitle}" />
  <meta property="og:description" content="${pageDesc}" />
  <meta property="og:image" content="${primaryImage}" />
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
    <main style="max-width:900px; margin:40px auto; padding:0 16px;">
      <nav style="font-size:0.75rem; color:#78716c; margin-bottom:16px;">
        <a href="/" style="color:inherit; text-decoration:underline;">홈</a> &gt;
        <a href="/projects" style="color:inherit; text-decoration:underline;">시공사례 (PROJECT)</a> &gt;
        <span style="font-weight:bold; color:#1c1917;">${projectData.category || "사례"}</span>
      </nav>
      <article style="background-color:#ffffff; padding:32px; border-radius:24px; border:1px solid #e7e5e4; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <header style="border-bottom:1px solid #f5f5f4; padding-bottom:16px; margin-bottom:24px;">
          <span style="color:#d97706; font-weight:bold; font-size:0.75rem; background-color:#fef3c7; padding:4px 8px; border-radius:9999px;">${projectData.category || "시공사례"}</span>
          <h1 style="font-size:1.75rem; font-weight:bold; margin-top:12px; margin-bottom:8px; line-height:1.3;">${projectData.title}</h1>
          <p style="color:#57534e; font-size:0.875rem;">${pageDesc}</p>
        </header>
        ${
          primaryImage
            ? `<div style="margin-bottom:24px; border-radius:16px; overflow:hidden; border:1px solid #e7e5e4;">
                 <img src="${primaryImage}" alt="${projectData.title}" style="width:100%; height:auto; display:block;" />
               </div>`
            : ""
        }
        <div style="background-color:#f5f5f4; padding:20px; border-radius:16px; margin-bottom:24px;">
          <h2 style="font-size:1rem; font-weight:bold; margin-top:0; margin-bottom:12px; color:#1c1917;">주요 공사 정보</h2>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.875rem; color:#44403c;">
            <div><strong>공간 유형:</strong> ${projectData.spaceTypeDetail || projectData.spaceType || projectData.category || "-"}</div>
            <div><strong>시공 위치:</strong> ${projectData.location || "-"}</div>
            <div><strong>공사 면적:</strong> ${projectData.area || "-"}</div>
            <div><strong>공사 기간:</strong> ${projectData.duration || projectData.period || "-"}</div>
          </div>
        </div>
        ${
          scopeText
            ? `<section style="margin-bottom:24px;">
                 <h2 style="font-size:1.125rem; font-weight:bold; margin-bottom:12px; color:#1c1917;">공사 범위</h2>
                 <p style="font-size:0.875rem; line-height:1.6; color:#44403c;">${scopeText}</p>
               </section>`
            : ""
        }
        ${
          keyFeaturesList.length > 0
            ? `<section style="margin-bottom:24px;">
                 <h2 style="font-size:1.125rem; font-weight:bold; margin-bottom:12px; color:#1c1917;">핵심 시공 포인트</h2>
                 <ul style="padding-left:20px; margin:0; font-size:0.875rem; color:#44403c; line-height:1.6;">
                   ${keyFeaturesList.map((f: string) => `<li>${f}</li>`).join("")}
                 </ul>
               </section>`
            : ""
        }
        ${
          projectData.description
            ? `<section style="margin-bottom:24px;">
                 <h2 style="font-size:1.125rem; font-weight:bold; margin-bottom:12px; color:#1c1917;">시공 상세 설명</h2>
                 <p style="font-size:0.875rem; line-height:1.6; color:#44403c; white-space:pre-line;">${projectData.description}</p>
               </section>`
            : ""
        }
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
