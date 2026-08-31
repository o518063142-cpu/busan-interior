import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { PROJECTS_DATA } from "../data/projectsData";
import { ProjectCategory, ProjectItem } from "../types";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { MetaManager } from "../components/seo/MetaManager";
import { StructuredData } from "../components/seo/StructuredData";
import {
  MapPin,
  Calendar,
  Layers,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Search,
  Images,
  Maximize2,
  Eye,
  ArrowLeftRight,
  Image as ImageIcon,
} from "lucide-react";

interface ProjectPageProps {
  selectedCategory?: ProjectCategory;
  setSelectedCategory?: (cat: ProjectCategory) => void;
  openContactModal?: () => void;
  selectedProject?: ProjectItem | null;
  onSelectProject?: (proj: ProjectItem | null) => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  selectedCategory: initialCategory = "전체",
  setSelectedCategory: parentSetSelectedCategory,
  openContactModal,
  selectedProject: parentSelectedProject,
  onSelectProject: parentOnSelectProject,
}) => {
  const [internalCategory, setInternalCategory] = useState<ProjectCategory>(initialCategory);
  const selectedCategory = parentSetSelectedCategory ? initialCategory : internalCategory;
  const setSelectedCategory = parentSetSelectedCategory || setInternalCategory;

  const [internalSelectedProject, setInternalSelectedProject] = useState<ProjectItem | null>(null);
  const selectedProject = parentOnSelectProject ? parentSelectedProject : internalSelectedProject;
  const onSelectProject = parentOnSelectProject || setInternalSelectedProject;

  const [searchQuery, setSearchQuery] = useState("");
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [firestoreProjects, setFirestoreProjects] = useState<ProjectItem[]>([]);

  // Real-time subscription to Firestore 'projects' collection
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items: ProjectItem[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
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
          });
          setFirestoreProjects(items);
        },
        (error) => {
          // Graceful fallback on Firestore query issue: PROJECTS_DATA continues uninterrupted
          console.warn("Firestore projects onSnapshot notice (using base data fallback):", error);
        }
      );
    } catch (err) {
      console.warn("Firestore projects subscription exception:", err);
    }

    return () => unsubscribe();
  }, []);

  // Merge Firestore Projects + Built-in PROJECTS_DATA with strict deduplication
  const allProjects = useMemo(() => {
    const seenIds = new Set<string>();
    const combined: ProjectItem[] = [];

    // 1. Prioritize Firestore real-time projects (newest registered projects first)
    for (const fp of firestoreProjects) {
      if (!seenIds.has(fp.id)) {
        seenIds.add(fp.id);
        combined.push(fp);
      }
    }

    // 2. Add base PROJECTS_DATA (preserving Sajik & baseline portfolio)
    for (const bp of PROJECTS_DATA) {
      if (!seenIds.has(bp.id)) {
        seenIds.add(bp.id);
        combined.push(bp);
      }
    }

    return combined;
  }, [firestoreProjects]);

  const categories: ProjectCategory[] = [
    "전체",
    "주거",
    "상가·매장",
    "카페·음식점",
    "사무실",
    "공공·교육시설",
  ];

  const filteredProjects = allProjects.filter((proj) => {
    const matchesCategory =
      selectedCategory === "전체" || proj.category === selectedCategory;
    const matchesSearch =
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-12">
      <MetaManager
        title="시공사례 (PROJECT)｜부산진구·전포동 인테리어 포트폴리오｜지니 인테리어"
        description="지니 인테리어(GENE INTERIOR) 대표 시공사례 포트폴리오. 부산 주거·상가·카페·사무실 리모델링 완공 및 비포/애프터 공사 과정 공개."
        canonicalPath="/projects"
      />
      <StructuredData
        type="page"
        title="시공사례 (PROJECT) | 지니 인테리어"
        description="지니 인테리어 부산 시공사례 포트폴리오"
        path="/projects"
      />
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto font-sans">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200 font-sans">
          PORTFOLIO GALLERY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-sans break-keep">
          지니 인테리어 대표 시공사례
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-sans break-keep">
          부산진구 전포동, 서면, 동래구 등 부산 주요 공간의 완공 사례를 확인해보세요.
          <br />
          <span className="text-amber-700 font-semibold text-xs font-sans">
            * 지니 인테리어(GENE INTERIOR)의 실제 시공 현장 및 추천 포트폴리오를 실시간으로 투명하게 공개합니다.
          </span>
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm font-sans">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none font-sans">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer font-sans ${
                  isActive
                    ? "bg-stone-900 text-amber-300 shadow"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64 font-sans">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="지역, 프로젝트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-sans"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3 font-sans">
          <Info className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-600 font-semibold text-sm font-sans">
            검색 결과에 해당하는 시공사례가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
          {filteredProjects.map((project) => {
            const hasMainPhoto =
              project.afterImages &&
              project.afterImages.length > 0 &&
              Boolean(project.afterImages[0]);

            const totalPhotosCount =
              (project.afterImages ? project.afterImages.filter(Boolean).length : 0) +
              (project.beforeImage ? 1 : 0) +
              (project.inProgressImage ? 1 : 0);

            const projectSlugUrl =
              project.slug ||
              (project.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : project.id);

            return (
              <Link
                key={project.id}
                to={`/projects/${projectSlugUrl}`}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1 block text-inherit no-underline font-sans"
              >
                <div>
                  {/* Main Large Photo Box (h-72 sm:h-80) */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-stone-950 flex items-center justify-center">
                    {hasMainPhoto ? (
                      <img
                        src={project.afterImages[0]}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center text-stone-500 p-6 space-y-2 font-sans">
                        <ImageIcon className="w-10 h-10 mx-auto opacity-40" />
                        <span className="text-xs font-semibold block text-stone-400 font-sans">
                          완공 현장 사진 준비 중
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 z-10 font-sans">
                      <span
                        className={`font-black text-[11px] px-3 py-1 rounded-full shadow font-sans ${
                          project.isSample
                            ? "bg-amber-500 text-stone-950"
                            : "bg-emerald-500 text-white"
                        }`}
                      >
                        {project.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                      </span>
                      <span className="bg-stone-950/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-semibold border border-stone-700 font-sans">
                        {project.category}
                      </span>
                    </div>

                    {/* Photo Count */}
                    <div className="absolute top-4 right-4 bg-stone-900/90 text-amber-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-500/30 font-semibold flex items-center gap-1 font-sans">
                      <Images className="w-3.5 h-3.5" />
                      <span>{totalPhotosCount > 0 ? `총 ${totalPhotosCount}장` : "상세 스펙"}</span>
                    </div>

                    {/* Bottom Text Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-white space-y-1 font-sans">
                      <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold font-sans">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{project.location}</span>
                        <span>•</span>
                        <span>{project.area}</span>
                        <span>•</span>
                        <span>{project.duration}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white font-sans line-clamp-1 group-hover:text-amber-300 transition-colors break-keep">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-3 font-sans">
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans break-keep">
                      {project.description}
                    </p>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 space-y-1 font-sans">
                      <span className="font-bold text-amber-800 block text-[11px] font-sans">
                        시공범위: {project.scope}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom detail action */}
                <div className="p-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-900 font-black group-hover:text-amber-600 transition-colors font-sans">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>공사 전/후 사진 & 세부 도면 스펙</span>
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
          <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[92vh] flex flex-col font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950 font-sans">
              <div className="space-y-0.5 font-sans">
                <div className="flex items-center gap-2 font-sans">
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded font-bold border font-sans ${
                      selectedProject.isSample
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {selectedProject.isSample
                      ? "샘플 포트폴리오 상세보기"
                      : "실제 시공사례 상세보기"}
                  </span>
                  <span className="text-xs text-stone-400 font-sans">
                    {selectedProject.category} · {selectedProject.location}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-sans break-keep">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => onSelectProject(null)}
                className="p-2 text-stone-400 hover:text-white bg-stone-800 rounded-xl transition-colors"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1 text-xs sm:text-sm">
              {/* Big High-Definition Image Main Viewer */}
              {(() => {
                const afters = (selectedProject.afterImages || []).filter(Boolean);
                const allPhotos: { label: string; url: string }[] = [];

                if (afters.length > 0) {
                  allPhotos.push({ label: "완공 메인", url: afters[0] });
                  afters.slice(1).forEach((u, i) => {
                    allPhotos.push({ label: `완공 컷 ${i + 2}`, url: u });
                  });
                }
                if (selectedProject.beforeImage) {
                  allPhotos.push({ label: "시공 전 현장", url: selectedProject.beforeImage });
                }
                if (selectedProject.inProgressImage) {
                  allPhotos.push({ label: "기초/목공 과정", url: selectedProject.inProgressImage });
                }

                // If no photos at all were uploaded
                if (allPhotos.length === 0) {
                  allPhotos.push({
                    label: "대표 이미지",
                    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                  });
                }

                const currentPhoto = allPhotos[activePhotoIdx % allPhotos.length] || allPhotos[0];

                const handleModalPrev = (e?: React.MouseEvent) => {
                  e?.stopPropagation();
                  setActivePhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
                };

                const handleModalNext = (e?: React.MouseEvent) => {
                  e?.stopPropagation();
                  setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length);
                };

                return (
                  <div className="space-y-3">
                    <div className="relative h-[340px] sm:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 group flex items-center justify-center">
                      <img
                        key={currentPhoto.url}
                        src={currentPhoto.url}
                        alt={currentPhoto.label}
                        className="w-full h-full object-cover transition-all duration-500"
                        loading="eager"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      {/* Photo Label (Top Left) */}
                      <div className="absolute top-4 left-4 bg-stone-900/90 text-amber-300 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md border border-amber-500/40 font-bold z-10">
                        {currentPhoto.label}
                      </div>

                      {/* Photo Counter Badge (Top Right) */}
                      <div className="absolute top-4 right-4 bg-stone-950/85 text-stone-200 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-stone-700/60 font-mono font-semibold z-10">
                        <span className="text-amber-400 font-bold">{(activePhotoIdx % allPhotos.length) + 1}</span>
                        <span className="text-stone-400 mx-1">/</span>
                        <span>{allPhotos.length}</span>
                      </div>

                      {/* Modal Navigation Arrows */}
                      {allPhotos.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={handleModalPrev}
                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-amber-500 hover:text-stone-950 text-white flex items-center justify-center border border-white/20 transition-all backdrop-blur-md z-10 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                            aria-label="이전 사진 보기"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={handleModalNext}
                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-stone-950/70 hover:bg-amber-500 hover:text-stone-950 text-white flex items-center justify-center border border-white/20 transition-all backdrop-blur-md z-10 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                            aria-label="다음 사진 보기"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs bg-stone-900/80 p-3 rounded-xl border border-stone-800 backdrop-blur-md">
                        <span className="font-semibold">{selectedProject.spaceTypeDetail} · {selectedProject.area}</span>
                        <span className="text-amber-400 font-bold">{selectedProject.duration}</span>
                      </div>
                    </div>

                    {/* Photo Selector Thumbnails Grid */}
                    {allPhotos.length > 1 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5 pt-1">
                        {allPhotos.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                              (activePhotoIdx % allPhotos.length) === idx
                                ? "border-amber-400 ring-2 ring-amber-400/80 scale-[1.02] shadow-md"
                                : "border-stone-800 opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={item.url} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                            <span className="absolute bottom-1 inset-x-1 text-[10px] text-center text-stone-200 font-bold truncate">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Specs Table Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div>
                  <span className="text-stone-400 text-xs block">지역</span>
                  <span className="font-bold text-white">{selectedProject.location}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">공간 유형</span>
                  <span className="font-bold text-white">{selectedProject.spaceTypeDetail}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">면적</span>
                  <span className="font-bold text-white">{selectedProject.area}</span>
                </div>
                <div>
                  <span className="text-stone-400 text-xs block">공사 기간</span>
                  <span className="font-bold text-white">{selectedProject.duration}</span>
                </div>
              </div>

              {/* Client Request & Scope */}
              <div className="space-y-4">
                {selectedProject.clientRequest && (
                  <div className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/80 space-y-1">
                    <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide">
                      고객 요청사항
                    </h4>
                    <p className="text-stone-200 leading-relaxed italic">
                      "{selectedProject.clientRequest}"
                    </p>
                  </div>
                )}

                <div className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/80 space-y-1">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide">
                    주요 공사범위
                  </h4>
                  <p className="text-stone-200 leading-relaxed">
                    {selectedProject.scope}
                  </p>
                </div>
              </div>

              {/* Key Features & Description */}
              <div className="space-y-3 font-sans">
                <h4 className="text-base font-bold text-white font-sans break-keep">
                  프로젝트 설명 및 핵심 시공 마감
                </h4>
                <p className="text-stone-300 leading-relaxed font-sans break-keep">
                  {selectedProject.description}
                </p>
                {selectedProject.keyFeatures && selectedProject.keyFeatures.length > 0 && (
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 block">
                      핵심 시공 포인트:
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {selectedProject.keyFeatures.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-stone-800">
                <button
                  onClick={() => {
                    onSelectProject(null);
                    openContactModal();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow cursor-pointer"
                >
                  비슷한 스타일로 무료 현장 실측 상담 신청
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
