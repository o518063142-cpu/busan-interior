import React, { useState } from "react";
import {
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Images,
  Maximize2,
  Calendar,
  Layers,
  Ruler,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ProjectItem } from "../../types";
import { SITE_ENTITY } from "../../config/siteConfig";

interface ProjectDetailContentProps {
  project: ProjectItem;
  onOpenContactModal?: () => void;
}

export const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({
  project,
  onOpenContactModal,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const afters = (project.afterImages || []).filter(Boolean);
  const allPhotos: { label: string; url: string }[] = [];

  if (afters.length > 0) {
    allPhotos.push({ label: "완공 메인", url: afters[0] });
    afters.slice(1).forEach((u, i) => {
      allPhotos.push({ label: `완공 컷 ${i + 2}`, url: u });
    });
  }
  if (project.beforeImage) {
    allPhotos.push({ label: "시공 전 현장", url: project.beforeImage });
  }
  if (project.inProgressImage) {
    allPhotos.push({ label: "기초/목공 과정", url: project.inProgressImage });
  }

  if (allPhotos.length === 0) {
    allPhotos.push({
      label: "대표 이미지",
      url: "/images/hanshin_hero_bg_1784852933011.jpg",
    });
  }

  const currentPhoto = allPhotos[activePhotoIdx % allPhotos.length] || allPhotos[0];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length);
  };

  return (
    <article className="max-w-5xl mx-auto px-4 lg:px-8 py-12 space-y-10 text-stone-900">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4 text-xs text-stone-500">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-stone-600 hover:text-amber-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>시공사례 갤러리로 돌아가기</span>
        </Link>
        <div className="flex items-center gap-2">
          <span>홈</span>
          <span>/</span>
          <span>시공사례</span>
          <span>/</span>
          <span className="text-stone-800 font-bold">{project.category}</span>
        </div>
      </div>

      {/* Header Info */}
      <header className="space-y-3 font-sans">
        <div className="flex items-center gap-2 font-sans">
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full font-sans">
            {project.category}
          </span>
          <span className="text-xs text-stone-500 flex items-center gap-1 font-medium font-sans">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            {project.location}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-950 font-sans leading-tight break-keep">
          {project.title}
        </h1>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-stone-600 font-medium font-sans">
          {project.spaceTypeDetail && <span>{project.spaceTypeDetail}</span>}
          {project.area && (
            <>
              <span>•</span>
              <span>{project.area}</span>
            </>
          )}
          {project.duration && (
            <>
              <span>•</span>
              <span className="text-amber-700 font-bold">공사기간 {project.duration}</span>
            </>
          )}
        </div>
      </header>

      {/* Main Image Viewer */}
      <section className="space-y-3">
        <div className="relative h-[340px] sm:h-[480px] lg:h-[540px] rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center shadow-lg group">
          <img
            key={currentPhoto.url}
            src={currentPhoto.url}
            alt={`${project.title} - ${currentPhoto.label}`}
            className="w-full h-full object-cover transition-all duration-500"
            loading="eager"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

          {/* Photo Tag Badge (Top Left) */}
          <div className="absolute top-4 left-4 bg-stone-900/90 text-amber-300 text-xs px-3.5 py-1.5 rounded-full backdrop-blur-md border border-amber-500/40 font-bold shadow z-10 flex items-center gap-1.5">
            <span>{currentPhoto.label}</span>
          </div>

          {/* Photo Position Counter Badge (Top Right) */}
          <div className="absolute top-4 right-4 bg-stone-950/85 text-stone-200 text-xs px-3 py-1.5 rounded-full backdrop-blur-md border border-stone-700/60 font-mono font-semibold shadow z-10">
            <span className="text-amber-400 font-bold">{(activePhotoIdx % allPhotos.length) + 1}</span>
            <span className="text-stone-400 mx-1">/</span>
            <span>{allPhotos.length}</span>
          </div>

          {/* Navigation Arrows (Circular Loop) */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-950/70 hover:bg-amber-500 hover:text-stone-950 text-white flex items-center justify-center border border-white/20 transition-all backdrop-blur-md z-10 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                aria-label="이전 사진 보기"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-950/70 hover:bg-amber-500 hover:text-stone-950 text-white flex items-center justify-center border border-white/20 transition-all backdrop-blur-md z-10 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
                aria-label="다음 사진 보기"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails Grid (Full visibility without hidden scroll) */}
        {allPhotos.length > 1 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-2.5 pt-1">
            {allPhotos.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative aspect-[4/3] rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                  (activePhotoIdx % allPhotos.length) === idx
                    ? "border-amber-500 ring-2 ring-amber-400/80 scale-[1.02] shadow-md"
                    : "border-stone-200 hover:border-stone-400 opacity-75 hover:opacity-100"
                }`}
              >
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-1 inset-x-1 text-[10px] text-center text-white font-bold truncate">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Specs Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-100 p-5 rounded-2xl border border-stone-200">
        <div>
          <span className="text-stone-500 text-xs block">지역</span>
          <span className="font-bold text-stone-900">{project.location}</span>
        </div>
        <div>
          <span className="text-stone-500 text-xs block">공간 유형</span>
          <span className="font-bold text-stone-900">{project.spaceTypeDetail || project.category}</span>
        </div>
        <div>
          <span className="text-stone-500 text-xs block">면적</span>
          <span className="font-bold text-stone-900">{project.area || "상담 안내"}</span>
        </div>
        <div>
          <span className="text-stone-500 text-xs block">공사 기간</span>
          <span className="font-bold text-stone-900">{project.duration || "협의 진행"}</span>
        </div>
      </section>

      {/* Scope and Client Request */}
      <section className="space-y-4">
        {project.clientRequest && (
          <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
            <h2 className="font-bold text-amber-900 text-xs uppercase tracking-wide">
              고객 요청사항
            </h2>
            <p className="text-stone-800 text-sm leading-relaxed italic">
              "{project.clientRequest}"
            </p>
          </div>
        )}

        <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-1 shadow-sm">
          <h2 className="font-bold text-stone-900 text-xs uppercase tracking-wide">
            주요 공사범위
          </h2>
          <p className="text-stone-700 text-sm leading-relaxed">
            {project.scope}
          </p>
        </div>
      </section>

      {/* Description & Key Features */}
      <section className="space-y-4 font-sans">
        <h2 className="text-lg font-bold text-stone-950 font-sans break-keep">
          프로젝트 시공 개요 및 마감 디테일
        </h2>
        <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans break-keep">
          {project.description}
        </p>

        {project.keyFeatures && project.keyFeatures.length > 0 && (
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 font-sans">
            <span className="text-xs font-bold text-amber-800 block font-sans">
              핵심 시공 포인트:
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700 font-sans">
              {project.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-center gap-2 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium font-sans break-keep">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="bg-stone-950 text-stone-100 rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-800 shadow-xl font-sans">
        <div className="space-y-1 font-sans">
          <h3 className="text-lg sm:text-xl font-bold font-sans text-white break-keep">
            이 프로젝트와 유사한 공간 리모델링을 고민 중이신가요?
          </h3>
          <p className="text-stone-400 text-xs sm:text-sm font-sans break-keep">
            {SITE_ENTITY.brand.nameKo}는 현장 무료 방문 실측 및 1:1 맞춤 상세 견적을 제공합니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {onOpenContactModal ? (
            <button
              onClick={onOpenContactModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>비슷한 스타일로 무료 현장 실측 신청</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              to="/contact"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow text-center flex items-center justify-center gap-1.5"
            >
              <span>무료 현장 실측 상담 신청</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
          <Link
            to="/projects"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold text-center border border-stone-700 transition-all"
          >
            다른 시공사례 더보기
          </Link>
        </div>
      </section>
    </article>
  );
};
