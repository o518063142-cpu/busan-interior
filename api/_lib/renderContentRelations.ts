import { projectSlug, relatedArticles, relatedProjects, type RelationContent } from "./contentRelations.js";

const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g,
  (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]!));

export function renderContentRelations(source: RelationContent, kind: "project" | "article", candidates: RelationContent[]) {
  const sections: { title: string; items: RelationContent[]; path: string; sample?: boolean }[] =
    kind === "project"
      ? [{ title: "함께 읽을 전문 정보", items: relatedArticles(source, candidates), path: "information" }]
      : (() => {
          const projects = relatedProjects(source, candidates);
          return [
            { title: "관련 실제 시공사례", items: projects.actual, path: "projects", sample: false },
            { title: "함께 볼 디자인 제안", items: projects.designs, path: "projects", sample: true },
          ];
        })();
  return sections.filter(({ items }) => items.length).map(({ title, items, path, sample }) => `
    <section aria-label="${title}" style="margin-top:28px; padding-top:24px; border-top:1px solid #e7e5e4;">
      <h2 style="font-size:1.125rem; color:#1c1917;">${title}</h2>
      ${sample ? "<p>실제 시공실적이 아닌 디자인 및 공간 구성 제안·콘셉트입니다.</p>" : ""}
      <ul style="padding-left:20px; line-height:1.8;">${items.map((item) => `
        <li><a href="/${path}/${encodeURIComponent(path === "projects" ? projectSlug(item) : item.slug!)}">${escape(item.title)}</a>
          ${path === "projects" && item.location ? `<span> · ${sample ? "제안 지역" : "시공 위치"}: ${escape(item.location)}</span>` : ""}</li>`).join("")}
      </ul>
    </section>`).join("");
}
