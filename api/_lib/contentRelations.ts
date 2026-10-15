// Pure matching shared by browser and searchbot HTML. No database or Node imports.
export interface RelationContent {
  id?: string;
  slug?: string;
  title?: string;
  category?: string;
  location?: string;
  spaceTypeDetail?: string;
  spaceType?: string;
  description?: string;
  shortAnswer?: string;
  content?: string;
  scope?: string;
  sections?: { heading?: string; content?: string }[];
  tags?: string[];
  isSample?: boolean;
  status?: string;
  isPublished?: boolean;
}

export const projectSlug = (item: RelationContent) => item.slug ||
  (item.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : item.id || "");

export const isRelationPublic = (item: RelationContent) =>
  !["draft", "private", "deleted"].includes(item.status || "") && item.isPublished !== false;

// Dynamic articles must also be reachable through the existing article SSR lookup.
export const isPublishedArticle = (item: RelationContent) =>
  isRelationPublic(item) && ["published", "public"].includes(item.status || "");

export function mergeRelationContent<T extends RelationContent>(
  primary: T[], fallback: T[], kind: "project" | "article"
): T[] {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  return [...primary, ...fallback].filter((item) => {
    const slug = kind === "project" ? projectSlug(item) : item.slug;
    if (!slug || !item.title || !isRelationPublic(item) ||
        (kind === "article" && slug === "busanjin-remodeling-checklist") ||
        slugs.has(slug) || (item.id && ids.has(item.id))) return false;
    slugs.add(slug);
    if (item.id) ids.add(item.id);
    return true;
  });
}

const groups = [
  /주거|아파트|빌라|주택/,
  /상업|상가|업무|사무실|오피스|카페|음식점|매장|부티크|연습실|스튜디오/,
  /공공|교육|학교|교실|vr|스포츠실/,
];
const spaces = [
  /아파트/, /빌라/, /단독주택|주택/, /카페/, /음식점|식당/,
  /매장|상가|부티크/, /사무실|오피스/, /학교|교실|교육시설/,
  /vr|스포츠실/, /음악|연습실|스튜디오/,
];
const topics = [
  /구축|노후/, /리모델링|개보수/, /인테리어|공간\s*구성|디자인/,
  /공사\s*순서|공정|시공\s*과정/, /견적|예산|공사비/,
  /체크리스트|공사\s*준비|계약/, /실측|치수|동선/,
];
const signals = (patterns: RegExp[], text: string) =>
  patterns.flatMap((pattern, index) => pattern.test(text) ? [index] : []);
const overlap = <T,>(a: T[], b: T[]) => a.filter((value) => b.includes(value)).length;

function profile(item: RelationContent) {
  const heading = [item.category, item.title, item.spaceTypeDetail, item.spaceType,
    ...(Array.isArray(item.tags) ? item.tags : []),
  ].join(" ").toLowerCase();
  const summary = [heading, item.description, item.shortAnswer].join(" ").toLowerCase();
  const text = [summary, item.content, item.scope,
    ...(Array.isArray(item.sections) ? item.sections : []).map((section) => `${section.heading || ""} ${section.content || ""}`),
  ].join(" ").replace(/<[^>]*>/g, " ").toLowerCase();
  // A passing mention in body text must not override the main space type.
  const group = signals(groups, heading);
  const subtype = signals(spaces, heading);
  return {
    groups: group.length ? group : signals(groups, summary),
    spaces: subtype.length ? subtype : signals(spaces, summary),
    topics: signals(topics, text),
    regions: Array.from(new Set([summary, item.location].join(" ").match(/부산|울산|경남|경상남도|진주|[가-힣]{2,}구|[가-힣]{2,}동/g) || [])),
  };
}

export function relationScore(project: RelationContent, article: RelationContent): number {
  const p = profile(project);
  const a = profile(article);
  const group = overlap(p.groups, a.groups);
  const subtype = overlap(p.spaces, a.spaces);
  const topic = overlap(p.topics, a.topics);
  // General preparation guides may span spaces, but need two shared practical topics.
  const generalGuide = !a.groups.length && a.topics.filter((t) => t >= 3).length >= 2;
  if (!group && !(generalGuide && topic >= 2)) return 0;
  if (a.spaces.length && p.spaces.length && !subtype &&
      !(p.groups.includes(0) && a.groups.includes(0) && topic >= 2)) return 0;
  if (!subtype && !topic) return 0;
  return group * 6 + subtype * 4 + Math.min(topic, 3) * 2 + Math.min(overlap(p.regions, a.regions), 2);
}

export function relatedArticles<T extends RelationContent>(project: RelationContent, articles: T[]): T[] {
  return mergeRelationContent(articles, [], "article")
    .map((item) => ({ item, score: relationScore(project, item) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.item.slug!.localeCompare(b.item.slug!))
    .slice(0, 3).map(({ item }) => item);
}

export function relatedProjects<T extends RelationContent>(article: RelationContent, projects: T[]) {
  const ranked = mergeRelationContent(projects, [], "project")
    .map((item) => ({ item, score: relationScore(item, article) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || projectSlug(a.item).localeCompare(projectSlug(b.item)))
    .map(({ item }) => item);
  return {
    actual: ranked.filter((item) => item.isSample !== true).slice(0, 4),
    designs: ranked.filter((item) => item.isSample === true).slice(0, 3),
  };
}
