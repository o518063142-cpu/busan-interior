import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { isRelationPublic } from "../api/_lib/contentRelations.js";
import { RelatedInformationNetwork } from "../src/components/content/RelatedInformationNetwork.js";
import { RelatedProjectNetwork } from "../src/components/content/RelatedProjectNetwork.js";
import { INFORMATION_ARTICLES } from "../api/_data/informationData.js";
import { PROJECTS_DATA } from "../api/_data/projectsData.js";

// Execute the real handlers with an isolated Firestore/REST fixture, never writes live data.
function harness() {
  const seed = fs.readFileSync("scripts/prerender.ts", "utf8").split("const FALLBACK_REAL_PROJECTS: PrerenderProject[] = [")[1].split("\n];")[0];
  const real = vm.runInNewContext(`[${seed}]`).map((p: any) => ({ ...p, status: "public" }));
  const article = { id: "new-guide", slug: "new-guide", title: "구축 아파트 리모델링 공사 순서", category: "주거", shortAnswer: "실측 및 공정", status: "published" };
  const newProject = { id: "new-home", slug: "new-home", title: "명륜동 34평 아파트 리모델링", location: "부산 동래구 명륜동", category: "주거", description: "구축 주거 인테리어 공사 순서", status: "public" };
  const design = { ...newProject, id: "new-design", slug: "new-design", isSample: true };
  const hidden = { ...newProject, id: "hidden", slug: "hidden", status: "private" };
  const data: Record<string, any[]> = { projects: [...real, hidden], articles: [article, { ...article, id: "secret-guide", slug: "secret-guide", status: "draft" }] };
  const db = { collection(name: string) {
    const query = (items: any[]): any => ({
      where(field: string, op: string, value: any) { return query(items.filter(p => op === "in" ? value.includes(p[field]) : p[field] === value)); },
      limit(n: number) { return query(items.slice(0, n)); },
      async get() { return { empty: !items.length, docs: items.map(p => ({ id: p.id, data: () => p })) }; },
      doc(id: string) { return { async get() { const p = items.find(p => p.id === id); return { exists: !!p, id, data: () => p }; } }; },
    });
    return query(data[name] || []);
  } };
  const require = createRequire(import.meta.url);
  const modules = new Map<string, any>();
  const load = (filename: string): any => {
    if (filename.endsWith("/firebaseAdmin.ts")) return { getFirestoreAdmin: async () => db, isProjectPublic: isRelationPublic };
    if (modules.has(filename)) return modules.get(filename).exports;
    const module = { exports: {} as any }; modules.set(filename, module);
    const js = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(`(function(require,module,exports){${js}\n})`, {
      console, process, Date, Set, Map,
      fetch: async () => ({ ok: true, json: async () => ({ documents: data.projects.map(p => ({ name: `projects/${p.id}`, fields: Object.fromEntries(Object.entries(p).map(([k, v]) => [k, typeof v === "boolean" ? { booleanValue: v } : { stringValue: v }])) })) }) }),
    }, { filename })((id: string) => id.startsWith(".") ? load(path.resolve(path.dirname(filename), id.replace(/\.js$/, ".ts"))) : require(id), module, module.exports);
    return module.exports;
  };
  async function request(file: string, query: any) {
    const headers: Record<string, string> = {};
    const result: any = { headers, code: 200, setHeader(k: string, v: string) { headers[k] = v; return this; }, status(n: number) { this.code = n; return this; }, send(html: string) { this.html = html; return this; }, end() { return this; } };
    await load(path.resolve(file)).default({ query, url: query.slug ? `/projects/${query.slug}` : "/projects" }, result);
    return result;
  }
  return { data, real, article, newProject, design, request };
}

test("SSR keeps 7 real/6 designs; new project/design/article join both link directions and sitemap", async () => {
  const h = harness();
  const listing = await h.request("api/render-listing.ts", { page: "projects" });
  assert(listing.html.includes("실제 시공사례 (7건)"));
  assert(listing.html.includes("(6건)"));
  for (const p of [...h.real, ...PROJECTS_DATA]) assert(listing.html.includes(`/projects/${p.slug || p.id}`));
  assert(!listing.html.includes('/projects/hidden'));

  h.data.projects.push(h.newProject, h.design);
  const project = await h.request("api/render-project.ts", { slug: "new-home" });
  assert.equal(project.code, 200);
  assert(project.html.includes('href="/contact"'));
  assert(project.html.includes('href="tel:051-806-3143"'));
  assert(project.html.indexOf('id="project-consultation-heading"') < project.html.indexOf('href="/information/new-guide"'));
  assert(project.html.includes('href="/information/new-guide"'));
  assert(project.html.includes('href="/projects/new-design"'));
  assert(project.html.includes('href="/projects/busan-sajik-villa-remodeling"'));
  assert(!project.html.includes('/information/secret-guide'));
  assert(!project.html.includes('/projects/hidden'));
  assert(project.html.includes('rel="canonical" href="https://gene-interior.vercel.app/projects/new-home"'));

  const article = await h.request("api/render-information.ts", { slug: "new-guide" });
  assert.equal(article.code, 200);
  assert(article.html.includes('href="/projects/new-home"'));
  assert(article.html.includes('href="/projects/new-design"'));
  assert(article.html.includes("관련 실제 시공사례"));
  assert(article.html.includes("실제 시공실적이 아닌"));
  assert(article.html.includes("제안 지역: 부산 동래구 명륜동"));
  assert(article.html.includes('rel="canonical" href="https://gene-interior.vercel.app/information/new-guide"'));
  assert(!article.html.includes('/projects/hidden'));

  const design = await h.request("api/render-project.ts", { slug: "new-design" });
  assert(design.html.includes('content="index, follow"'));
  assert(design.html.includes('href="/information/new-guide"'));
  assert(design.html.includes("디자인 제안 정보"));
  assert(!design.html.includes('id="project-consultation-heading"'));
  const map = await h.request("api/sitemap.ts", {});
  for (const slug of ["new-home", "new-design"]) assert(map.html.includes(`/projects/${slug}</loc>`));
  assert(map.html.includes('/information/new-guide</loc>'));
  assert(!map.html.includes('/projects/hidden</loc>'));
  assert(!map.html.includes('/information/secret-guide</loc>'));
  const denied = await h.request("api/render-project.ts", { slug: "hidden" });
  assert.equal(denied.code, 404);
  const draft = await h.request("api/render-information.ts", { slug: "secret-guide" });
  assert.equal(draft.code, 404);
});

test("React uses the same matching and keeps design proposals separate", () => {
  const article = INFORMATION_ARTICLES.find(a => a.slug === "busan-interior-remodeling-checklist")!;
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, {},
    React.createElement(RelatedInformationNetwork, { source: article, kind: "article" })));
  assert(html.includes("함께 볼 디자인 제안"));
  assert(html.includes("실제 시공실적이 아닌"));
  assert(html.includes("제안 지역:"));
  assert(html.includes('/projects/sample-proj-1'));
  const project = PROJECTS_DATA[0];
  const out = renderToStaticMarkup(React.createElement(MemoryRouter, {},
    React.createElement(RelatedInformationNetwork, { source: project, kind: "project" })));
  assert(out.includes('/information/busan-interior-remodeling-checklist'));
  const existing = renderToStaticMarkup(React.createElement(MemoryRouter, {},
    React.createElement(RelatedProjectNetwork, { project, canonicalSlug: project.id })));
  assert(existing.includes("함께 볼 디자인 제안"));
});
