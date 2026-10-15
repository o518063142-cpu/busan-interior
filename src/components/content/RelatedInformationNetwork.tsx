import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { INFORMATION_ARTICLES } from "../../data/informationData";
import { PROJECTS_DATA } from "../../data/projectsData";
import {
  isPublishedArticle, isRelationPublic, mergeRelationContent, projectSlug,
  relatedArticles, relatedProjects, type RelationContent,
} from "../../../api/_lib/contentRelations";

export function RelatedInformationNetwork({ source, kind }: { source: RelationContent; kind: "project" | "article" }) {
  const [dynamic, setDynamic] = useState<RelationContent[]>([]);
  useEffect(() => {
    let active = true;
    setDynamic([]);
    const ref = kind === "project"
      ? query(collection(db, "articles"), where("status", "in", ["published", "public"]))
      : collection(db, "projects");
    getDocs(ref).then((snap) => {
      if (active) setDynamic(snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        .filter(kind === "project" ? isPublishedArticle : isRelationPublic));
    }).catch((error) => console.warn("Related information lookup notice:", error));
    return () => { active = false; };
  }, [kind, source.slug, source.id]);

  const sections = useMemo(() => {
    if (kind === "project") {
      const articles = mergeRelationContent<RelationContent>(INFORMATION_ARTICLES, dynamic, "article");
      return [{ title: "함께 읽을 전문 정보", items: relatedArticles(source, articles), path: "information", sample: false }];
    }
    const projects = relatedProjects(source, mergeRelationContent<RelationContent>(dynamic, PROJECTS_DATA, "project"));
    return [
      { title: "관련 실제 시공사례", items: projects.actual, path: "projects", sample: false },
      { title: "함께 볼 디자인 제안", items: projects.designs, path: "projects", sample: true },
    ];
  }, [source, kind, dynamic]);

  return <>{sections.filter(({ items }) => items.length).map(({ title, items, path, sample }) => (
    <section key={title} aria-label={title} className="max-w-5xl mx-auto px-4 py-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-bold text-stone-950">{title}</h2>
        {sample && <p className="text-sm text-stone-500">실제 시공실적이 아닌 디자인 및 공간 구성 제안·콘셉트입니다.</p>}
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => <li key={path === "projects" ? projectSlug(item) : item.slug} className="rounded-xl border border-stone-200 p-4">
            <Link className="text-sm font-bold text-stone-900 hover:text-amber-700" to={`/${path}/${encodeURIComponent(path === "projects" ? projectSlug(item) : item.slug!)}`}>{item.title}</Link>
            {path === "projects" && item.location && <p className="mt-1 text-xs text-stone-500">{sample ? "제안 지역" : "시공 위치"}: {item.location}</p>}
          </li>)}
        </ul>
      </div>
    </section>
  ))}</>;
}
