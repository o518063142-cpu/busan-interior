import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getFirestoreAdmin, isProjectPublic } from "./_lib/firebaseAdmin";
import { SITE_ENTITY } from "./_config/siteConfig";
import { PROJECTS_DATA } from "./_data/projectsData";
import { INFORMATION_ARTICLES } from "./_data/informationData";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const baseUrl = SITE_ENTITY.url.replace(/\/$/, "");

  // 1. 고정 공개 기본 페이지
  const fixedUrls = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/about`, priority: "0.9", changefreq: "weekly" },
    { loc: `${baseUrl}/service`, priority: "0.9", changefreq: "weekly" },
    { loc: `${baseUrl}/projects`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/information`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/trust`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/contact`, priority: "0.8", changefreq: "weekly" },
    { loc: `${baseUrl}/ai-estimate`, priority: "0.7", changefreq: "weekly" },
  ];

  const dynamicUrls: Array<{ loc: string; lastmod?: string }> = [];

  // 2. 정적 6대 시공사례 프로젝트 상세 URL
  for (const proj of PROJECTS_DATA) {
    dynamicUrls.push({
      loc: `${baseUrl}/projects/${proj.id}`,
    });
  }

  // 3. 정적 지식센터(KNOWLEDGE CENTER) 질문형 콘텐츠 상세 URL
  for (const art of INFORMATION_ARTICLES) {
    dynamicUrls.push({
      loc: `${baseUrl}/information/${art.slug}`,
      lastmod: art.updatedAt || art.publishedAt,
    });
  }

  // 4. Firestore 동적 프로젝트 및 지식센터 게시글 조회
  try {
    const db = await getFirestoreAdmin();
    if (db) {
      // Projects 조회
      const projectsSnap = await db.collection("projects").get();
      if (!projectsSnap.empty) {
        for (const doc of projectsSnap.docs) {
          const data = doc.data();
          if (isProjectPublic(data)) {
            const urlKey = data.slug || doc.id;
            let lastmod: string | undefined;
            if (data.updatedAt) {
              lastmod = typeof data.updatedAt.toDate === "function" 
                ? data.updatedAt.toDate().toISOString().split("T")[0]
                : typeof data.updatedAt === "string" ? data.updatedAt.split("T")[0] : undefined;
            } else if (data.createdAt) {
              lastmod = typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toISOString().split("T")[0]
                : typeof data.createdAt === "string" ? data.createdAt.split("T")[0] : undefined;
            }

            dynamicUrls.push({
              loc: `${baseUrl}/projects/${urlKey}`,
              lastmod,
            });
          }
        }
      }

      // Articles (지식센터) 조회
      try {
        const articlesSnap = await db.collection("articles").where("status", "==", "public").get();
        if (!articlesSnap.empty) {
          for (const doc of articlesSnap.docs) {
            const data = doc.data();
            const urlKey = data.slug || doc.id;
            let lastmod: string | undefined;
            if (data.updatedAt) {
              lastmod = typeof data.updatedAt.toDate === "function" 
                ? data.updatedAt.toDate().toISOString().split("T")[0]
                : typeof data.updatedAt === "string" ? data.updatedAt.split("T")[0] : undefined;
            } else if (data.publishedAt) {
              lastmod = typeof data.publishedAt === "string" ? data.publishedAt.split("T")[0] : undefined;
            }
            dynamicUrls.push({
              loc: `${baseUrl}/information/${urlKey}`,
              lastmod,
            });
          }
        }
      } catch {
        // articles 컬렉션 미존재 시 무시
      }
    }
  } catch (err) {
    console.warn("Notice: Firestore sitemap fetch notice:", err);
  }

  // 중복 URL 제거
  const seenUrls = new Set<string>();
  const allEntries: Array<{ loc: string; lastmod?: string; priority?: string; changefreq?: string }> = [];

  for (const item of fixedUrls) {
    if (!seenUrls.has(item.loc)) {
      seenUrls.add(item.loc);
      allEntries.push(item);
    }
  }

  for (const item of dynamicUrls) {
    if (!seenUrls.has(item.loc)) {
      seenUrls.add(item.loc);
      allEntries.push(item);
    }
  }

  const xmlUrls = allEntries
    .map((entry) => {
      let node = `  <url>\n    <loc>${entry.loc}</loc>`;
      if (entry.lastmod) {
        node += `\n    <lastmod>${entry.lastmod}</lastmod>`;
      }
      if (entry.changefreq) {
        node += `\n    <changefreq>${entry.changefreq}</changefreq>`;
      }
      if (entry.priority) {
        node += `\n    <priority>${entry.priority}</priority>`;
      }
      node += `\n  </url>`;
      return node;
    })
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(sitemapXml);
}
