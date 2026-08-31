import React, { useState, useEffect, useRef } from "react";
import { ProjectCategory, ProjectItem } from "../../types";
import { PROJECTS_DATA } from "../../data/projectsData";
import { db, storage } from "../../firebase";
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
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import {
  FolderPlus,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  Layers,
  MapPin,
  Building,
  Ruler,
  Calendar,
  Sparkles,
  Upload,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  Database,
  Clock,
  HardDrive,
  FileCheck,
  Edit3,
  RotateCcw,
  X,
  Globe,
  Link2,
  Copy,
  ExternalLink,
} from "lucide-react";

export const ProjectManagementSection: React.FC = () => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("주거");
  const [spaceTypeDetail, setSpaceTypeDetail] = useState("");
  const [area, setArea] = useState("");
  const [duration, setDuration] = useState("");
  const [scope, setScope] = useState("");
  const [clientRequest, setClientRequest] = useState("");
  const [description, setDescription] = useState("");
  const [isSample, setIsSample] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Key Features list state
  const [keyFeatures, setKeyFeatures] = useState<string[]>([
    "단열 및 고기밀 창호 전면 교체",
    "맞춤 주방 가구 및 시스템 수납 설계",
    "포세린 타일 및 고급 욕실 리모델링",
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Existing Photo URLs (for Edit Mode)
  const [existingMainAfterUrl, setExistingMainAfterUrl] = useState<string>("");
  const [existingAdditionalAfterUrls, setExistingAdditionalAfterUrls] = useState<string[]>([]);
  const [existingBeforeUrl, setExistingBeforeUrl] = useState<string>("");
  const [existingInProgressUrl, setExistingInProgressUrl] = useState<string>("");

  // Actual Photo Files State (for New Uploads)
  const [mainAfterFile, setMainAfterFile] = useState<File | null>(null);
  const [mainAfterPhotoName, setMainAfterPhotoName] = useState<string | null>(null);

  const [additionalAfterFiles, setAdditionalAfterFiles] = useState<File[]>([]);
  const [additionalAfterPhotoNames, setAdditionalAfterPhotoNames] = useState<string[]>([]);

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforePhotoName, setBeforePhotoName] = useState<string | null>(null);

  const [inProgressFile, setInProgressFile] = useState<File | null>(null);
  const [inProgressPhotoName, setInProgressPhotoName] = useState<string | null>(null);

  // Submission & Upload Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // React State Deletion Modal
  const [projectToDelete, setProjectToDelete] = useState<ProjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  // Firestore Real-time Projects State
  const [firestoreProjects, setFirestoreProjects] = useState<ProjectItem[]>([]);
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // Subscribe to Firestore 'projects' collection
  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: ProjectItem[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            slug: data.slug || (docSnap.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : ""),
            isSample: data.isSample ?? false,
            title: data.title || "무제 프로젝트",
            location: data.location || "",
            category: (data.category as any) || "주거",
            spaceTypeDetail: data.spaceTypeDetail || "",
            area: data.area || "",
            duration: data.duration || "",
            scope: data.scope || "",
            clientRequest: data.clientRequest || "",
            description: data.description || "",
            keyFeatures: data.keyFeatures || [],
            beforeImage: data.beforeImage || "",
            inProgressImage: data.inProgressImage || "",
            afterImages: data.afterImages || [],
          };
        });
        setFirestoreProjects(list);
        setFirestoreLoading(false);
      },
      (err) => {
        console.error("Error fetching projects from Firestore:", err);
        setFirestoreLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // SEO Slug Generation Helper
  const generateSlugFromDetails = (titleStr: string, locationStr: string, spaceStr: string) => {
    let base = `${locationStr} ${spaceStr} ${titleStr}`.toLowerCase();
    const dictionary: Record<string, string> = {
      부산: "busan",
      사직동: "sajik",
      사직: "sajik",
      전포동: "jeonpo",
      전포: "jeonpo",
      서면: "seomyeon",
      부전동: "bujeon",
      부전: "bujeon",
      가야동: "gaya",
      가야: "gaya",
      범천동: "beomcheon",
      범천: "beomcheon",
      동래구: "dongnae",
      동래: "dongnae",
      부산진구: "busanjin",
      해운대구: "haeundae",
      해운대: "haeundae",
      수영구: "suyeong",
      남구: "namgu",
      북구: "bukgu",
      금정구: "geumjeong",
      연제구: "yeonje",
      중구: "junggu",
      영도구: "yeongdo",
      빌라: "villa",
      아파트: "apt",
      주택: "house",
      원룸: "studio",
      오피스텔: "officetel",
      상가: "store",
      매장: "shop",
      카페: "cafe",
      음식점: "restaurant",
      식당: "restaurant",
      사무실: "office",
      오피스: "office",
      리모델링: "remodeling",
      인테리어: "interior",
      구축: "old",
      신축: "new",
    };

    for (const [k, v] of Object.entries(dictionary)) {
      base = base.split(k).join(` ${v} `);
    }

    const clean = base
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    return clean || `project-${Date.now().toString(36)}`;
  };

  const handleAutoGenerateSlug = () => {
    const auto = generateSlugFromDetails(title, location, spaceTypeDetail);
    setSlug(auto);
  };

  const handleSlugInputChange = (val: string) => {
    const cleaned = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");
    setSlug(cleaned);
  };

  const handleCopyUrl = (urlSlug: string) => {
    const fullUrl = `https://gene-interior.vercel.app/projects/${urlSlug}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedSlug(urlSlug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  // Add feature helper
  const handleAddFeature = () => {
    if (newFeatureInput.trim()) {
      setKeyFeatures([...keyFeatures, newFeatureInput.trim()]);
      setNewFeatureInput("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, idx) => idx !== index));
  };

  // Safe file name cleaner for Storage paths
  const sanitizeFileName = (fileName: string) => {
    const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return clean.length > 50 ? clean.slice(-50) : clean;
  };

  // Reset all form inputs and file states
  const resetFormState = () => {
    setEditingProjectId(null);
    setTitle("");
    setSlug("");
    setLocation("");
    setCategory("주거");
    setSpaceTypeDetail("");
    setArea("");
    setDuration("");
    setScope("");
    setClientRequest("");
    setDescription("");
    setIsSample(false);
    setKeyFeatures([
      "단열 및 고기밀 창호 전면 교체",
      "맞춤 주방 가구 및 시스템 수납 설계",
      "포세린 타일 및 고급 욕실 리모델링",
    ]);
    setNewFeatureInput("");

    setExistingMainAfterUrl("");
    setExistingAdditionalAfterUrls([]);
    setExistingBeforeUrl("");
    setExistingInProgressUrl("");

    setMainAfterFile(null);
    setMainAfterPhotoName(null);
    setAdditionalAfterFiles([]);
    setAdditionalAfterPhotoNames([]);
    setBeforeFile(null);
    setBeforePhotoName(null);
    setInProgressFile(null);
    setInProgressPhotoName(null);
  };

  // Switch to Edit Mode with loaded data
  const handleStartEdit = (proj: ProjectItem) => {
    setEditingProjectId(proj.id);
    setTitle(proj.title || "");
    setSlug(proj.slug || (proj.id === "wkv0to3v3LYzluyUtBU2" ? "busan-sajik-villa-remodeling" : ""));
    setLocation(proj.location || "");
    setCategory((proj.category as ProjectCategory) || "주거");
    setSpaceTypeDetail(proj.spaceTypeDetail || "");
    setArea(proj.area || "");
    setDuration(proj.duration || "");
    setScope(proj.scope || "");
    setClientRequest(proj.clientRequest || "");
    setDescription(proj.description || "");
    setIsSample(proj.isSample ?? false);
    setKeyFeatures(
      proj.keyFeatures && proj.keyFeatures.length > 0
        ? proj.keyFeatures
        : ["단열 및 고기밀 창호 전면 교체", "맞춤 주방 가구 및 시스템 수납 설계"]
    );
    setNewFeatureInput("");

    // Load existing photos
    const afters = proj.afterImages || [];
    setExistingMainAfterUrl(afters.length > 0 ? afters[0] : "");
    setExistingAdditionalAfterUrls(afters.length > 1 ? afters.slice(1) : []);
    setExistingBeforeUrl(proj.beforeImage || "");
    setExistingInProgressUrl(proj.inProgressImage || "");

    // Clear new upload stages
    setMainAfterFile(null);
    setMainAfterPhotoName(null);
    setAdditionalAfterFiles([]);
    setAdditionalAfterPhotoNames([]);
    setBeforeFile(null);
    setBeforePhotoName(null);
    setInProgressFile(null);
    setInProgressPhotoName(null);

    setSubmitError(null);
    setSubmitSuccess(null);

    // Scroll to form
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    resetFormState();
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Recursively delete all files in a Storage folder
  const deleteStorageFolder = async (folderPath: string) => {
    try {
      const folderRef = ref(storage, folderPath);
      const res = await listAll(folderRef);

      // Delete all files in current folder
      await Promise.all(
        res.items.map(async (itemRef) => {
          try {
            await deleteObject(itemRef);
          } catch (err: any) {
            if (err.code !== "storage/object-not-found") {
              console.warn(`Storage item delete notice (${itemRef.fullPath}):`, err);
            }
          }
        })
      );

      // Recurse into subfolders
      await Promise.all(res.prefixes.map((prefixRef) => deleteStorageFolder(prefixRef.fullPath)));
    } catch (err: any) {
      if (err.code !== "storage/object-not-found") {
        console.warn(`Storage folder delete notice (${folderPath}):`, err);
      }
    }
  };

  // Open React Deletion Modal
  const handleOpenDeleteModal = (proj: ProjectItem) => {
    // Safety check: protect static PROJECTS_DATA
    if (PROJECTS_DATA.some((p) => p.id === proj.id)) {
      alert("기본 탑재 포트폴리오는 삭제할 수 없습니다.");
      return;
    }
    setProjectToDelete(proj);
    setDeleteModalError(null);
  };

  // Confirm and execute Storage + Firestore deletion
  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    // Double safety check: protect static PROJECTS_DATA
    if (PROJECTS_DATA.some((p) => p.id === projectToDelete.id)) {
      setDeleteModalError("기본 탑재 포트폴리오는 삭제할 수 없습니다.");
      return;
    }

    setIsDeleting(true);
    setDeleteModalError(null);

    try {
      // 1. Delete Storage photos in projects/{projectId}/ (safely ignore non-existent files)
      try {
        await deleteStorageFolder(`projects/${projectToDelete.id}`);
      } catch (storageErr: any) {
        console.warn("Storage folder deletion note (continuing to document delete):", storageErr);
      }

      // 2. Delete Firestore Document
      await deleteDoc(doc(db, "projects", projectToDelete.id));

      // 3. Reset form if currently editing this project
      if (editingProjectId === projectToDelete.id) {
        resetFormState();
      }

      const deletedTitle = projectToDelete.title;
      // Close modal
      setProjectToDelete(null);
      setSubmitSuccess(`시공사례 "${deletedTitle}" 및 등록된 사진이 정상적으로 삭제되었습니다.`);
    } catch (err: any) {
      console.error("Project deletion error:", err);
      setDeleteModalError(`삭제 실패: ${err.message || "오류가 발생했습니다."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Form Submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setUploadProgressText("");

    // 1. Text Field Validations
    if (!title.trim()) {
      setSubmitError("프로젝트명을 입력해주세요.");
      return;
    }
    if (!location.trim()) {
      setSubmitError("시공 지역을 입력해주세요.");
      return;
    }
    if (!spaceTypeDetail.trim()) {
      setSubmitError("상세 공간 유형을 입력해주세요.");
      return;
    }
    if (!area.trim()) {
      setSubmitError("면적을 입력해주세요.");
      return;
    }
    if (!duration.trim()) {
      setSubmitError("공사 기간을 입력해주세요.");
      return;
    }
    if (!scope.trim()) {
      setSubmitError("공사 범위를 입력해주세요.");
      return;
    }
    if (!description.trim()) {
      setSubmitError("프로젝트 상세 소개글을 입력해주세요.");
      return;
    }

    // 2. Prevent duplicate clicks
    setIsSubmitting(true);

    try {
      const isEditMode = Boolean(editingProjectId);
      const projectId = isEditMode
        ? editingProjectId!
        : doc(collection(db, "projects")).id;
      const projectDocRef = doc(db, "projects", projectId);

      // 3. Handle Representative After Image (afterImages[0])
      let finalMainAfterUrl = existingMainAfterUrl;
      if (mainAfterFile) {
        setUploadProgressText("대표 완공사진 Firebase Storage에 업로드 중...");
        const mainFileName = `main_${Date.now()}_${sanitizeFileName(mainAfterFile.name)}`;
        const mainStorageRef = ref(storage, `projects/${projectId}/after/${mainFileName}`);

        try {
          const snapshot = await uploadBytes(mainStorageRef, mainAfterFile);
          finalMainAfterUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadErr: any) {
          console.error("Main after image upload failed:", uploadErr);
          throw new Error(
            `[대표 완공사진] 업로드 실패: ${uploadErr.message || uploadErr}`
          );
        }
      }

      // 4. Handle Additional After Images (afterImages[1..])
      const finalAdditionalAfterUrls: string[] = [...existingAdditionalAfterUrls];
      if (additionalAfterFiles.length > 0) {
        for (let i = 0; i < additionalAfterFiles.length; i++) {
          const file = additionalAfterFiles[i];
          setUploadProgressText(
            `추가 완공사진 (${i + 1}/${additionalAfterFiles.length}) 업로드 중...`
          );
          const extraFileName = `extra_${Date.now()}_${i + 1}_${sanitizeFileName(file.name)}`;
          const extraStorageRef = ref(storage, `projects/${projectId}/after/${extraFileName}`);

          try {
            const snapshot = await uploadBytes(extraStorageRef, file);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            finalAdditionalAfterUrls.push(downloadUrl);
          } catch (uploadErr: any) {
            console.error(`Extra after image ${i + 1} upload failed:`, uploadErr);
            throw new Error(
              `[추가 완공사진 #${i + 1} (${file.name})] 업로드 실패: ${
                uploadErr.message || uploadErr
              }`
            );
          }
        }
      }

      // Assemble final afterImages array
      const finalAfterImages: string[] = [];
      if (finalMainAfterUrl) {
        finalAfterImages.push(finalMainAfterUrl);
      }
      finalAfterImages.push(...finalAdditionalAfterUrls);

      // 5. Handle Before Image
      let finalBeforeUrl = existingBeforeUrl;
      if (beforeFile) {
        setUploadProgressText("시공 전(Before) 사진 Firebase Storage에 업로드 중...");
        const beforeFileName = `before_${Date.now()}_${sanitizeFileName(beforeFile.name)}`;
        const beforeStorageRef = ref(storage, `projects/${projectId}/before/${beforeFileName}`);

        try {
          const snapshot = await uploadBytes(beforeStorageRef, beforeFile);
          finalBeforeUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadErr: any) {
          console.error("Before image upload failed:", uploadErr);
          throw new Error(`[시공 전 사진] 업로드 실패: ${uploadErr.message || uploadErr}`);
        }
      }

      // 6. Handle In-Progress Image
      let finalInProgressUrl = existingInProgressUrl;
      if (inProgressFile) {
        setUploadProgressText("시공 과정(In-Progress) 사진 Firebase Storage에 업로드 중...");
        const processFileName = `process_${Date.now()}_${sanitizeFileName(inProgressFile.name)}`;
        const processStorageRef = ref(storage, `projects/${projectId}/process/${processFileName}`);

        try {
          const snapshot = await uploadBytes(processStorageRef, inProgressFile);
          finalInProgressUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadErr: any) {
          console.error("In-progress image upload failed:", uploadErr);
          throw new Error(`[시공 과정 사진] 업로드 실패: ${uploadErr.message || uploadErr}`);
        }
      }

      // 7. Save to Firestore (setDoc or updateDoc)
      setUploadProgressText("Firestore 'projects' 데이터베이스 동기화 중...");

      const finalSlug =
        slug.trim() ||
        (projectId === "wkv0to3v3LYzluyUtBU2"
          ? "busan-sajik-villa-remodeling"
          : generateSlugFromDetails(title, location, spaceTypeDetail));

      if (isEditMode) {
        // Update existing document
        await updateDoc(projectDocRef, {
          title: title.trim(),
          slug: finalSlug,
          location: location.trim(),
          category,
          spaceTypeDetail: spaceTypeDetail.trim(),
          area: area.trim(),
          duration: duration.trim(),
          scope: scope.trim(),
          clientRequest: clientRequest.trim(),
          description: description.trim(),
          keyFeatures: keyFeatures.filter((f) => f.trim().length > 0),
          beforeImage: finalBeforeUrl,
          inProgressImage: finalInProgressUrl,
          afterImages: finalAfterImages,
          isSample,
          updatedAt: serverTimestamp(),
        });

        setSubmitSuccess(`시공사례 "${title.trim()}" 가 성공적으로 수정되었습니다! (URL: /projects/${finalSlug})`);
      } else {
        // Create new document
        const projectPayload = {
          id: projectId,
          slug: finalSlug,
          title: title.trim(),
          location: location.trim(),
          category,
          spaceTypeDetail: spaceTypeDetail.trim(),
          area: area.trim(),
          duration: duration.trim(),
          scope: scope.trim(),
          clientRequest: clientRequest.trim(),
          description: description.trim(),
          keyFeatures: keyFeatures.filter((f) => f.trim().length > 0),
          beforeImage: finalBeforeUrl,
          inProgressImage: finalInProgressUrl,
          afterImages: finalAfterImages,
          isSample,
          createdAt: serverTimestamp(),
        };

        await setDoc(projectDocRef, projectPayload);
        setSubmitSuccess(
          `시공사례 "${title.trim()}" 가 성공적으로 등록되었습니다! (URL: /projects/${finalSlug}, 사진 ${finalAfterImages.length}장 등록 완료)`
        );
      }

      // Reset form
      resetFormState();
    } catch (err: any) {
      console.error("Project submission error:", err);
      setSubmitError(`저장 실패 — ${err.message || "알 수 없는 오류가 발생했습니다."}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgressText("");
    }
  };

  return (
    <div className="space-y-12">
      {/* Top Header info */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-sans break-keep">
              시공사례 포트폴리오 관리 (Firestore & Storage)
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              실제 현장 완공 사진, Before/After, 공사 스펙을 실시간으로 등록·수정·삭제합니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center gap-3">
            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-400 block">Firestore 컬렉션</span>
              <strong className="text-white font-mono">projects</strong>
            </div>
          </div>
          <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center gap-3">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-400 block">실시간 등록 시공사례</span>
              <strong className="text-white font-bold">{firestoreProjects.length}건 등록됨</strong>
            </div>
          </div>
          <div className="p-3.5 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center gap-3">
            <Layers className="w-4 h-4 text-stone-400 shrink-0" />
            <div className="text-xs">
              <span className="text-stone-400 block">기본 탑재 포트폴리오</span>
              <strong className="text-amber-400 font-bold">{PROJECTS_DATA.length}건 (사직동 포함)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Registration / Edit Form */}
      <div ref={formRef} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${editingProjectId ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
              {editingProjectId ? <Edit3 className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans break-keep">
                {editingProjectId ? "시공사례 수정 모드" : "신규 시공사례 등록"}
              </h3>
              <p className="text-xs text-stone-400">
                {editingProjectId ? `문서 ID: ${editingProjectId} 데이터를 수정 중입니다.` : "양식을 작성하고 사진을 선택하면 Firebase Storage 업로드 및 DB 저장이 자동 진행됩니다."}
              </p>
            </div>
          </div>

          {editingProjectId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>수정 취소 (신규 등록으로 전환)</span>
            </button>
          )}
        </div>

        {/* Feedback Alert Banners */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{submitSuccess}</div>
            <button
              onClick={() => setSubmitSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs font-bold"
            >
              닫기
            </button>
          </div>
        )}

        {submitError && (
          <div className="p-4 bg-red-950/80 border border-red-700 text-red-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{submitError}</div>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-400 hover:text-red-200 text-xs font-bold"
            >
              닫기
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Section 1: 기본 정보 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>1. 기본 정보 및 프로젝트 개요</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 프로젝트명 */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  프로젝트명 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 부산진구 전포동 32평 아파트 모던 내추럴 올 리모델링"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SEO 영문 Slug (고정 URL) */}
              <div className="sm:col-span-2 space-y-2 bg-stone-900/60 border border-stone-800/80 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="block text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>SEO 고정 영문 Slug (검색엔진 최적화 정규 URL)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSlug}
                    disabled={isSubmitting || (!title && !location)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>슬러그 자동 생성</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-500 text-xs font-mono select-none hidden sm:block">
                    /projects/
                  </div>
                  <input
                    type="text"
                    placeholder="예: busan-sajik-villa-remodeling (미입력 시 자동 생성)"
                    value={slug}
                    onChange={(e) => handleSlugInputChange(e.target.value)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-amber-300 font-mono text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[11px] text-stone-400 font-sans">
                  미입력 시 지역명, 공간유형, 제목을 분석하여 <span className="text-stone-300 font-mono">/projects/busan-sajik-villa-remodeling</span> 형태의 정규 URL이 자동 부여됩니다.
                </p>
              </div>

              {/* 시공 지역 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  시공 지역 (구/동) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 부산진구 전포동, 동래구 사직동"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 공간 카테고리 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  공간 카테고리 <span className="text-amber-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="주거">주거 (아파트·빌라·주택)</option>
                  <option value="상가·매장">상가·매장 (로드숍·쇼룸·뷰티)</option>
                  <option value="카페·음식점">카페·음식점 (베이커리·식당)</option>
                  <option value="사무실">사무실 (오피스·스튜디오)</option>
                  <option value="공공·교육시설">공공·교육시설 (학교·교육시설·공공기관)</option>
                </select>
              </div>

              {/* 상세 공간 유형 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  상세 공간 유형 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 32평 아파트, 디저트 카페, IT 사무실"
                  value={spaceTypeDetail}
                  onChange={(e) => setSpaceTypeDetail(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 면적 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  면적 (평 / m²) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 32평 / 105m²"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 공사 기간 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  공사 기간 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 3주 소요, 3.5주"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 공사 범위 */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-300">
                  주요 공사 범위 <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 전체 올 리모델링 (창호, 목공, 타일, 주방, 조명)"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: 상세 소개 & 고객 요청사항 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>2. 프로젝트 상세 소개 및 시공 포인트</span>
            </h4>

            {/* 고객 요청사항 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                고객 핵심 요청사항
              </label>
              <textarea
                rows={2}
                placeholder="예: 노후된 배관과 단열을 보강하고, 개방감 있는 거실 구조와 맞춤 수납을 요청하셨습니다."
                value={clientRequest}
                onChange={(e) => setClientRequest(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 상세 설명 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-300">
                프로젝트 상세 설명 <span className="text-amber-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="공간 기획 의도, 마감재 선정 배경, 시공 특징 등을 구체적으로 작성해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>

            {/* 핵심 시공 포인트 태그 */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300">
                핵심 시공 포인트 (체크리스트)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="예: 거실 발코니 고효율 단열 확장 및 이중창 교체"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>추가</span>
                </button>
              </div>

              {keyFeatures.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {keyFeatures.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-stone-950 text-stone-300 text-xs rounded-xl border border-stone-800 flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-stone-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: 현장 사진 업로드 (Firebase Storage 연동) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>3. 시공 사진 (Firebase Storage 업로드)</span>
              </h4>
              <span className="text-[11px] text-stone-400">
                새 사진을 선택하면 Firebase Storage에 자동 업로드됩니다.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 대표 완공사진 (afterImages[0]) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    대표 완공사진 (메인 썸네일)
                  </label>
                  <span className="text-[10px] text-amber-400 font-semibold">afterImages[0]</span>
                </div>

                {existingMainAfterUrl && !mainAfterFile && (
                  <div className="relative h-28 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center group mb-2">
                    <img src={existingMainAfterUrl} alt="기존 대표사진" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                      기존 등록 사진 유지 중
                    </span>
                    <button
                      type="button"
                      onClick={() => setExistingMainAfterUrl("")}
                      className="absolute top-2 right-2 bg-red-950/90 text-red-300 p-1.5 rounded-lg border border-red-800 hover:bg-red-900 transition-colors"
                      title="기존 사진 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setMainAfterFile(file);
                        setMainAfterPhotoName(file.name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {mainAfterFile ? (
                    <div className="space-y-1">
                      <FileCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-bold truncate max-w-xs mx-auto">
                        {mainAfterPhotoName}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {(mainAfterFile.size / 1024 / 1024).toFixed(2)} MB • 변경하려면 클릭
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-stone-400 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-stone-300 font-semibold">
                        {existingMainAfterUrl ? "새 대표사진으로 교체 선택" : "대표 완공사진 파일 선택"}
                      </p>
                      <p className="text-[10px] text-stone-500">JPG, PNG 등 고화질 완공 컷</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 추가 완공사진들 (afterImages[1..]) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    추가 완공사진 (복수 선택 가능)
                  </label>
                  <span className="text-[10px] text-stone-400 font-semibold">afterImages[1..]</span>
                </div>

                {existingAdditionalAfterUrls.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    <span className="text-[10px] text-stone-400 font-semibold block">
                      기존 등록된 추가 사진 ({existingAdditionalAfterUrls.length}장):
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                      {existingAdditionalAfterUrls.map((url, idx) => (
                        <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-stone-800 shrink-0 group">
                          <img src={url} alt={`추가사진 ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setExistingAdditionalAfterUrls(
                                existingAdditionalAfterUrls.filter((_, i) => i !== idx)
                              );
                            }}
                            className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-400 transition-opacity"
                            title="이 사진 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const files: File[] = Array.from(e.target.files);
                        setAdditionalAfterFiles(files);
                        setAdditionalAfterPhotoNames(files.map((f: File) => f.name));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {additionalAfterFiles.length > 0 ? (
                    <div className="space-y-1">
                      <FileCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-bold">
                        신규 {additionalAfterFiles.length}개 파일 선택됨
                      </p>
                      <p className="text-[10px] text-stone-400 truncate max-w-xs mx-auto">
                        {additionalAfterPhotoNames.join(", ")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-stone-400 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-stone-300 font-semibold">
                        추가 완공사진 선택 (다중 선택)
                      </p>
                      <p className="text-[10px] text-stone-500">주방, 욕실, 거실 세부 마감 컷</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 시공 전 사진 (beforeImage) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    시공 전 사진 (Before)
                  </label>
                  <span className="text-[10px] text-stone-400 font-semibold">beforeImage</span>
                </div>

                {existingBeforeUrl && !beforeFile && (
                  <div className="relative h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center group mb-2">
                    <img src={existingBeforeUrl} alt="기존 Before 사진" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold">
                      Before 사진 유지 중
                    </span>
                    <button
                      type="button"
                      onClick={() => setExistingBeforeUrl("")}
                      className="absolute top-2 right-2 bg-red-950/90 text-red-300 p-1.5 rounded-lg border border-red-800 hover:bg-red-900 transition-colors"
                      title="Before 사진 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setBeforeFile(file);
                        setBeforePhotoName(file.name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {beforeFile ? (
                    <div className="space-y-1">
                      <FileCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-bold truncate max-w-xs mx-auto">
                        {beforePhotoName}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {(beforeFile.size / 1024 / 1024).toFixed(2)} MB • 변경하려면 클릭
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-stone-400 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-stone-300 font-semibold">
                        {existingBeforeUrl ? "새 Before 사진으로 교체 선택" : "시공 전 사진 파일 선택"}
                      </p>
                      <p className="text-[10px] text-stone-500">Before/After 비교용 컷</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 시공 과정 사진 (inProgressImage) */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-white">
                    시공 과정 사진 (In-Progress)
                  </label>
                  <span className="text-[10px] text-stone-400 font-semibold">inProgressImage</span>
                </div>

                {existingInProgressUrl && !inProgressFile && (
                  <div className="relative h-24 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center group mb-2">
                    <img src={existingInProgressUrl} alt="기존 공정 사진" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 text-purple-300 text-[10px] px-2 py-0.5 rounded font-bold">
                      공정 사진 유지 중
                    </span>
                    <button
                      type="button"
                      onClick={() => setExistingInProgressUrl("")}
                      className="absolute top-2 right-2 bg-red-950/90 text-red-300 p-1.5 rounded-lg border border-red-800 hover:bg-red-900 transition-colors"
                      title="공정 사진 제거"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="border-2 border-dashed border-stone-800 hover:border-amber-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors relative group">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setInProgressFile(file);
                        setInProgressPhotoName(file.name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {inProgressFile ? (
                    <div className="space-y-1">
                      <FileCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-xs text-emerald-300 font-bold truncate max-w-xs mx-auto">
                        {inProgressPhotoName}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {(inProgressFile.size / 1024 / 1024).toFixed(2)} MB • 변경하려면 클릭
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-stone-400 mx-auto group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-stone-300 font-semibold">
                        {existingInProgressUrl ? "새 공정 사진으로 교체 선택" : "기초/목공 공정 사진 파일 선택"}
                      </p>
                      <p className="text-[10px] text-stone-500">단열/배관/목공 공정 사진</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: 샘플 여부 설정 */}
          <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label htmlFor="sample-checkbox" className="text-xs font-bold text-white cursor-pointer">
                [샘플 프로젝트]로 표시
              </label>
              <p className="text-[11px] text-stone-400">
                체크 해제 시 한신인테리어의 공인 <strong>[실제 시공사례]</strong> 뱃지가 부여됩니다.
              </p>
            </div>
            <input
              id="sample-checkbox"
              type="checkbox"
              checked={isSample}
              onChange={(e) => setIsSample(e.target.checked)}
              disabled={isSubmitting}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Submit Button & Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                    <span>{uploadProgressText || "처리 중..."}</span>
                  </>
                ) : editingProjectId ? (
                  <>
                    <Edit3 className="w-5 h-5" />
                    <span>시공사례 수정 저장</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-5 h-5" />
                    <span>시공사례 및 사진 일괄 등록하기</span>
                  </>
                )}
              </button>

              {editingProjectId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="py-4 px-6 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-2xl text-sm transition-all border border-stone-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4 text-stone-400" />
                  <span>수정 취소</span>
                </button>
              )}
            </div>

            {isSubmitting && uploadProgressText && (
              <p className="text-center text-xs text-amber-400 font-medium animate-pulse">
                {uploadProgressText}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Firestore Realtime Registered Projects List with Edit/Delete Controls */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Firestore & Storage 실시간 등록 프로젝트 목록 ({firestoreProjects.length}건)</span>
            </h3>
            <p className="text-xs text-stone-400">
              관리자 폼을 통해 Firestore <code className="text-amber-300 font-mono">projects</code> 및 Storage에 실시간 동기화된 프로젝트입니다. (수정/삭제 가능)
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>실시간 동기화 중 (onSnapshot)</span>
          </span>
        </div>

        {firestoreLoading ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-400" />
            <p className="text-xs">Firestore 프로젝트 데이터를 동기화하는 중입니다...</p>
          </div>
        ) : firestoreProjects.length === 0 ? (
          <div className="py-12 px-4 bg-stone-950 border border-stone-800 rounded-2xl text-center space-y-2">
            <FolderPlus className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-sm font-bold text-stone-300">
              아직 등록된 시공사례가 없습니다.
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              위의 양식을 작성하고 사진을 선택하여 등록 버튼을 누르면 실시간으로 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {firestoreProjects.map((proj) => (
              <div
                key={proj.id}
                className={`p-5 bg-stone-950 border rounded-2xl space-y-3.5 flex flex-col justify-between transition-all ${
                  editingProjectId === proj.id
                    ? "border-amber-500 ring-2 ring-amber-500/30 bg-stone-900"
                    : "border-stone-800 hover:border-stone-700"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Photo Thumbnail */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center">
                    {proj.afterImages && proj.afterImages.length > 0 && proj.afterImages[0] ? (
                      <img
                        src={proj.afterImages[0]}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center text-stone-600 p-4 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                        <span className="text-[10px] block">완공 사진 미등록</span>
                      </div>
                    )}
                    <span
                      className={`absolute top-2 left-2 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow ${
                        proj.isSample
                          ? "bg-amber-500 text-stone-950"
                          : "bg-emerald-500 text-white"
                      }`}
                    >
                      {proj.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-stone-900/90 text-amber-300 text-[10px] px-2 py-0.5 rounded-lg border border-stone-800 font-semibold backdrop-blur-sm">
                      {proj.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white font-sans line-clamp-1 break-keep">
                      {proj.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{proj.location}</span>
                      <span>•</span>
                      <span>{proj.area}</span>
                      <span>•</span>
                      <span>{proj.duration}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Photo badges */}
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 pt-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-stone-900 rounded-md border border-stone-800">
                      완공 사진 {proj.afterImages ? proj.afterImages.filter(Boolean).length : 0}장
                    </span>
                    {proj.beforeImage && (
                      <span className="px-2 py-0.5 bg-stone-900 rounded-md border border-stone-800 text-amber-300">
                        Before 등록
                      </span>
                    )}
                    {proj.inProgressImage && (
                      <span className="px-2 py-0.5 bg-stone-900 rounded-md border border-stone-800 text-purple-300">
                        공정 등록
                      </span>
                    )}
                  </div>

                  {/* SEO Slug URL badge */}
                  {(() => {
                    const activeSlug =
                      proj.slug ||
                      (proj.id === "wkv0to3v3LYzluyUtBU2"
                        ? "busan-sajik-villa-remodeling"
                        : proj.id);
                    return (
                      <div className="bg-stone-900/90 border border-stone-800/90 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-stone-300 truncate">
                          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate text-[11px] text-amber-200">/projects/{activeSlug}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyUrl(activeSlug)}
                            className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
                            title="정규 URL 복사"
                          >
                            {copiedSlug === activeSlug ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`/projects/${activeSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-800 transition-colors"
                            title="새 창에서 보기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Action Bar: Edit & Delete */}
                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-stone-500 truncate">
                    ID: {proj.id.slice(0, 8)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(proj)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 rounded-xl border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>수정</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(proj)}
                      disabled={isSubmitting || isDeleting}
                      className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-300 hover:text-red-100 rounded-xl border border-red-800/60 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Built-in Base Projects List (Protected - Read Only) */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>기본 탑재 포트폴리오 목록 ({PROJECTS_DATA.length}건)</span>
            </h3>
            <p className="text-xs text-stone-400">
              사직동 실제 시공사례 및 기본 카탈로그 데이터입니다. (코드 원본 보호 — 수정/삭제 불가)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECTS_DATA.map((proj) => (
            <div
              key={proj.id}
              className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-3 flex flex-col justify-between opacity-85"
            >
              <div className="space-y-2">
                <div className="relative h-36 rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                  <img
                    src={proj.afterImages[0]}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <span
                    className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-md shadow ${
                      proj.isSample ? "bg-amber-500 text-stone-950" : "bg-emerald-500 text-white"
                    }`}
                  >
                    {proj.isSample ? "샘플 프로젝트" : "실제 시공사례"}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-amber-300 text-[10px] px-2 py-0.5 rounded font-semibold backdrop-blur-sm">
                    {proj.category}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-sans line-clamp-1 break-keep">
                    {proj.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{proj.location}</span>
                    <span>•</span>
                    <span>{proj.area}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* SEO Slug URL badge */}
                {(() => {
                  const activeSlug =
                    proj.slug ||
                    (proj.id === "wkv0to3v3LYzluyUtBU2"
                      ? "busan-sajik-villa-remodeling"
                      : proj.id);
                  return (
                    <div className="bg-stone-900/90 border border-stone-800/90 p-2 rounded-xl flex items-center justify-between gap-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-stone-300 truncate">
                        <Globe className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate text-amber-200">/projects/{activeSlug}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(activeSlug)}
                          className="p-1 text-stone-400 hover:text-stone-100 rounded hover:bg-stone-800 transition-colors"
                          title="정규 URL 복사"
                        >
                          {copiedSlug === activeSlug ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`/projects/${activeSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-800 transition-colors"
                          title="새 창에서 보기"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-2 border-t border-stone-900 flex items-center justify-between text-[11px] text-stone-500">
                <span>공기: {proj.duration}</span>
                <span className="text-[10px] text-stone-500 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                  기본 탑재 (보호됨)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* React State Deletion Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white font-sans break-keep">시공사례 영구 삭제</h3>
                <p className="text-xs text-stone-400">
                  선택하신 시공사례를 데이터베이스 및 Storage에서 삭제합니다.
                </p>
              </div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{projectToDelete.location || "부산"}</span>
                <span>•</span>
                <span className="text-stone-300">{projectToDelete.category}</span>
              </div>
              <h4 className="text-sm font-bold text-white leading-snug">
                {projectToDelete.title}
              </h4>
              <p className="text-xs text-stone-400 pt-1">
                이 시공사례와 연결된 Storage 사진 및 Firestore 데이터를 모두 삭제하시겠습니까?
              </p>
              <p className="text-[11px] text-red-400 font-medium pt-0.5">
                ※ 삭제된 프로젝트와 업로드된 사진은 복구할 수 없습니다.
              </p>
            </div>

            {deleteModalError && (
              <div className="p-3.5 bg-red-950/80 border border-red-700 text-red-200 rounded-xl flex items-start gap-2.5 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{deleteModalError}</div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setProjectToDelete(null);
                    setDeleteModalError(null);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs sm:text-sm border border-stone-700 transition-all cursor-pointer disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>삭제 중...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>삭제하기</span>
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
