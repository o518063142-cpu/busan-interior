import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { PROJECTS_DATA } from "../../data/projectsData";
import { ProjectItem } from "../../types";

type RelatedProject = ProjectItem & { slug?: string };

interface RelatedProjectNetworkProps {
  project: ProjectItem;
  canonicalSlug: string;
}

const getSlug = (project: RelatedProject) =>
  project.slug ||
  (project.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : project.id);

const categoryGroup = (category: string) => {
  if (category === "주거") return "주거";
  if (category === "공공·교육시설") return "공공·교육시설";
  return "상업·업무공간";
};

const isPublicProject = (data: any) =>
  data &&
  data.status !== "private" &&
  data.status !== "draft" &&
  data.status !== "deleted" &&
  data.isPublished !== false;

export const RelatedProjectNetwork: React.FC<RelatedProjectNetworkProps> = ({
  project,
  canonicalSlug,
}) => {
  const [firestoreProjects, setFirestoreProjects] = useState<RelatedProject[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      try {
        const snap = await getDocs(collection(db, "projects"));
        if (!mounted) return;

        const items = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as RelatedProject))
          .filter(isPublicProject);

        setFirestoreProjects(items);
      } catch (error) {
        console.warn("Related project network fetch notice:", error);
      }
    }

    loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  const { actualProjects, designSuggestions } = useMemo(() => {
    const map = new Map<string, RelatedProject>();

    [...firestoreProjects, ...(PROJECTS_DATA as RelatedProject[])].forEach((item) => {
      const slug = getSlug(item);
      if (!slug || slug === canonicalSlug) return;
      if (!map.has(slug)) map.set(slug, item);
    });

    const group = categoryGroup(project.category || "");
    const candidates = Array.from(map.values()).filter(
      (item) => categoryGroup(item.category || "") === group
    );

    return {
      actualProjects: candidates.filter((item) => item.isSample !== true).slice(0, 6),
      designSuggestions: candidates.filter((item) => item.isSample === true).slice(0, 4),
    };
  }, [firestoreProjects, project.category, canonicalSlug]);

  if (actualProjects.length === 0 && designSuggestions.length === 0) return null;

  const group = categoryGroup(project.category || "");
  const actualHeading =
    group === "주거"
      ? "부산 주거 리모델링 관련 실제 시공사례"
      : group === "공공·교육시설"
        ? "학교·교육시설 관련 실제 시공사례"
        : "상업·업무공간 관련 실제 시공사례";

  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-8 pb-12" aria-label="관련 프로젝트">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 space-y-7 shadow-sm">
        {actualProjects.length > 0 && (
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold tracking-wide text-amber-700">ACTUAL PROJECTS</span>
              <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-stone-950 break-keep">{actualHeading}</h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 break-keep">
                지니 인테리어가 직접 진행한 같은 공간 유형의 실제 시공사례입니다.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {actualProjects.map((item) => (
                <Link
                  key={getSlug(item)}
                  to={`/projects/${getSlug(item)}`}
                  className="rounded-2xl border border-stone-200 p-4 hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                >
                  <span className="text-[10px] font-bold text-emerald-700">실제 시공</span>
                  <strong className="mt-1 block text-sm text-stone-900 break-keep">{item.title}</strong>
                  {item.location && <span className="mt-1 block text-xs text-stone-500">{item.location}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {designSuggestions.length > 0 && (
          <div className="space-y-3 pt-5 border-t border-stone-200">
            <div>
              <span className="text-[11px] font-bold tracking-wide text-amber-700">DESIGN CONCEPTS</span>
              <h2 className="mt-1 text-lg sm:text-xl font-extrabold text-stone-950">함께 볼 디자인 제안</h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-500 break-keep">
                아래 콘텐츠는 실제 시공실적이 아닌 디자인 및 공간 구성 제안·콘셉트입니다.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {designSuggestions.map((item) => (
                <Link
                  key={getSlug(item)}
                  to={`/projects/${getSlug(item)}`}
                  className="rounded-2xl border border-stone-200 p-4 hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                >
                  <span className="text-[10px] font-bold text-amber-700">디자인 제안 · 콘셉트</span>
                  <strong className="mt-1 block text-sm text-stone-900 break-keep">
                    {item.title.replace(/^\[샘플 프로젝트\]\s*/, "")}
                  </strong>
                  {item.location && <span className="mt-1 block text-xs text-stone-500">{item.location}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
