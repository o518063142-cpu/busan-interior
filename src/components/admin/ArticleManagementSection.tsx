import React, { useState, useEffect, useRef } from "react";
import { AdminArticleItem, ArticleStatus } from "../../types";
import { INFORMATION_ARTICLES, InformationArticleData } from "../../data/informationData";
import { db } from "../../firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  Clock,
  Edit3,
  RotateCcw,
  X,
  Search,
  ExternalLink,
  Tag,
  ShieldCheck,
  ListChecks,
  Globe,
  FileText,
  Copy,
} from "lucide-react";

// Preset categories for convenience
const PRESET_CATEGORIES = [
  "인테리어 가이드",
  "법규 및 면허",
  "시공 가이드",
  "비용 및 견적",
  "공정별 팁",
  "자재 정보",
];

export const ArticleManagementSection: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("published");
  const [category, setCategory] = useState("인테리어 가이드");
  const [featuredImage, setFeaturedImage] = useState("");
  const [author, setAuthor] = useState("지니 인테리어 기술팀");

  // Checklist items
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [newChecklistInput, setNewChecklistInput] = useState("");

  // Submitting / Status feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Deletion Modal State
  const [articleToDelete, setArticleToDelete] = useState<AdminArticleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  // Copied slug state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Firestore Real-time Articles State
  const [firestoreArticles, setFirestoreArticles] = useState<AdminArticleItem[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // Subscribe to Firestore 'articles' collection
  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: AdminArticleItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const itemStatus: ArticleStatus =
            data.status === "draft" || data.status === "private" ? "draft" : "published";
          return {
            id: docSnap.id,
            slug: data.slug || docSnap.id,
            title: data.title || "무제 정보글",
            shortAnswer: data.shortAnswer || data.summary || "",
            summary: data.summary || data.shortAnswer || "",
            content: data.content || "",
            seoTitle: data.seoTitle || data.title || "",
            seoDescription: data.seoDescription || data.description || data.shortAnswer || "",
            category: data.category || "인테리어 가이드",
            featuredImage: data.featuredImage || data.coverImage || "",
            coverImage: data.coverImage || data.featuredImage || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            consumerChecklist: Array.isArray(data.consumerChecklist) ? data.consumerChecklist : [],
            author: data.author || "지니 인테리어 기술팀",
            status: itemStatus,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            publishedAt: data.publishedAt || "",
            isStaticDefault: false,
          };
        });
        setFirestoreArticles(list);
        setFirestoreLoading(false);
      },
      (err) => {
        console.error("Error fetching articles from Firestore:", err);
        setFirestoreLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Format slug input helper: lowercase, numbers, hyphens
  const handleSlugChange = (val: string) => {
    // Replace spaces with hyphen, remove invalid chars
    const cleaned = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setSlug(cleaned);
  };

  // Add checklist item
  const handleAddChecklist = () => {
    if (newChecklistInput.trim()) {
      setChecklistItems([...checklistItems, newChecklistInput.trim()]);
      setNewChecklistInput("");
    }
  };

  const handleRemoveChecklist = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  // Reset Form
  const resetForm = () => {
    setEditingArticleId(null);
    setTitle("");
    setSlug("");
    setShortAnswer("");
    setContent("");
    setSeoTitle("");
    setSeoDescription("");
    setStatus("published");
    setCategory("인테리어 가이드");
    setFeaturedImage("");
    setAuthor("지니 인테리어 기술팀");
    setChecklistItems([]);
    setNewChecklistInput("");
    setSubmitError(null);
  };

  // Populate form for editing
  const handleStartEdit = (article: AdminArticleItem) => {
    setEditingArticleId(article.id);
    setTitle(article.title);
    setSlug(article.slug);
    setShortAnswer(article.shortAnswer);
    setContent(article.content);
    setSeoTitle(article.seoTitle || article.title);
    setSeoDescription(article.seoDescription || article.shortAnswer);
    setStatus(article.status);
    setCategory(article.category || "인테리어 가이드");
    setFeaturedImage(article.featuredImage || article.coverImage || "");
    setAuthor(article.author || "지니 인테리어 기술팀");
    setChecklistItems(article.consumerChecklist || []);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validation
    const cleanSlug = slug.trim().toLowerCase();
    if (!title.trim()) {
      setSubmitError("정보글 제목을 입력해 주세요.");
      return;
    }
    if (!cleanSlug) {
      setSubmitError("URL Slug를 입력해 주세요. (영문 소문자, 숫자, 하이픈)");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
      setSubmitError("Slug는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.");
      return;
    }
    if (!shortAnswer.trim()) {
      setSubmitError("핵심 요약문(Short Answer)을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      setSubmitError("본문 내용을 입력해 주세요.");
      return;
    }

    // Check duplicate slug with static articles
    const isStaticCollision = INFORMATION_ARTICLES.some((sa) => sa.slug === cleanSlug);
    if (isStaticCollision) {
      setSubmitError(
        `'${cleanSlug}'는 기본 탑재된 정적 고유 문서의 slug입니다. 다른 slug를 지정해 주세요.`
      );
      return;
    }

    // Check duplicate slug with other Firestore articles
    const isDuplicateSlug = firestoreArticles.some(
      (a) => a.slug === cleanSlug && a.id !== editingArticleId
    );
    if (isDuplicateSlug) {
      setSubmitError(`'${cleanSlug}' slug는 이미 등록된 정보글에서 사용 중입니다.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const finalSeoTitle = seoTitle.trim() || `${title.trim()}｜지니 인테리어`;
      const finalSeoDesc = seoDescription.trim() || shortAnswer.trim();

      const articlePayload = {
        title: title.trim(),
        slug: cleanSlug,
        shortAnswer: shortAnswer.trim(),
        summary: shortAnswer.trim(),
        content: content.trim(),
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDesc,
        status: status, // "published" | "draft"
        category: category.trim() || "인테리어 가이드",
        featuredImage: featuredImage.trim(),
        coverImage: featuredImage.trim(),
        tags: [category.trim()],
        consumerChecklist: checklistItems,
        author: author.trim() || "지니 인테리어 기술팀",
        updatedAt: serverTimestamp(),
      };

      if (editingArticleId) {
        // Update existing document
        const docRef = doc(db, "articles", editingArticleId);
        await updateDoc(docRef, articlePayload);
        setSubmitSuccess("정보글이 성공적으로 수정되었습니다.");
      } else {
        // Create new document
        const newDocRef = doc(collection(db, "articles"));
        await setDoc(newDocRef, {
          ...articlePayload,
          id: newDocRef.id,
          createdAt: serverTimestamp(),
          publishedAt: todayStr,
        });
        setSubmitSuccess("새 정보글이 성공적으로 등록되었습니다.");
      }

      resetForm();
    } catch (err: any) {
      console.error("Error saving article to Firestore:", err);
      setSubmitError(`저장 중 오류가 발생했습니다: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    setDeleteModalError(null);

    try {
      await deleteDoc(doc(db, "articles", articleToDelete.id));
      setArticleToDelete(null);
    } catch (err: any) {
      console.error("Error deleting article:", err);
      setDeleteModalError(`삭제 중 오류가 발생했습니다: ${err.message || String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy URL Slug
  const handleCopyLink = (targetSlug: string) => {
    const fullUrl = `${window.location.origin}/information/${targetSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(targetSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Static articles for read-only reference list
  const staticArticlesList: AdminArticleItem[] = INFORMATION_ARTICLES.map((sa) => ({
    id: `static-${sa.slug}`,
    slug: sa.slug,
    title: sa.title,
    shortAnswer: sa.shortAnswer,
    summary: sa.shortAnswer,
    content: sa.content,
    seoTitle: sa.title,
    seoDescription: sa.description || sa.shortAnswer,
    category: sa.category || "기본 가이드",
    featuredImage: sa.featuredImage || "",
    coverImage: sa.featuredImage || "",
    tags: [],
    consumerChecklist: sa.consumerChecklist || [],
    author: sa.author || "지니 인테리어 기술팀",
    status: "published",
    publishedAt: sa.publishedAt,
    updatedAt: sa.updatedAt,
    isStaticDefault: true,
  }));

  // Combined articles for counts & display
  const allArticles = [...staticArticlesList, ...firestoreArticles];

  // Filtering
  const filteredArticles = allArticles.filter((article) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.category && article.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && article.status === "published") ||
      (statusFilter === "draft" && article.status === "draft") ||
      (statusFilter === "static" && article.isStaticDefault);

    return matchesSearch && matchesStatus;
  });

  const countTotal = allArticles.length;
  const countPublished = allArticles.filter((a) => a.status === "published").length;
  const countDraft = firestoreArticles.filter((a) => a.status === "draft").length;
  const countStatic = staticArticlesList.length;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Stat Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">전체 정보글</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{countTotal}개</p>
          <span className="text-[11px] text-stone-500">기본 {countStatic} + 등록 {firestoreArticles.length}</span>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">공개 발행됨</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-2">{countPublished}개</p>
          <span className="text-[11px] text-emerald-500/80">/information/{'{slug}'} 공개</span>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">비공개(작성중)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-2">{countDraft}개</p>
          <span className="text-[11px] text-amber-500/80">관리자 전용 보관</span>
        </div>

        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-400 font-medium">기본 정적 자산</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-stone-200 mt-2">{countStatic}개</p>
          <span className="text-[11px] text-stone-500">영구 보존 SEO 자산</span>
        </div>
      </div>

      {/* Write / Edit Article Form */}
      <div
        ref={formRef}
        className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              {editingArticleId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{editingArticleId ? "정보글 수정하기" : "새 정보글 작성"}</span>
                {editingArticleId && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    수정 모드
                  </span>
                )}
              </h2>
              <p className="text-xs text-stone-400">
                실내건축 지식센터(/information)에 등록될 전문 가이드 문서를 관리합니다.
              </p>
            </div>
          </div>

          {editingArticleId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>신규 작성으로 전환</span>
            </button>
          )}
        </div>

        {/* Form Messages */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700 rounded-xl flex items-center gap-3 text-emerald-200 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-rose-950/80 border border-rose-700 rounded-xl flex items-center gap-3 text-rose-200 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                정보글 제목 <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 부산 30평형 아파트 인테리어 평당 비용과 자재 선정 가이드"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!editingArticleId && !seoTitle) {
                    setSeoTitle(e.target.value);
                  }
                }}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                URL Slug <span className="text-rose-400">*</span>
                <span className="text-[11px] text-stone-500 font-normal ml-1">
                  (/information/<span className="text-amber-400 font-mono">{slug || "example-slug"}</span>)
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="예: busan-apartment-remodeling-cost"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm font-mono"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                * 영문 소문자, 숫자, 하이픈(-)만 입력 가능합니다. (공백은 자동으로 하이픈으로 변환)
              </p>
            </div>
          </div>

          {/* Row 2: Category & Status & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                카테고리
              </label>
              <input
                type="text"
                placeholder="예: 시공 가이드"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      category === cat
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                공개 상태 <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus("published")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === "published"
                      ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500"
                      : "bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>발행 (공개)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("draft")}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    status === "draft"
                      ? "bg-amber-950/80 border-amber-500 text-amber-300 ring-1 ring-amber-500"
                      : "bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>비공개 (보관)</span>
                </button>
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                {status === "published"
                  ? "✓ 사이트 및 sitemap.xml에 즉시 노출됩니다."
                  : "✗ 일반 사용자에게 노출되지 않고 관리자만 열람합니다."}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                작성자 표기
              </label>
              <input
                type="text"
                placeholder="지니 인테리어 기술팀"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Row 3: Short Answer (Executive Summary) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>핵심 요약문 (Short Answer) <span className="text-rose-400">*</span></span>
              </label>
              <span className="text-[11px] text-stone-500">
                상세 페이지 최상단 강조 박스 및 검색 스니펫에 노출됩니다.
              </span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="예: 부산 30평형 아파트 올 리모델링은 평당 약 150만~250만원 선이며, 창호 단열재 교체와 배관 방수 상태 점검이 가장 중요합니다. 1,500만원 이상 공사는 실내건축공사업 면허 업체 선정이 필수입니다."
              value={shortAnswer}
              onChange={(e) => {
                setShortAnswer(e.target.value);
                if (!editingArticleId && !seoDescription) {
                  setSeoDescription(e.target.value);
                }
              }}
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Row 4: Main Content (Multiline textarea) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>본문 내용 <span className="text-rose-400">*</span></span>
              </label>
              <span className="text-[11px] text-stone-500">
                줄바꿈과 문단으로 구성된 본문 내용이 그대로 상세 화면에 렌더링됩니다.
              </span>
            </div>
            <textarea
              required
              rows={10}
              placeholder={`1. 부산 지역 아파트 리모델링 시공 전 사전 점검 사항
구축 아파트의 경우 단열 결로와 발코니 누수 방지를 위한 2중 우레탄 방수 공정이 최우선입니다.

2. 공사비 산출 시 유의해야 할 추가금 리스크
철거 후 드러나는 벽체 균열, 노후 배관 교체 비용을 사전 실측 시 미리 내역서에 투명하게 반영해야 합니다.

3. 건설산업기본법에 따른 면허 업체 계약 필수성
공사금액 1,500만원 이상의 모든 인테리어는 지자체 정식 등록 실내건축공사업 면허 업체와 계약해야 법적 보호를 받습니다.`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm leading-relaxed font-sans"
            />
          </div>

          {/* Row 5: Checklist / Key Points */}
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <span>소비자 필수 체크리스트 항목 (선택)</span>
              </label>
              <span className="text-[11px] text-stone-500">
                상세 페이지에 번호형 체크박스로 노출
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="예: 공사 계약 전 실내건축공사업 등록증 및 KISCON 확인"
                value={newChecklistInput}
                onChange={(e) => setNewChecklistInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-bold border border-stone-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>항목 추가</span>
              </button>
            </div>

            {checklistItems.length > 0 && (
              <div className="space-y-2 pt-1">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 bg-stone-900 rounded-xl border border-stone-800 text-xs text-stone-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-emerald-800">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      className="text-stone-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Row 6: SEO Settings Accordion / Box */}
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>검색엔진 최적화 (SEO) 메타데이터</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  SEO Title (검색 결과 제목)
                </label>
                <input
                  type="text"
                  placeholder="미입력 시 기본 제목 자동 적용"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                  대표 이미지 URL (선택)
                </label>
                <input
                  type="url"
                  placeholder="https://... 또는 /images/..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                SEO Description (검색 결과 설명문)
              </label>
              <input
                type="text"
                placeholder="미입력 시 핵심 요약문 자동 적용"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            {editingArticleId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700 transition-all cursor-pointer"
              >
                수정 취소
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>저장 처리 중...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editingArticleId ? "정보글 수정 완료" : "정보글 저장 및 등록"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Article List Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>정보글 목록</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                {filteredArticles.length}개
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              등록된 정보글 및 기본 정적 가이드 목록입니다. 수정 및 공개 여부를 설정할 수 있습니다.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="제목, slug, 카테고리 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto">
              {[
                { key: "all", label: "전체" },
                { key: "published", label: "발행" },
                { key: "draft", label: "비공개" },
                { key: "static", label: "정적" },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    statusFilter === f.key
                      ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                      : "bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {firestoreLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-xs text-stone-500">정보글 목록을 불러오는 중입니다...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-stone-800 text-stone-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-300">검색 조건에 맞는 정보글이 없습니다.</p>
            <p className="text-xs text-stone-500">검색어를 초기화하거나 상단 폼에서 새 글을 작성해 보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const isStatic = article.isStaticDefault;
              const isDraft = article.status === "draft";

              return (
                <div
                  key={article.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isStatic
                      ? "bg-stone-950/60 border-stone-800 hover:border-stone-700"
                      : isDraft
                      ? "bg-stone-950/90 border-stone-800/80 hover:border-amber-500/40"
                      : "bg-stone-950 border-stone-800 hover:border-amber-500/50"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isStatic ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>기본 정적 자산 (보호됨)</span>
                          </span>
                        ) : isDraft ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>비공개 (draft)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>발행 (공개)</span>
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-900 text-stone-400 border border-stone-800">
                          {article.category || "인테리어 가이드"}
                        </span>

                        {article.publishedAt && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            발행일: {article.publishedAt}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug break-keep">
                        {article.title}
                      </h3>

                      <div className="flex items-center gap-2 flex-wrap text-xs text-stone-400 font-mono">
                        <span className="text-stone-500">URL:</span>
                        <span className="text-amber-400/90 break-all">
                          /information/{article.slug}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(article.slug)}
                          className="px-1.5 py-0.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                          title="링크 복사"
                        >
                          {copiedSlug === article.slug ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {article.shortAnswer}
                      </p>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-stone-800/80 shrink-0">
                      {/* View Link */}
                      <a
                        href={`/information/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-xs font-semibold border border-stone-800 transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>페이지 보기</span>
                      </a>

                      {/* Edit Button */}
                      {!isStatic && (
                        <button
                          type="button"
                          onClick={() => handleStartEdit(article)}
                          className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>수정</span>
                        </button>
                      )}

                      {/* Delete Button */}
                      {!isStatic ? (
                        <button
                          type="button"
                          onClick={() => setArticleToDelete(article)}
                          className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-950 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-800/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 text-[10px] text-stone-500 font-semibold bg-stone-900 rounded-lg border border-stone-800">
                          삭제 불가 (정적 고정)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">정보글 삭제 확인</h3>
                <p className="text-xs text-rose-400">이 작업은 취소할 수 없습니다.</p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1.5 text-xs text-stone-300">
              <p className="font-bold text-white">{articleToDelete.title}</p>
              <p className="text-stone-500 font-mono text-[11px]">
                /information/{articleToDelete.slug}
              </p>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              정말로 이 정보글을 삭제하시겠습니까? 삭제 시 Firestore 데이터베이스에서 영구히 제거되며, 해당 URL 접속 시 404 안내가 노출됩니다.
            </p>

            {deleteModalError && (
              <p className="text-xs text-rose-400 bg-rose-950/60 p-3 rounded-lg border border-rose-800">
                {deleteModalError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setArticleToDelete(null);
                  setDeleteModalError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>영구 삭제</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
