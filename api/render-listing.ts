import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { SITE_CONFIG } from "./_config/siteConfig.js";
import { PROJECTS_DATA, type ProjectItem } from "./_data/projectsData.js";
import { getFirestoreAdmin, isProjectPublic } from "./_lib/firebaseAdmin.js";

/**
 * 프로젝트 목록 병합 함수 (HomePage.tsx, ProjectPage.tsx의 규칙 준수)
 * 1. Firestore의 실시간 프로젝트 우선 (신규 등록 순)
 * 2. 내장 PROJECTS_DATA (정적 샘플 프로젝트) 중복 제거 후 추가
 * 3. 실제 시공사례와 샘플 프로젝트를 분리 보존
 */
async function fetchCombinedProjects(): Promise<{
  allProjects: ProjectItem[];
  realProjects: ProjectItem[];
  sampleProjects: ProjectItem[];
}> {
  const firestoreProjects: ProjectItem[] = [];

  try {
    const db = await getFirestoreAdmin();
    if (db) {
      const snap = await db.collection("projects").get();
      if (!snap.empty) {
        for (const doc of snap.docs) {
          const d = doc.data();
          if (isProjectPublic(d)) {
            firestoreProjects.push({
              id: doc.id,
              slug: d.slug || (doc.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : doc.id),
              isSample: d.isSample === true,
              title: d.title || "",
              location: d.location || "",
              category: d.category || "주거",
              spaceTypeDetail: d.spaceTypeDetail || d.spaceType || "",
              area: d.area || "",
              duration: d.duration || d.period || "",
              scope: d.scope || "",
              clientRequest: d.clientRequest || "",
              beforeImage: d.beforeImage || "",
              inProgressImage: d.inProgressImage || "",
              afterImages: Array.isArray(d.afterImages) ? d.afterImages : [],
              description: d.description || "",
              keyFeatures: Array.isArray(d.keyFeatures) ? d.keyFeatures : [],
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Firestore Admin fetchCombinedProjects warning:", err);
  }

  // Fallback: If Admin credentials are not present in current environment, fetch via Firestore REST API
  if (firestoreProjects.length === 0) {
    try {
      const restUrl = "https://firestore.googleapis.com/v1/projects/busan-interior/databases/(default)/documents/projects";
      const restRes = await fetch(restUrl);
      if (restRes.ok) {
        const restData: any = await restRes.json();
        if (restData.documents && Array.isArray(restData.documents)) {
          for (const doc of restData.documents) {
            const docId = doc.name.split("/").pop() || "";
            const f = doc.fields || {};
            const parseVal = (v: any): any => {
              if (!v) return "";
              if (v.stringValue !== undefined) return v.stringValue;
              if (v.booleanValue !== undefined) return v.booleanValue;
              if (v.arrayValue && v.arrayValue.values) return v.arrayValue.values.map(parseVal);
              return "";
            };
            const rawObj = {
              status: parseVal(f.status),
              isPublished: parseVal(f.isPublished),
            };
            if (isProjectPublic(rawObj)) {
              firestoreProjects.push({
                id: docId,
                slug: parseVal(f.slug) || (docId === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : docId),
                isSample: parseVal(f.isSample) === true,
                title: parseVal(f.title) || "",
                location: parseVal(f.location) || "",
                category: parseVal(f.category) || "주거",
                spaceTypeDetail: parseVal(f.spaceTypeDetail) || parseVal(f.spaceType) || "",
                area: parseVal(f.area) || "",
                duration: parseVal(f.duration) || parseVal(f.period) || "",
                scope: parseVal(f.scope) || "",
                clientRequest: parseVal(f.clientRequest) || "",
                beforeImage: parseVal(f.beforeImage) || "",
                inProgressImage: parseVal(f.inProgressImage) || "",
                afterImages: Array.isArray(parseVal(f.afterImages)) ? parseVal(f.afterImages) : [],
                description: parseVal(f.description) || "",
                keyFeatures: Array.isArray(parseVal(f.keyFeatures)) ? parseVal(f.keyFeatures) : [],
              });
            }
          }
        }
      }
    } catch (restErr) {
      console.warn("Firestore REST fetch fallback warning:", restErr);
    }
  }

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const realProjects: ProjectItem[] = [];
  const sampleProjects: ProjectItem[] = [];

  // 1. Process Firestore real-time projects
  for (const fp of firestoreProjects) {
    const slugKey = fp.slug || fp.id;
    if (!seenIds.has(fp.id) && !seenSlugs.has(slugKey)) {
      seenIds.add(fp.id);
      seenSlugs.add(slugKey);
      if (fp.isSample) {
        sampleProjects.push(fp);
      } else {
        realProjects.push(fp);
      }
    }
  }

  // 2. Add base PROJECTS_DATA (preserving sample projects & baseline portfolio)
  for (const bp of PROJECTS_DATA) {
    const slugKey = bp.slug || bp.id;
    if (!seenIds.has(bp.id) && !seenSlugs.has(slugKey)) {
      seenIds.add(bp.id);
      seenSlugs.add(slugKey);
      if (bp.isSample) {
        sampleProjects.push(bp);
      } else {
        realProjects.push(bp);
      }
    }
  }

  return {
    allProjects: [...realProjects, ...sampleProjects],
    realProjects,
    sampleProjects,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const page = (req.query.page as string) || "home";
  const isProjectsPage = page === "projects" || req.url?.startsWith("/projects");

  const { allProjects, realProjects, sampleProjects } = await fetchCombinedProjects();

  const baseUrl = "https://gene-interior.vercel.app";
  const canonicalUrl = isProjectsPage ? `${baseUrl}/projects` : `${baseUrl}/`;

  const pageTitle = isProjectsPage
    ? `시공사례 포트폴리오｜${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})`
    : `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})｜부산 실내건축·인테리어·리모델링`;

  const pageDesc = isProjectsPage
    ? `지니 인테리어(GENE INTERIOR) 실제 시공사례 및 포트폴리오. 부산·경남·울산 아파트, 빌라, 상가, 카페, 사무실, 공공·교육시설 실내건축 완공 현장.`
    : SITE_CONFIG.seo.metaDescription;

  // Semantic Crawlable HTML for search engines and AI agents
  // Clean, structured HTML containing crawlable internal links <a href="/projects/{slug}">
  const realProjectsHtml = realProjects
    .map((p) => {
      const linkHref = `/projects/${p.slug || p.id}`;
      return `
        <article style="border-bottom:1px solid #e7e5e4; padding:16px 0;">
          <h3 style="font-size:1.1rem; margin:0 0 6px 0;">
            <a href="${linkHref}" style="color:#1c1917; text-decoration:none; font-weight:bold;">${p.title}</a>
          </h3>
          <p style="margin:0 0 4px 0; color:#57534e; font-size:0.875rem;">
            <span><strong>지역:</strong> ${p.location || "부산"}</span> |
            <span><strong>공간유형:</strong> ${p.category} ${p.spaceTypeDetail ? `(${p.spaceTypeDetail})` : ""}</span> |
            <span><strong>공사기간:</strong> ${p.duration || "-"}</span>
          </p>
          ${p.scope ? `<p style="margin:0; color:#78716c; font-size:0.825rem;"><strong>공사범위:</strong> ${p.scope}</p>` : ""}
        </article>
      `;
    })
    .join("");

  const sampleProjectsHtml = sampleProjects
    .map((p) => {
      const linkHref = `/projects/${p.slug || p.id}`;
      return `
        <article style="border-bottom:1px solid #e7e5e4; padding:14px 0;">
          <h4 style="font-size:0.95rem; margin:0 0 4px 0;">
            <span style="font-size:0.75rem; color:#d97706; background-color:#fef3c7; padding:2px 6px; border-radius:4px; margin-right:6px;">샘플 프로젝트</span>
            <a href="${linkHref}" style="color:#292524; text-decoration:none;">${p.title}</a>
          </h4>
          <p style="margin:0; color:#78716c; font-size:0.8rem;">
            <span><strong>지역:</strong> ${p.location}</span> |
            <span><strong>공간유형:</strong> ${p.category}</span>
          </p>
        </article>
      `;
    })
    .join("");

  const semanticContent = `
    <header style="border-bottom:1px solid #e7e5e4; padding:24px 16px; max-width:1200px; margin:0 auto;">
      <h1 style="font-size:1.5rem; font-weight:bold; margin:0 0 8px 0; color:#1c1917;">${pageTitle}</h1>
      <p style="margin:0; color:#57534e; font-size:0.9rem;">${pageDesc}</p>
      <nav style="margin-top:12px; font-size:0.85rem;">
        <a href="/" style="color:#0284c7; margin-right:12px;">홈</a>
        <a href="/projects" style="color:#0284c7; margin-right:12px;">시공사례 (PROJECT)</a>
        <a href="/information/busan-interior-remodeling-checklist" style="color:#0284c7;">인테리어 체크리스트</a>
      </nav>
    </header>

    <main style="max-width:1200px; margin:24px auto; padding:0 16px;">
      <section aria-label="실제 시공사례 포트폴리오">
        <h2 style="font-size:1.25rem; font-weight:bold; color:#1c1917; border-bottom:2px solid #1c1917; padding-bottom:8px; margin-bottom:16px;">
          실제 시공사례 (${realProjects.length}건)
        </h2>
        <div class="real-projects-list">
          ${realProjectsHtml || "<p>등록된 실제 시공사례가 있습니다.</p>"}
        </div>
      </section>

      <section aria-label="샘플 프로젝트 포트폴리오" style="margin-top:40px;">
        <h2 style="font-size:1.15rem; font-weight:bold; color:#57534e; border-bottom:1px solid #d6d3d1; padding-bottom:6px; margin-bottom:12px;">
          기본 포트폴리오 / 샘플 프로젝트 (${sampleProjects.length}건)
        </h2>
        <div class="sample-projects-list">
          ${sampleProjectsHtml}
        </div>
      </section>
    </main>

    <footer style="background-color:#0c0a09; color:#a8a29e; padding:32px 16px; margin-top:48px; font-size:0.75rem; text-align:center;">
      <p>© ${new Date().getFullYear()} ${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.legal.businessName}). 실내건축공사업 등록업체.</p>
    </footer>
  `;

  // Read index.html template and inject SSR content into <div id="root">
  let template = "";
  try {
    const indexPath = path.resolve(process.cwd(), "index.html");
    if (fs.existsSync(indexPath)) {
      template = fs.readFileSync(indexPath, "utf-8");
    }
  } catch (err) {
    console.warn("Index.html read warning:", err);
  }

  let fullHtml = "";
  if (template) {
    // Replace <title>, <meta description>, <link canonical> with accurate page info
    let modified = template;
    modified = modified.replace(/<title>.*?<\/title>/i, `<title>${pageTitle}</title>`);
    modified = modified.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${pageDesc}" />`);
    modified = modified.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
    modified = modified.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${pageTitle}" />`);
    modified = modified.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${pageDesc}" />`);
    modified = modified.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

    // Inject semantic crawlable HTML inside <div id="root">
    // When main.tsx executes on client, createRoot(rootElement).render() will cleanly replace this initial HTML
    // ensuring zero double-rendering for users and 100% crawlability for search engines and AI agents
    modified = modified.replace(
      '<div id="root"></div>',
      `<div id="root">${semanticContent}</div>`
    );

    fullHtml = modified;
  } else {
    // Fallback standalone HTML
    fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}" />
  <link rel="canonical" href="${canonicalUrl}" />
</head>
<body>
  <div id="root">
    ${semanticContent}
  </div>
</body>
</html>`;
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=1800, stale-while-revalidate=86400");
  return res.status(200).send(fullHtml);
}
