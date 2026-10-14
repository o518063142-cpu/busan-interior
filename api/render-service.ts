import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SITE_CONFIG } from "./_config/siteConfig.js";
import { getFirestoreAdmin, isProjectPublic } from "./_lib/firebaseAdmin.js";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const FALLBACK_EDUCATIONAL_PROJECTS = [
  {
    title: "울산 초등학교 교실 인테리어",
    slug: "ulsan-elementary-school-classroom-interior",
    location: "울산광역시",
  },
  {
    title: "경남 초등학교 VR교실 리모델링",
    slug: "gyeongnam-elementary-school-vr-classroom-remodeling",
    location: "경상남도",
  },
  {
    title: "진주 학교 VR 스포츠실 인테리어｜체험형 교육공간 리모델링",
    slug: "jinju-school-vr-sports-room-interior",
    location: "경남 진주시",
  },
];

async function fetchEducationalProjects() {
  const projects = new Map<string, any>();

  for (const project of FALLBACK_EDUCATIONAL_PROJECTS) {
    projects.set(project.slug, project);
  }

  try {
    const db = await getFirestoreAdmin();
    if (db) {
      const snap = await db.collection("projects").where("category", "==", "공공·교육시설").get();
      for (const doc of snap.docs) {
        const raw: any = doc.data();
        if (!isProjectPublic(raw) || raw.isSample === true) continue;
        const slug = raw.slug || doc.id;
        projects.set(slug, {
          title: raw.title || "학교·교육시설 실제 시공사례",
          slug,
          location: raw.location || "",
        });
      }
    }
  } catch (error) {
    console.warn("[render-service] educational projects fetch warning:", error);
  }

  return Array.from(projects.values());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const baseUrl = "https://gene-interior.vercel.app";
  const canonicalUrl = `${baseUrl}/service`;
  const educationalProjects = await fetchEducationalProjects();

  const title = `서비스 안내 (SERVICE)｜부산 주거·상가·사무실·학교 인테리어｜${SITE_CONFIG.brand.nameKo}`;
  const description = `부산 동래구 명륜동 ${SITE_CONFIG.brand.nameKo}의 전문 인테리어 서비스. 아파트·주택 리모델링, 상가·매장, 사무실, 학교·공공 교육시설 인테리어를 부산 전 지역과 경남·울산에서 진행합니다.`;

  const educationalHtml = educationalProjects
    .map((project) => {
      const location = project.location
        ? `<span style="color:#78716c;"> · ${escapeHtml(project.location)}</span>`
        : "";
      return `<li><a href="/projects/${encodeURIComponent(project.slug)}" style="color:#92400e;font-weight:700;text-decoration:underline;">${escapeHtml(project.title)}</a>${location}</li>`;
    })
    .join("");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: "ko-KR",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_CONFIG.brand.nameKo,
      url: `${baseUrl}/`,
    },
  });

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body style="margin:0;font-family:Arial,sans-serif;color:#292524;background:#fafaf9;">
  <header style="background:#1c1917;color:white;padding:20px;">
    <div style="max-width:1100px;margin:auto;"><a href="/" style="color:white;text-decoration:none;font-weight:700;">${escapeHtml(SITE_CONFIG.brand.nameKo)} (${escapeHtml(SITE_CONFIG.brand.nameEn)})</a></div>
  </header>
  <main style="max-width:1100px;margin:auto;padding:40px 20px;line-height:1.7;">
    <h1>지니 인테리어 전문 시공 서비스 안내</h1>
    <p>${escapeHtml(description)}</p>

    <section>
      <h2>주거공간 인테리어·리모델링</h2>
      <p>아파트·빌라·주택·구축 주거공간의 실내건축과 리모델링을 진행합니다.</p>
    </section>
    <section>
      <h2>상업·업무공간 인테리어</h2>
      <p>상가·매장·사무실·스튜디오·음악연습실 등 공간의 용도와 운영방식에 맞춰 시공합니다.</p>
    </section>
    <section>
      <h2>학교·공공 교육시설 인테리어</h2>
      <p>학교 교실, VR교실, VR 스포츠실 등 교육활동과 공간 활용 목적에 맞춘 공공·교육시설 인테리어 실제 시공 경험을 확인하실 수 있습니다.</p>
      <h3>학교·교육시설 실제 시공사례</h3>
      <ul style="line-height:1.9;">${educationalHtml}</ul>
    </section>

    <section style="margin-top:32px;padding-top:20px;border-top:1px solid #e7e5e4;">
      <h2>${escapeHtml(SITE_CONFIG.brand.nameKo)} 사업장 정보</h2>
      <p><strong>주소:</strong> ${escapeHtml(SITE_CONFIG.company.address)} ${escapeHtml(SITE_CONFIG.company.addressDetail)}</p>
      <p><strong>영업시간:</strong> ${escapeHtml(SITE_CONFIG.company.operatingHours)} (${escapeHtml(SITE_CONFIG.company.closedDays)})</p>
      <p><strong>대표전화:</strong> ${escapeHtml(SITE_CONFIG.company.phone)}</p>
      <p><strong>등록:</strong> ${escapeHtml(SITE_CONFIG.company.licenseStatus)}</p>
    </section>
  </main>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  return res.status(200).send(html);
}
