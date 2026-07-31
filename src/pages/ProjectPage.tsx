import React, { useState } from "react";
import { PROJECTS_DATA } from "../data/projectsData";
import { ProjectCategory, ProjectItem } from "../types";
import {
  MapPin,
  Calendar,
  Layers,
  Ruler,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Search,
  Images,
  Maximize2,
  Eye,
  ArrowLeftRight,
} from "lucide-react";

interface ProjectPageProps {
  selectedCategory: ProjectCategory;
  setSelectedCategory: (cat: ProjectCategory) => void;
  openContactModal: () => void;
  selectedProject: ProjectItem | null;
  onSelectProject: (proj: ProjectItem | null) => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({
  selectedCategory,
  setSelectedCategory,
  openContactModal,
  selectedProject,
  onSelectProject,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const categories: ProjectCategory[] = [
    "전체",
    "주거",
    "상가·매장",
    "카페·음식점",
    "사무실",
  ];

  const filteredProjects = PROJECTS_DATA.filter((proj) => {
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
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          PORTFOLIO GALLERY
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
          한신인테리어 대표 시공사례
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          부산진구 전포동, 서면 등 부산 주요 공간의 완공 사례를 확인해보세요.
          <br />
          <span className="text-amber-700 font-semibold text-xs">
            * 모든 포트폴리오는 시공 안내를 위한 [샘플 프로젝트]로 명확히 표시되어 있으며, 추후 실제 완료된 현장 사진으로 언제든지 교체하실 수 있습니다.
          </span>
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
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
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="지역, 프로젝트 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
          <Info className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-stone-600 font-semibold text-sm">
            검색 결과에 해당하는 시공사례가 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => {
                setActivePhotoIdx(0);
                onSelectProject(project);
              }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                {/* Main Large Photo Box (h-72 sm:h-80) */}
                <div className="relative h-72 sm:h-80 overflow-hidden bg-stone-950">
                  <img
                    src={project.afterImages[0]}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                    <span className="bg-amber-500 text-stone-950 font-black text-[11px] px-3 py-1 rounded-full shadow">
                      샘플 프로젝트
                    </span>
                    <span className="bg-stone-950/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md font-semibold border border-stone-700">
                      {project.category}
                    </span>
                  </div>

                  {/* Photo Count */}
                  <div className="absolute top-4 right-4 bg-stone-900/90 text-amber-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-md border border-amber-500/30 font-semibold flex items-center gap-1">
                    <Images className="w-3.5 h-3.5" />
                    <span>총 {project.afterImages.length + 2}장</span>
                  </div>

                  {/* Bottom Text Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project.location}</span>
                      <span>•</span>
                      <span>{project.area}</span>
                      <span>•</span>
                      <span>{project.duration}</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white font-serif line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs text-stone-600 space-y-1">
                    <span className="font-bold text-amber-800 block text-[11px]">
                      시공범위: {project.scope}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom detail action */}
              <div className="p-5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-900 font-black group-hover:text-amber-600 transition-colors">
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>공사 전/후 사진 & 세부 도면 스펙</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500/20 text-amber-300 text-[11px] px-2.5 py-0.5 rounded font-bold border border-amber-500/30">
                    샘플 포트폴리오 상세보기
                  </span>
                  <span className="text-xs text-stone-400">
                    {selectedProject.category} · {selectedProject.location}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
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
                const allPhotos = [
                  { label: "완공 메인", url: selectedProject.afterImages[0] },
                  ...selectedProject.afterImages.slice(1).map((u, i) => ({ label: `완공 컷 ${i+2}`, url: u })),
                  { label: "시공 전 현장", url: selectedProject.beforeImage },
                  { label: "기초/목공 과정", url: selectedProject.inProgressImage },
                ];
                const currentPhoto = allPhotos[activePhotoIdx % allPhotos.length] || allPhotos[0];

                return (
                  <div className="space-y-3">
                    <div className="relative h-[340px] sm:h-[460px] lg:h-[520px] rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 group">
                      <img
                        src={currentPhoto.url}
                        alt={currentPhoto.label}
                        className="w-full h-full object-cover transition-all duration-500"
                        loading="eager"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                      <div className="absolute top-4 left-4 bg-stone-900/90 text-amber-300 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-amber-500/40 font-bold">
                        {currentPhoto.label} ({activePhotoIdx + 1} / {allPhotos.length})
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs bg-stone-900/80 p-3 rounded-xl border border-stone-800 backdrop-blur-md">
                        <span className="font-semibold">{selectedProject.spaceTypeDetail} · {selectedProject.area}</span>
                        <span className="text-amber-400 font-bold">{selectedProject.duration}</span>
                      </div>
                    </div>

                    {/* Photo Selector Thumbnails Strip */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                      {allPhotos.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`relative w-24 h-16 rounded-xl overflow-hidden border shrink-0 transition-all ${
                            activePhotoIdx === idx
                              ? "border-amber-400 ring-2 ring-amber-400/60 scale-105"
                              : "border-stone-800 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] text-center text-stone-200 font-bold py-0.5 truncate">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
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
                <div className="p-4 bg-stone-800/60 rounded-2xl border border-stone-700/80 space-y-1">
                  <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wide">
                    고객 요청사항
                  </h4>
                  <p className="text-stone-200 leading-relaxed italic">
                    "{selectedProject.clientRequest}"
                  </p>
                </div>

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
              <div className="space-y-3">
                <h4 className="text-base font-bold text-white font-serif">
                  프로젝트 설명 및 핵심 시공 마감
                </h4>
                <p className="text-stone-300 leading-relaxed">
                  {selectedProject.description}
                </p>
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
              </div>

              {/* Action */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-stone-800">
                <button
                  onClick={() => {
                    onSelectProject(null);
                    openContactModal();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow"
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
