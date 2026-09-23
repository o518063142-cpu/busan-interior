import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { SITE_CONFIG } from "./_config/siteConfig.js";
import { PROJECTS_DATA, type ProjectItem } from "./_data/projectsData.js";
import { getFirestoreAdmin, isProjectPublic } from "./_lib/firebaseAdmin.js";

/**
 * ============================================================
 * GENE INTERIOR - PROJECT LIST SSR
 * ============================================================
 *
 * 목적
 * 1. Firestore 실제 시공사례 자동 반영
 * 2. PROJECTS_DATA 샘플 프로젝트 6개 유지
 * 3. Admin SDK + Firestore REST 결과 병합
 * 4. 중복 프로젝트 제거
 * 5. 신규 실제 시공사례 등록 시 재배포 없이 /projects 자동 반영
 * 6. 검색엔진 / AI 크롤러가 실제 내부 링크를 HTML에서 직접 확인
 * ============================================================
 */

type AnyProject = ProjectItem & {
  [key: string]: any;
};

/**
 * Firestore REST API value parser
 */
function parseFirestoreValue(value: any): any {
  if (!value) return "";

  if (value.stringValue !== undefined) {
    return value.stringValue;
  }

  if (value.booleanValue !== undefined) {
    return value.booleanValue;
  }

  if (value.integerValue !== undefined) {
    return Number(value.integerValue);
  }

  if (value.doubleValue !== undefined) {
    return Number(value.doubleValue);
  }

  if (value.timestampValue !== undefined) {
    return value.timestampValue;
  }

  if (value.nullValue !== undefined) {
    return null;
  }

  if (value.arrayValue !== undefined) {
    const values = value.arrayValue?.values || [];
    return values.map((item: any) => parseFirestoreValue(item));
  }

  if (value.mapValue !== undefined) {
    const fields = value.mapValue?.fields || {};
    const result: Record<string, any> = {};

    for (const [key, fieldValue] of Object.entries(fields)) {
      result[key] = parseFirestoreValue(fieldValue);
    }

    return result;
  }

  return "";
}

/**
 * Firestore 원본 데이터를 ProjectItem 형태로 통일
 */
