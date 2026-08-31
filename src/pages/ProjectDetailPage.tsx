import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import { ProjectDetailContent } from "../components/content/ProjectDetailContent";
import { ProjectItem } from "../types";
import { PROJECTS_DATA } from "../data/projectsData";
import { db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface ProjectDetailPageProps {
  initialData?: ProjectItem | null;
  openContactModal?: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  initialData,
  openContactModal,
}) => {
  const { slug } = useParams<{ slug: string }>();

  const [project, setProject] = useState<ProjectItem | null>(() => {
    if (initialData) return initialData;
    if (typeof window !== "undefined" && (window as any).__GENE_INITIAL_DATA__) {
      const gData = (window as any).__GENE_INITIAL_DATA__;
      if (gData.type === "project" && gData.data) {
        return gData.data as ProjectItem;
      }
    }
    // Check built-in PROJECTS_DATA
    if (slug) {
      const found = PROJECTS_DATA.find(
        (p) => p.id === slug || p.title.replace(/\s+/g, "-") === slug
      );
      if (found) return found;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(!project);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (project && (project.id === slug || project.title.replace(/\s+/g, "-") === slug)) {
      setLoading(false);
      return;
    }

    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // 1. Check built-in PROJECTS_DATA first
    const builtIn = PROJECTS_DATA.find(
      (p) => p.id === slug || p.title.replace(/\s+/g, "-") === slug
    );
    if (builtIn) {
      setProject(builtIn);
      setLoading(false);
      setNotFound(false);
      return;
    }

    // 2. Fetch from Firestore by document ID or slug/title
    let isMounted = true;
    async function fetchProject() {
      try {
        setLoading(true);

        // Try direct doc ID lookup
        const docRef = doc(db, "projects", slug!);
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (
            data.status === "private" ||
            data.status === "draft" ||
            data.status === "deleted" ||
            data.isPublished === false
          ) {
            setNotFound(true);
            return;
          }
          const item: ProjectItem = {
            id: docSnap.id,
            slug: data.slug || (docSnap.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : ""),
            isSample: data.isSample ?? false,
            title: data.title || "시공 프로젝트",
            location: data.location || "부산",
            category: (data.category as "주거" | "상가·매장" | "카페·음식점" | "사무실" | "공공·교육시설") || "주거",
            spaceTypeDetail: data.spaceTypeDetail || "",
            area: data.area || "",
            duration: data.duration || "",
            scope: data.scope || "",
            clientRequest: data.clientRequest || "",
            description: data.description || "",
            keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
            beforeImage: data.beforeImage || "",
            inProgressImage: data.inProgressImage || "",
            afterImages: Array.isArray(data.afterImages) ? data.afterImages : [],
          };
          setProject(item);
          setNotFound(false);
          return;
        }

        // If not found by doc id, try where slug == slug
        const q = query(
          collection(db, "projects"),
          where("slug", "==", slug),
          limit(1)
        );
        const qSnap = await getDocs(q);

        if (!isMounted) return;

        if (!qSnap.empty) {
          const d = qSnap.docs[0];
          const data = d.data();
          if (
            data.status === "private" ||
            data.status === "draft" ||
            data.status === "deleted" ||
            data.isPublished === false
          ) {
            setNotFound(true);
            return;
          }
          const item: ProjectItem = {
            id: d.id,
            slug: data.slug || (d.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : ""),
            isSample: data.isSample ?? false,
            title: data.title || "시공 프로젝트",
            location: data.location || "부산",
            category: (data.category as "주거" | "상가·매장" | "카페·음식점" | "사무실" | "공공·교육시설") || "주거",
            spaceTypeDetail: data.spaceTypeDetail || "",
            area: data.area || "",
            duration: data.duration || "",
            scope: data.scope || "",
            clientRequest: data.clientRequest || "",
            description: data.description || "",
            keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
            beforeImage: data.beforeImage || "",
            inProgressImage: data.inProgressImage || "",
            afterImages: Array.isArray(data.afterImages) ? data.afterImages : [],
          };
          setProject(item);
          setNotFound(false);
          return;
        }

        // Fallback for Sajik-dong villa project if slug is busan-sajik-villa-remodeling
        if (slug === "busan-sajik-villa-remodeling") {
          const sajikRef = doc(db, "projects", "wkv0to3v3LYzluyUtBU2");
          const sajikSnap = await getDoc(sajikRef);
          if (!isMounted) return;
          if (sajikSnap.exists()) {
            const data = sajikSnap.data();
            const item: ProjectItem = {
              id: sajikSnap.id,
              slug: "busan-sajik-villa-remodeling",
              isSample: data.isSample ?? false,
              title: data.title || "부산 사직동 구축 빌라 리모델링",
              location: data.location || "부산 동래구 사직동",
              category: (data.category as "주거" | "상가·매장" | "카페·음식점" | "사무실" | "공공·교육시설") || "주거",
              spaceTypeDetail: data.spaceTypeDetail || "구축 빌라 주거공간",
              area: data.area || "",
              duration: data.duration || "",
              scope: data.scope || "",
              clientRequest: data.clientRequest || "",
              description: data.description || "",
              keyFeatures: Array.isArray(data.keyFeatures) ? data.keyFeatures : [],
              beforeImage: data.beforeImage || "",
              inProgressImage: data.inProgressImage || "",
              afterImages: Array.isArray(data.afterImages) ? data.afterImages : [],
            };
            setProject(item);
            setNotFound(false);
            return;
          }
        }

        setNotFound(true);
      } catch (err) {
        console.warn("Notice: Firestore project lookup notice:", err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProject();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">시공사례를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <MetaManager
          title="시공사례를 찾을 수 없습니다"
          description="요청하신 시공사례 포트폴리오가 존재하지 않거나 비공개 상태입니다."
          noindex={true}
        />
        <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center mx-auto border border-stone-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-2 font-sans">
          <h1 className="text-2xl font-bold font-sans text-stone-900 break-keep">
            요청하신 시공사례를 찾을 수 없습니다
          </h1>
          <p className="text-sm text-stone-600 font-sans break-keep">
            삭제된 프로젝트이거나 잘못된 주소일 수 있습니다.
          </p>
        </div>
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>시공사례 갤러리로 이동</span>
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage =
    (project.afterImages && project.afterImages[0]) ||
    project.beforeImage ||
    "/images/hanshin_hero_bg_1784852933011.jpg";

  const canonicalSlug =
    project.slug ||
    (project.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : (slug || project.id));

  return (
    <>
      <MetaManager
        title={`${project.title}｜${project.location} ${project.category} 시공사례`}
        description={project.description || `${project.location} ${project.spaceTypeDetail || project.category} 맞춤 리모델링 시공사례`}
        canonicalPath={`/projects/${canonicalSlug}`}
        ogType="article"
        ogImage={primaryImage}
      />
      <StructuredData
        type="project"
        title={project.title}
        description={project.description || `${project.location} ${project.spaceTypeDetail || project.category} 맞춤 리모델링`}
        slug={canonicalSlug}
        category={project.category}
        location={project.location}
        images={project.afterImages}
      />
      <ProjectDetailContent
        project={project}
        onOpenContactModal={openContactModal}
      />
    </>
  );
};
