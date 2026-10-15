import { test } from "node:test";
import assert from "node:assert/strict";
import {
  relatedArticles, relatedProjects, relationScore, mergeRelationContent,
  isPublishedArticle, type RelationContent,
} from "../api/_lib/contentRelations.js";

const home = { id: "new-home", slug: "new-home", title: "명륜동 34평 아파트 실제 시공", category: "주거", location: "부산 동래구 명륜동", description: "구축 아파트 리모델링 및 동선 개선" };
const guide = { id: "new-guide", slug: "new-guide", title: "구축 아파트 리모델링 공사 순서", category: "주거", description: "부산 동래구 공정 및 실측 안내" };
const school = { id: "new-school", slug: "new-school", title: "학교 VR교실 인테리어", category: "공공·교육시설", location: "경남 진주" };
const schoolGuide = { slug: "school-guide", title: "학교 교육시설 VR교실 인테리어 공사 준비", category: "교육시설" };

test("new projects/designs and new articles match in both directions without slug registration", () => {
  const design = { ...home, id: "new-design", slug: "new-design", isSample: true };
  assert.deepEqual(relatedArticles(home, [guide, schoolGuide]).map(a => a.slug), [guide.slug]);
  assert.deepEqual(relatedArticles(design, [guide, schoolGuide]).map(a => a.slug), [guide.slug]);
  const result = relatedProjects(guide, [home, design, school]);
  assert.deepEqual(result.actual.map(p => p.slug), [home.slug]);
  assert.deepEqual(result.designs.map(p => p.slug), [design.slug]);
  assert.deepEqual(relatedProjects(schoolGuide, [school, home, design]).actual.map(p => p.slug), [school.slug]);
});

test("category, subtype and intent gate links; location alone and passing mentions do not", () => {
  const office = { slug: "office", title: "명륜동 사무실 인테리어", category: "사무실" };
  const cafe = { slug: "cafe-guide", title: "명륜동 카페 인테리어", category: "상업" };
  assert.equal(relationScore(home, cafe), 0);
  assert.equal(relationScore(office, cafe), 0);
  assert.equal(relationScore(home, { slug: "local", title: "명륜동 소식", description: "부산" }), 0);
  assert.equal(relationScore(home, { ...schoolGuide, content: "아파트 인테리어와 비교" }), 0);
  assert(relationScore(home, { ...guide, description: "부산 동래구 명륜동 공정" }) >
    relationScore(home, { ...guide, description: "울산 공정" }));
  assert(relationScore({ ...office, title: "사무실 인테리어" }, { ...cafe, title: "사무실 인테리어 가이드" }) > 0);
});

test("private candidates, duplicate IDs/slugs and redirected article URL are excluded", () => {
  const hidden = ["draft", "private", "deleted"].map(status => ({ ...home, id: status, slug: status, status }));
  const projects = mergeRelationContent([home, ...hidden, { ...home, id: "off", slug: "off", isPublished: false }], [{ ...home, id: "duplicate-id" }, { ...home, slug: "duplicate-slug" }], "project");
  assert.deepEqual(projects, [home]);
  assert.deepEqual(relatedArticles(home, [{ ...guide, slug: "busanjin-remodeling-checklist" }, { ...guide, status: "draft" }]), []);
  assert.equal(isPublishedArticle({ ...guide, status: "published", isPublished: false }), false);
  assert.equal(isPublishedArticle({ ...guide, status: "published" }), true);
});

test("ranking is bounded, deterministic and never mutates fact data", () => {
  const projects: RelationContent[] = Array.from({ length: 20 }, (_, i) => ({ ...home, id: `p-${i}`, slug: `p-${i}`, isSample: i % 2 === 0 }));
  const before = JSON.stringify(projects);
  const result = relatedProjects(guide, projects);
  assert.equal(result.actual.length, 4);
  assert.equal(result.designs.length, 3);
  assert.equal(relatedArticles(home, Array.from({ length: 10 }, (_, i) => ({ ...guide, id: `g-${i}`, slug: `g-${i}` }))).length, 3);
  assert.equal(JSON.stringify(projects), before);
});