function normalizeProject(
  id: string,
  raw: any
): AnyProject {
  const fallbackSlug =
    id === "wkv0to3v3LYzluyUtBU2"
      ? "busan-sajik-villa-remodeling"
      : id;

  return {
    id,
    slug: raw.slug || fallbackSlug,

    // 실제 프로젝트는 기본 false
    isSample: raw.isSample === true,

    title: raw.title || "",
    location: raw.location || "",
    category: raw.category || "주거",

    spaceTypeDetail:
      raw.spaceTypeDetail ||
      raw.spaceType ||
      "",

    area: raw.area || "",

    duration:
      raw.duration ||
      raw.period ||
      "",

    scope: raw.scope || "",
    clientRequest: raw.clientRequest || "",

    beforeImage: raw.beforeImage || "",
    inProgressImage: raw.inProgressImage || "",

    afterImages: Array.isArray(raw.afterImages)
      ? raw.afterImages
      : [],

    description: raw.description || "",

    keyFeatures: Array.isArray(raw.keyFeatures)
      ? raw.keyFeatures
      : [],

    status: raw.status,
    isPublished: raw.isPublished,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

/**
 * 프로젝트를 병합하면서 ID/SLUG 중복 제거
 */
function mergeProject(
  target: AnyProject[],
  project: AnyProject,
  seenIds: Set<string>,
  seenSlugs: Set<string>
) {
  if (!project || !project.id) {
    return;
  }

  const slugKey =
    project.slug ||
    project.id;

  if (
    seenIds.has(project.id) ||
    seenSlugs.has(slugKey)
  ) {
    return;
  }

  seenIds.add(project.id);
  seenSlugs.add(slugKey);

  target.push(project);
}

/**
 * Firestore Admin SDK에서 프로젝트 조회
 */
async function fetchProjectsFromAdmin(): Promise<AnyProject[]> {
  const projects: AnyProject[] = [];

  try {
    const db = await getFirestoreAdmin();

    if (!db) {
      console.log(
        "[render-listing] Firebase Admin credentials unavailable. REST fetch will still run."
      );

      return projects;
    }

    const snap =
      await db.collection("projects").get();

    if (snap.empty) {
      console.log(
        "[render-listing] Firestore Admin returned 0 projects."
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
      `[render-listing] Admin public projects: ${projects.length}`
    );
  } catch (error) {
    console.warn(
      "[render-listing] Firestore Admin fetch warning:",
      error
    );
  }

  return projects;
}

/**
 * Firestore REST API에서도 프로젝트 조회
 *
 * 중요:
 * Admin 결과가 존재하더라도 REST를 항상 실행합니다.
 * 이전 코드처럼 Admin 결과가 1건 이상이면 REST를 건너뛰지 않습니다.
 */
async function fetchProjectsFromRest(): Promise<AnyProject[]> {
  const projects: AnyProject[] = [];

  try {
    const restUrl =
      "https://firestore.googleapis.com/v1/projects/busan-interior/databases/(default)/documents/projects?pageSize=1000";

    const response = await fetch(
      restUrl,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `[render-listing] Firestore REST HTTP ${response.status}`
      );

      return projects;
    }

    const data: any =
      await response.json();

    const documents =
      Array.isArray(data.documents)
        ? data.documents
        : [];

    for (const doc of documents) {
      const id =
        doc.name
          ?.split("/")
          .pop() || "";

      if (!id) {
        continue;
      }

      const fields =
        doc.fields || {};

      const raw: Record<string, any> = {};

      for (const [key, value] of Object.entries(fields)) {
        raw[key] =
          parseFirestoreValue(value);
      }

      if (!isProjectPublic(raw)) {
        continue;
      }

      projects.push(
        normalizeProject(
          id,
          raw
        )
      );
    }

    console.log(
      `[render-listing] REST public projects: ${projects.length}`
    );
  } catch (error) {
    console.warn(
      "[render-listing] Firestore REST fetch warning:",
      error
    );
  }

  return projects;
}

/**
 * 실제 프로젝트 + 샘플 프로젝트 통합
 *
 * 우선순위
 * 1. Firestore Admin
 * 2. Firestore REST
 * 3. PROJECTS_DATA
 *
 * PROJECTS_DATA의 샘플 6개는 삭제하지 않습니다.
 */
async function fetchCombinedProjects(): Promise<{
  allProjects: AnyProject[];
  realProjects: AnyProject[];
  sampleProjects: AnyProject[];
}> {
  /**
   * Admin / REST를 동시에 조회
   */
  const [
    adminProjects,
    restProjects,
  ] = await Promise.all([
    fetchProjectsFromAdmin(),
    fetchProjectsFromRest(),
  ]);

  const firestoreProjects: AnyProject[] = [];

  const firestoreSeenIds =
    new Set<string>();

  const firestoreSeenSlugs =
    new Set<string>();

  /**
   * Admin 결과 우선
   */
  for (const project of adminProjects) {
    mergeProject(
      firestoreProjects,
      project,
      firestoreSeenIds,
      firestoreSeenSlugs
    );
  }

  /**
   * REST 결과 추가
   *
   * Admin에서 누락된 프로젝트가 있으면 여기서 추가됩니다.
   */
  for (const project of restProjects) {
    mergeProject(
      firestoreProjects,
      project,
      firestoreSeenIds,
      firestoreSeenSlugs
    );
  }

  const realProjects: AnyProject[] = [];
  const sampleProjects: AnyProject[] = [];

  const seenIds =
    new Set<string>();

  const seenSlugs =
    new Set<string>();

  /**
   * Firestore 프로젝트 분류
   */
  for (const project of firestoreProjects) {
    const slugKey =
      project.slug ||
      project.id;

    if (
      seenIds.has(project.id) ||
      seenSlugs.has(slugKey)
    ) {
      continue;
    }

    seenIds.add(project.id);
    seenSlugs.add(slugKey);

    if (project.isSample === true) {
      sampleProjects.push(project);
    } else {
      realProjects.push(project);
    }
  }

  /**
   * PROJECTS_DATA 추가
   *
   * 샘플 프로젝트 6개를 여기서 계속 유지합니다.
   */
  for (const baseProject of PROJECTS_DATA) {
    const project =
      baseProject as AnyProject;

    const slugKey =
      project.slug ||
      project.id;

    if (
      seenIds.has(project.id) ||
      seenSlugs.has(slugKey)
    ) {
      continue;
    }

    seenIds.add(project.id);
    seenSlugs.add(slugKey);

    if (project.isSample === true) {
      sampleProjects.push(project);
    } else {
      realProjects.push(project);
    }
  }

  console.log(
    `[render-listing] FINAL real=${realProjects.length}, sample=${sampleProjects.length}, total=${realProjects.length + sampleProjects.length}`
  );

  return {
    realProjects,
    sampleProjects,

    allProjects: [
      ...realProjects,
      ...sampleProjects,
    ],
  };
}

/**
 * HTML 특수문자 escape
 *
 * 관리자 입력값이 HTML에 직접 삽입되므로
 * 제목/지역/설명 등에 의한 HTML 깨짐을 방지합니다.
 */
function escapeHtml(
  value: any
): string {
  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * ============================================================
 * VERCEL HANDLER
 * ============================================================
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const page =
    (req.query.page as string) ||
    "home";

  const isProjectsPage =
    page === "projects" ||
    req.url?.startsWith("/projects");

  const {
    realProjects,
    sampleProjects,
  } =
    await fetchCombinedProjects();

  const baseUrl =
    "https://gene-interior.vercel.app";

  const canonicalUrl =
    isProjectsPage
      ? `${baseUrl}/projects`
      : `${baseUrl}/`;

  const pageTitle =
    isProjectsPage
      ? `시공사례 포트폴리오｜${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})`
      : `${SITE_CONFIG.brand.nameKo} (${SITE_CONFIG.brand.nameEn})｜부산 실내건축·인테리어·리모델링`;

  const pageDesc =
    isProjectsPage
      ? "지니 인테리어(GENE INTERIOR) 실제 시공사례 및 포트폴리오. 부산·울산·경남 아파트, 빌라, 상가, 음악연습실, 사무실, 학교·공공 교육시설 실내건축 완공 현장."
      : SITE_CONFIG.seo.metaDescription;

  /**
   * ============================================================
   * 실제 시공사례 HTML
   * ============================================================
   */
  const realProjectsHtml =
    realProjects
      .map((project) => {
        const slug =
          project.slug ||
          project.id;

        const linkHref =
          `/projects/${encodeURIComponent(slug)}`;

        return `
          <article style="border-bottom:1px solid #e7e5e4; padding:16px 0;">

            <h3 style="font-size:1.1rem; margin:0 0 6px 0;">

              <a
                href="${linkHref}"
                style="color:#1c1917; text-decoration:none; font-weight:bold;"
              >
                ${escapeHtml(project.title)}
              </a>

            </h3>

            <p style="margin:0 0 4px 0; color:#57534e; font-size:0.875rem;">

              <span>
                <strong>지역:</strong>
                ${escapeHtml(project.location || "부산")}
              </span>

              |

              <span>
                <strong>공간유형:</strong>
                ${escapeHtml(project.category || "인테리어")}
                ${
                  project.spaceTypeDetail
                    ? `(${escapeHtml(project.spaceTypeDetail)})`
                    : ""
                }
              </span>

              |

              <span>
                <strong>공사기간:</strong>
                ${escapeHtml(project.duration || "-")}
              </span>

            </p>

            ${
              project.scope
                ? `
                  <p style="margin:0; color:#78716c; font-size:0.825rem;">
                    <strong>공사범위:</strong>
                    ${escapeHtml(project.scope)}
                  </p>
                `
                : ""
            }

          </article>
        `;
      })
      .join("");

  /**
   * ============================================================
   * 샘플 프로젝트 HTML
   * ============================================================
   */
  const sampleProjectsHtml =
    sampleProjects
      .map((project) => {
        const slug =
          project.slug ||
          project.id;

        const linkHref =
          `/projects/${encodeURIComponent(slug)}`;

        return `
          <article style="border-bottom:1px solid #e7e5e4; padding:14px 0;">

            <h4 style="font-size:0.95rem; margin:0 0 4px 0;">

              <span
                style="
                  font-size:0.75rem;
                  color:#d97706;
                  background-color:#fef3c7;
                  padding:2px 6px;
                  border-radius:4px;
                  margin-right:6px;
                "
              >
                샘플 프로젝트
              </span>

              <a
                href="${linkHref}"
                style="color:#292524; text-decoration:none;"
              >
                ${escapeHtml(project.title)}
              </a>

            </h4>

            <p style="margin:0; color:#78716c; font-size:0.8rem;">

              <span>
                <strong>지역:</strong>
                ${escapeHtml(project.location)}
              </span>

              |

              <span>
                <strong>공간유형:</strong>
                ${escapeHtml(project.category)}
              </span>

            </p>

          </article>
        `;
      })
      .join("");

  /**
   * ============================================================
   * 검색엔진 / AI용 Semantic HTML
   * ============================================================
   */
  const semanticContent = `
    <header
      style="
        border-bottom:1px solid #e7e5e4;
        padding:24px 16px;
        max-width:1200px;
        margin:0 auto;
      "
    >

      <h1
        style="
          font-size:1.5rem;
          font-weight:bold;
          margin:0 0 8px 0;
          color:#1c1917;
        "
      >
        ${escapeHtml(pageTitle)}
      </h1>

      <p
        style="
          margin:0;
          color:#57534e;
          font-size:0.9rem;
        "
      >
        ${escapeHtml(pageDesc)}
      </p>

      <nav
        style="
          margin-top:12px;
          font-size:0.85rem;
        "
      >

        <a
          href="/"
          style="color:#0284c7; margin-right:12px;"
        >
          홈
        </a>

        <a
          href="/projects"
          style="color:#0284c7; margin-right:12px;"
        >
          시공사례 (PROJECT)
        </a>

        <a
          href="/information/busan-interior-remodeling-checklist"
          style="color:#0284c7;"
        >
          인테리어 체크리스트
        </a>

      </nav>

    </header>

    <main
      style="
        max-width:1200px;
        margin:24px auto;
        padding:0 16px;
      "
    >

      <section aria-label="실제 시공사례 포트폴리오">

        <h2
          style="
            font-size:1.25rem;
            font-weight:bold;
            color:#1c1917;
            border-bottom:2px solid #1c1917;
            padding-bottom:8px;
            margin-bottom:16px;
          "
        >
          실제 시공사례 (${realProjects.length}건)
        </h2>

        <div class="real-projects-list">

          ${
            realProjectsHtml ||
            "<p>현재 공개된 실제 시공사례를 준비 중입니다.</p>"
          }

        </div>

      </section>

      <section
        aria-label="샘플 프로젝트 포트폴리오"
        style="margin-top:40px;"
      >

        <h2
          style="
            font-size:1.15rem;
            font-weight:bold;
            color:#57534e;
            border-bottom:1px solid #d6d3d1;
            padding-bottom:6px;
            margin-bottom:12px;
          "
        >
          기본 포트폴리오 / 샘플 프로젝트
          (${sampleProjects.length}건)
        </h2>

        <div class="sample-projects-list">

          ${sampleProjectsHtml}

        </div>

      </section>

    </main>

    <footer
      style="
        background-color:#0c0a09;
        color:#a8a29e;
        padding:32px 16px;
        margin-top:48px;
        font-size:0.75rem;
        text-align:center;
      "
    >

      <p>
        © ${new Date().getFullYear()}
        ${escapeHtml(SITE_CONFIG.brand.nameKo)}
        (${escapeHtml(SITE_CONFIG.legal.businessName)}).
        실내건축공사업 등록업체.
      </p>

    </footer>
  `;

  /**
   * ============================================================
   * INDEX.HTML TEMPLATE
   * ============================================================
   */
  let template = "";

  try {
    const indexPath =
      path.resolve(
        process.cwd(),
        "index.html"
      );

    if (
      fs.existsSync(indexPath)
    ) {
      template =
        fs.readFileSync(
          indexPath,
          "utf-8"
        );
    }
  } catch (error) {
    console.warn(
      "[render-listing] index.html read warning:",
      error
    );
  }

  let fullHtml = "";

  if (template) {
    let modified =
      template;

    /**
     * TITLE
     */
    if (
      /<title>.*?<\/title>/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<title>.*?<\/title>/i,
          `<title>${escapeHtml(pageTitle)}</title>`
        );
    } else {
      modified =
        modified.replace(
          "</head>",
          `<title>${escapeHtml(pageTitle)}</title></head>`
        );
    }

    /**
     * DESCRIPTION
     */
    if (
      /<meta\s+name=["']description["']/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
          `<meta name="description" content="${escapeHtml(pageDesc)}" />`
        );
    } else {
      modified =
        modified.replace(
          "</head>",
          `<meta name="description" content="${escapeHtml(pageDesc)}" /></head>`
        );
    }

    /**
     * CANONICAL
     */
    if (
      /<link\s+rel=["']canonical["']/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>/i,
          `<link rel="canonical" href="${canonicalUrl}" />`
        );
    } else {
      modified =
        modified.replace(
          "</head>",
          `<link rel="canonical" href="${canonicalUrl}" /></head>`
        );
    }

    /**
     * OG TITLE
     */
    if (
      /<meta\s+property=["']og:title["']/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
          `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`
        );
    }

    /**
     * OG DESCRIPTION
     */
    if (
      /<meta\s+property=["']og:description["']/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
          `<meta property="og:description" content="${escapeHtml(pageDesc)}" />`
        );
    }

    /**
     * OG URL
     */
    if (
      /<meta\s+property=["']og:url["']/i.test(
        modified
      )
    ) {
      modified =
        modified.replace(
          /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>/i,
          `<meta property="og:url" content="${canonicalUrl}" />`
        );
    }

    /**
     * ROOT SSR CONTENT
     */
    if (
      modified.includes(
        '<div id="root"></div>'
      )
    ) {
      modified =
        modified.replace(
          '<div id="root"></div>',
          `<div id="root">${semanticContent}</div>`
        );
    } else if (
      modified.includes(
        "<div id='root'></div>"
      )
    ) {
      modified =
        modified.replace(
          "<div id='root'></div>",
          `<div id="root">${semanticContent}</div>`
        );
    } else {
      console.warn(
        "[render-listing] Empty root element not found in index.html."
      );
    }

    fullHtml =
      modified;
  } else {
    /**
     * index.html을 읽지 못했을 경우에도
     * 검색엔진용 HTML을 정상 반환
     */
    fullHtml = `<!DOCTYPE html>
<html lang="ko">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ${escapeHtml(pageTitle)}
  </title>

  <meta
    name="description"
    content="${escapeHtml(pageDesc)}"
  />

  <meta
    name="robots"
    content="index, follow"
  />

  <link
    rel="canonical"
    href="${canonicalUrl}"
  />

</head>

<body>

  <div id="root">

    ${semanticContent}

  </div>

</body>

</html>`;
  }

  /**
   * ============================================================
   * RESPONSE
   * ============================================================
   *
   * 기존:
   * s-maxage=1800 + stale 24시간
   *
   * 변경:
   * Vercel CDN 캐시를 짧게 유지합니다.
   *
   * 따라서 관리자에서 새 실제 시공사례를 등록한 뒤
   * 재배포하지 않아도 /projects 서버 HTML이 자동 갱신됩니다.
   */
  res.setHeader(
    "Content-Type",
    "text/html; charset=utf-8"
  );

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );

  return res
    .status(200)
    .send(fullHtml);
}
