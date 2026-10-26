import React, { useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import {
  AlertTriangle,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileImage,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Ruler,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { db } from "../firebase";
import { SITE_CONFIG } from "../config/siteConfig";
import { CUSTOMER_WORK_ITEMS, getCustomerPriceReference, validateCustomerConditions } from "../../shared/customerEstimate";
import { MetaManager } from "../components/seo/MetaManager";
import { AIEstimateInput, AIEstimateResult, NavigationMenu } from "../types";

type UploadedAttachment = {
  path: string;
  name: string;
  mimeType: string;
  size: number;
  kind: "photo" | "floorplan";
};

type GenePlanConfidence = "high" | "medium" | "low" | string;

type GenePlanDraft = {
  version?: string;
  spaces?: Array<{
    spaceName?: string;
    spaceType?: string;
    evidence?: string;
    confidence?: GenePlanConfidence;
    needsMeasurement?: boolean;
  }>;
  objects?: Array<{
    objectType?: string;
    label?: string;
    spaceName?: string;
    evidence?: string;
    confidence?: GenePlanConfidence;
    needsMeasurement?: boolean;
  }>;
  tradeCandidates?: Array<{
    trade?: string;
    reason?: string;
    confidence?: GenePlanConfidence;
  }>;
  measurementChecks?: string[];
  conflicts?: string[];
  sourceSummary?: string;
};

type VisualEstimateResult = AIEstimateResult & {
  visualFindings?: string[];
  floorplanNotes?: string[];
  genePlanDraft?: GenePlanDraft;
  pricing?: ReturnType<typeof getCustomerPriceReference>;
};

interface AIEstimateContractPageProps {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModalWithData?: (data: {
    spaceType: string;
    location: string;
    area: string;
    details: string;
  }) => void;
}

const SESSION_ID_KEY = "gene_conversion_session_id";
const MAX_PHOTOS = 4;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function validateFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "JPG, PNG, WEBP 또는 PDF 파일만 사용할 수 있습니다.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "파일당 최대 4MB까지 업로드할 수 있습니다.";
  }
  return null;
}

export const AIEstimateContractPage: React.FC<AIEstimateContractPageProps> = () => {
  const [formInput, setFormInput] = useState<AIEstimateInput>({
    spaceType: "아파트",
    location: "",
    area: "30",
    scope: "전체공사",
    startDate: "1개월 이내",
    budget: "3,000만 원 ~ 5,000만 원",
    style: "모던 미니멀",
    details: "",
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [analyzedInput, setAnalyzedInput] = useState<(AIEstimateInput & { selectedItems: string[] }) | null>(null);
  const [materialConsent, setMaterialConsent] = useState(false);
  const [notificationDelayed, setNotificationDelayed] = useState(false);
  const analysisInFlight = useRef(false);
  const leadInFlight = useRef(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [floorplan, setFloorplan] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedAttachment[]>([]);
  const [result, setResult] = useState<VisualEstimateResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [uploadingLabel, setUploadingLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "" });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  const selectedFileCount = photos.length + (floorplan ? 1 : 0);
  const hasVisualMaterial = selectedFileCount > 0;

  const uploadSummary = useMemo(() => {
    if (!selectedFileCount) return "사진이나 평면도가 없어도 기본 예상견적을 확인할 수 있습니다.";
    const items: string[] = [];
    if (photos.length) items.push(`현장사진 ${photos.length}장`);
    if (floorplan) items.push("평면도 1개");
    return `${items.join(" + ")}를 AI 진단에 반영합니다.`;
  }, [photos.length, floorplan, selectedFileCount]);

  const resetAnalysisAfterFileChange = () => {
    setUploaded([]);
    setResult(null);
    setAnalyzedInput(null);
    setShowLeadForm(false);
    setLeadSuccess(false);
    setError(null);
  };

  const updateInput = (next: AIEstimateInput) => {
    setFormInput(next);
    setResult(null);
    setAnalyzedInput(null);
    setShowLeadForm(false);
    setLeadSuccess(false);
    setError(null);
  };

  const handlePhotoSelect = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).slice(0, MAX_PHOTOS);
    for (const file of picked) {
      const message = validateFile(file);
      if (message) {
        setError(`${file.name}: ${message}`);
        return;
      }
    }
    setPhotos(picked);
    resetAnalysisAfterFileChange();
  };

  const handleFloorplanSelect = (file: File | null) => {
    if (!file) {
      setFloorplan(null);
      resetAnalysisAfterFileChange();
      return;
    }
    const message = validateFile(file);
    if (message) {
      setError(`${file.name}: ${message}`);
      return;
    }
    setFloorplan(file);
    resetAnalysisAfterFileChange();
  };

  const uploadFile = async (file: File, kind: "photo" | "floorplan") => {
    const sessionId = getSessionId();
    const response = await fetch("/api/upload-ai-estimate-file", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "X-Session-Id": sessionId,
        "X-File-Kind": kind,
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: file,
    });
    const json = await response.json();
    if (!response.ok || !json.success || !json.file) {
      throw new Error(json.error || `${file.name} 업로드에 실패했습니다.`);
    }
    return json.file as UploadedAttachment;
  };

  const ensureUploads = async () => {
    if (!hasVisualMaterial) return [] as UploadedAttachment[];
    if (uploaded.length === selectedFileCount) return uploaded;

    const filesToUpload = [
      ...photos.map((file) => ({ file, kind: "photo" as const })),
      ...(floorplan ? [{ file: floorplan, kind: "floorplan" as const }] : []),
    ];

    const saved: UploadedAttachment[] = [];
    for (let index = 0; index < filesToUpload.length; index += 1) {
      const item = filesToUpload[index];
      setUploadingLabel(`첨부자료 업로드 ${index + 1}/${filesToUpload.length}`);
      saved.push(await uploadFile(item.file, item.kind));
    }
    setUploaded(saved);
    setUploadingLabel("");
    return saved;
  };

  const handleAnalyze = async (event: React.FormEvent) => {
    event.preventDefault();
    if (analysisInFlight.current) return;
    analysisInFlight.current = true;
    setError(null);
    setResult(null);
    setAnalyzedInput(null);
    setShowLeadForm(false);
    setAnalysisLoading(true);
    setLeadSuccess(false);

    try {
      if (!formInput.location.trim()) {
        throw new Error("공사 지역을 입력해 주세요.");
      }

      const conditions = { ...formInput, selectedItems: [...selectedItems] };
      const invalid = validateCustomerConditions(conditions);
      if (invalid) throw new Error(invalid);
      if (hasVisualMaterial && !materialConsent) {
        throw new Error("첨부자료 저장 및 AI 분석에 동의해 주세요. 자료 없이도 예상 금액을 확인할 수 있습니다.");
      }
      const attachments = await ensureUploads();
      const response = await fetch("/api/ai-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          ...conditions,
          sessionId: getSessionId(),
          attachments,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.error || "AI 예상 견적 분석에 실패했습니다.");
      }
      setResult(json.data as VisualEstimateResult);
      setAnalyzedInput(conditions);
      setShowLeadForm(false);
    } catch (err: any) {
      setError(err?.message || "AI 분석 중 오류가 발생했습니다.");
    } finally {
      setUploadingLabel("");
      setAnalysisLoading(false);
      analysisInFlight.current = false;
    }
  };

  const notifyAdmin = async (docPath: string, details: string, conditions: AIEstimateInput) => {
    const payload = {
      name: leadForm.name.trim(),
      phone: leadForm.phone.trim(),
      location: conditions.location.trim(),
      spaceType: conditions.spaceType,
      area: conditions.area.trim(),
      startDate: conditions.startDate.trim(),
      details,
      docPath,
      createdAt: new Date().toLocaleString("ko-KR"),
    };

    try {
      const response = await fetch("/api/notify-kakao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      const json = await response.json();
      return response.ok && json.success === true;
    } catch {
      return false;
    }
  };

  const handleLeadSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (leadInFlight.current || leadSuccess) return;
    if (!result || !analyzedInput) {
      setError("먼저 AI 예상 견적을 확인해 주세요.");
      return;
    }
    if (!leadForm.name.trim() || !leadForm.phone.trim()) {
      setError("이름과 연락처를 입력해 주세요.");
      return;
    }
    if (!/^(?:0\d{8,10}|050\d{8,9})$/.test(leadForm.phone.replace(/[-\s]/g, ""))) {
      setError("연락 가능한 전화번호를 확인해 주세요.");
      return;
    }
    if (!privacyAgreed) {
      setError("개인정보 및 첨부자료 수집·이용에 동의해 주세요.");
      return;
    }

    leadInFlight.current = true;
    setLeadLoading(true);
    setNotificationDelayed(false);
    try {
      const sessionId = getSessionId();
      const details = `${analyzedInput.scope} / 선택항목: ${analyzedInput.selectedItems.join(", ") || "전체 리모델링"} / ${analyzedInput.style} 스타일 / 참고 예상 비용 (${result.costRange}) / 추가요청: ${analyzedInput.details || "없음"}`;
      const hasStructuredDraft = Boolean(result.genePlanDraft);
      const consultationData = {
        name: leadForm.name.trim(),
        phone: leadForm.phone.trim(),
        location: analyzedInput.location.trim(),
        spaceType: analyzedInput.spaceType,
        area: analyzedInput.area.trim(),
        startDate: analyzedInput.startDate.trim(),
        details,
        status: "new",
        source: "ai-estimate",
        sessionId,
        attachmentPaths: uploaded.map((item) => item.path),
        attachmentNames: uploaded.map((item) => item.name),
        attachmentKinds: uploaded.map((item) => item.kind),
        genePlanStatus:
          uploaded.length && hasStructuredDraft
            ? "structured_review_ready"
            : uploaded.length
            ? "ready_for_review"
            : "no_attachment",
        genePlanDraftVersion: result.genePlanDraft?.version || null,
        genePlanDraft: result.genePlanDraft || null,
        estimateConditions: analyzedInput,
        selectedItems: analyzedInput.selectedItems,
        aiEstimateVersion: "contract-mvp-2026-10-26",
        aiEstimateSnapshot: {
          costRange: result.costRange,
          pricing: result.pricing || null,
          durationRange: result.durationRange,
          visualFindings: (result.visualFindings || []).slice(0, 10),
          floorplanNotes: (result.floorplanNotes || []).slice(0, 10),
        },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "consultations"), consultationData);
      setLeadSuccess(true);
      const notified = await notifyAdmin(docRef.path, details, analyzedInput);
      setNotificationDelayed(!notified);
    } catch (err: any) {
      setError(err?.message || "상담 신청 저장 중 오류가 발생했습니다.");
    } finally {
      setLeadLoading(false);
      leadInFlight.current = false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 sm:py-14 space-y-8 font-sans">
      <MetaManager
        title="인테리어 간편 예상견적｜지니 인테리어"
        description="공간 유형과 평수, 공사 범위를 입력해 인테리어 예상 비용을 확인하고 현장 실측 상담을 신청하세요. 사진과 평면도는 선택사항입니다."
        canonicalPath="/ai-estimate"
      />

      <section className="rounded-[2rem] bg-stone-950 text-white px-6 py-9 sm:px-10 sm:py-12 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-amber-400/10" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4" /> 지니 인테리어 간편 예상견적
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight break-keep">
            우리집 공사비, 먼저 확인해 보세요.
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-7 break-keep">
            공간 유형·평수·공사 범위를 입력하면 참고용 예상 금액을 안내합니다. 사진이나 도면 없이도 이용할 수 있으며, 실제 견적은 현장 실측과 자재 선택 후 확정됩니다.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span role="alert">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        <form onSubmit={handleAnalyze} className="lg:col-span-5 rounded-3xl border border-stone-200 bg-white p-5 sm:p-7 shadow-sm space-y-5">
          <fieldset disabled={analysisLoading || leadLoading} className="space-y-5 min-w-0">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-black text-lg">
              <Calculator className="w-5 h-5 text-amber-600" /> 우리집 조건 입력
            </div>
            <p className="text-xs text-stone-500 mt-1">① 조건 입력 → ② 예상 금액 확인 → ③ 실측 상담 신청</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-bold text-stone-700">
              공간 유형
              <select value={formInput.spaceType} onChange={(e) => updateInput({ ...formInput, spaceType: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-900 outline-none focus:border-amber-500">
                {['아파트','빌라','주택','상가','사무실','학교·교육시설','기타'].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="space-y-1.5 text-xs font-bold text-stone-700">
              면적(평)
              <input type="number" min="1" max="300" required value={formInput.area} onChange={(e) => updateInput({ ...formInput, area: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500" />
            </label>
          </div>

          <label className="space-y-1.5 text-xs font-bold text-stone-700 block">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> 공사 지역</span>
            <input required placeholder="예: 부산 동래구 명륜동" value={formInput.location} onChange={(e) => updateInput({ ...formInput, location: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500" />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['전체공사','부분공사'] as const).map((scope) => (
              <button key={scope} type="button" onClick={() => updateInput({ ...formInput, scope })} className={`rounded-xl border px-3 py-3 text-xs font-extrabold ${formInput.scope === scope ? 'border-stone-900 bg-stone-900 text-amber-300' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                {scope === '전체공사' ? '전체 리모델링' : '부분 공사'}
              </button>
            ))}
          </div>

          {formInput.scope === "부분공사" && (
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-stone-700">공사 항목 · 여러 개 선택 가능</legend>
              <div className="grid grid-cols-3 gap-2">
                {CUSTOMER_WORK_ITEMS.map((item) => (
                  <label key={item} className="flex items-center gap-1.5 rounded-xl border border-stone-200 p-2 text-xs text-stone-700">
                    <input type="checkbox" checked={selectedItems.includes(item)} onChange={() => {
                      setSelectedItems((prev) => prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]);
                      updateInput({ ...formInput });
                    }} />{item}
                  </label>
                ))}
              </div>
              <p className="text-xs text-stone-500">부분공사는 실제 시공 면적·수량을 확인한 뒤 금액을 안내합니다.</p>
            </fieldset>
          )}

          <details className="rounded-xl border border-stone-200 p-3">
            <summary className="cursor-pointer text-sm font-bold text-stone-700">추가 조건 · 선택</summary>
            <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-bold text-stone-700">
              희망 시작일
              <input value={formInput.startDate} onChange={(e) => updateInput({ ...formInput, startDate: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500" />
            </label>
            <label className="space-y-1.5 text-xs font-bold text-stone-700">
              예상 예산
              <input value={formInput.budget} onChange={(e) => updateInput({ ...formInput, budget: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500" />
            </label>
          </div>

          <label className="space-y-1.5 text-xs font-bold text-stone-700 block">
            원하는 분위기
            <select value={formInput.style} onChange={(e) => updateInput({ ...formInput, style: e.target.value })} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500">
              {['모던 미니멀','화이트·우드','내추럴 우드','미드센추리','클래식','상담 후 결정'].map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>

          <label className="space-y-1.5 text-xs font-bold text-stone-700 block">
            추가 요청사항
            <textarea rows={3} placeholder="예: 샤시 교체, 욕실 2개, 주방 전체 교체 희망" value={formInput.details} onChange={(e) => updateInput({ ...formInput, details: e.target.value })} className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-amber-500" />
          </label>

            </div>
          </details>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
            <div className="flex items-center gap-2 font-black text-sm text-stone-900"><ImagePlus className="w-4 h-4 text-amber-600" /> 현장 자료 첨부 · 선택</div>
            <label className="block cursor-pointer rounded-xl border border-dashed border-stone-300 bg-white p-4 hover:border-amber-500 transition-colors">
              <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoSelect(e.target.files)} />
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-stone-500" />
                <div><div className="text-xs font-extrabold text-stone-800">현장사진 최대 4장</div><div className="text-[11px] text-stone-500">JPG·PNG·WEBP / 파일당 4MB 이하</div></div>
              </div>
            </label>
            <label className="block cursor-pointer rounded-xl border border-dashed border-stone-300 bg-white p-4 hover:border-amber-500 transition-colors">
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => handleFloorplanSelect(e.target.files?.[0] || null)} />
              <div className="flex items-center gap-3">
                <FileImage className="w-5 h-5 text-stone-500" />
                <div><div className="text-xs font-extrabold text-stone-800">평면도 1개</div><div className="text-[11px] text-stone-500">이미지 또는 PDF / 치수 포함 도면 권장</div></div>
              </div>
            </label>

            {(photos.length > 0 || floorplan) && (
              <div className="space-y-1.5">
                {photos.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-[11px] border border-stone-200">
                    <span className="truncate">사진 {index + 1}. {file.name} · {formatFileSize(file.size)}</span>
                    <button type="button" onClick={() => { setPhotos((prev) => prev.filter((_, i) => i !== index)); resetAnalysisAfterFileChange(); }} className="text-stone-400 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {floorplan && (
                  <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-[11px] border border-stone-200">
                    <span className="truncate">평면도. {floorplan.name} · {formatFileSize(floorplan.size)}</span>
                    <button type="button" onClick={() => handleFloorplanSelect(null)} className="text-stone-400 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
            )}
            <p className="text-[11px] text-stone-600">{uploadSummary}</p>
            {hasVisualMaterial && <label className="flex items-start gap-2 text-xs text-stone-600 leading-5">
              <input type="checkbox" checked={materialConsent} onChange={(event) => setMaterialConsent(event.target.checked)} className="mt-1" />
              <span>첨부자료를 상담 검토를 위해 저장하고 외부 AI 서비스로 분석하는 데 동의합니다. 이름·연락처 등 불필요한 개인정보는 가려 주세요.</span>
            </label>}
          </div>

          <button type="submit" disabled={analysisLoading} className="w-full rounded-xl bg-stone-950 px-4 py-4 text-sm font-black text-amber-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            {uploadingLabel || (analysisLoading ? '예상 견적 확인 중' : '예상 금액 확인하기')}
          </button>
          </fieldset>
        </form>

        <section className="lg:col-span-7 space-y-5">
          {!result ? (
            <div className="rounded-3xl border border-stone-200 bg-white p-7 sm:p-10 min-h-[420px] flex items-center justify-center text-center shadow-sm">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center"><Building2 className="w-7 h-7 text-stone-500" /></div>
                <h2 className="text-xl font-black text-stone-900">우리집 조건을 입력해 주세요.</h2>
                <p className="text-sm text-stone-500 leading-6">주거 전체 리모델링은 면적 기준의 참고 금액을 안내합니다. 부분공사·비주거 공간은 필요한 항목을 정리한 후 개별 상담으로 금액을 안내합니다.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-stone-700" role="status">
                <div className="font-bold">{analyzedInput?.location} · {analyzedInput?.spaceType} · {analyzedInput?.area}평 · {analyzedInput?.scope}</div>
                <p className="mt-2 text-xs leading-5">{result.pricing?.basis}</p>
                <p className="mt-1 text-xs leading-5">포함 여부 확인: {result.pricing?.checks.join(" / ")}. 선택 자재와 현장 상태에 따라 달라집니다.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-stone-950 text-white p-6">
                  <WalletCards className="w-5 h-5 text-amber-300 mb-3" />
                  <div className="text-xs text-stone-400">예상 공사비 범위</div>
                  <div className="text-lg font-black mt-1 leading-7">{result.costRange}</div>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-white p-6">
                  <Clock3 className="w-5 h-5 text-amber-600 mb-3" />
                  <div className="text-xs text-stone-500">예상 공사기간</div>
                  <div className="text-xl font-black mt-1 text-stone-900">{result.durationRange}</div>
                </div>
              </div>

              {(result.visualFindings || []).length > 0 && (
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <h3 className="font-black text-stone-900 flex items-center gap-2"><FileImage className="w-5 h-5 text-amber-600" /> 사진에서 확인된 항목</h3>
                  <div className="mt-4 space-y-2">{result.visualFindings?.map((item, index) => <div key={index} className="flex gap-2 text-sm text-stone-600 leading-6"><CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />{item}</div>)}</div>
                </div>
              )}

              {(result.floorplanNotes || []).length > 0 && (
                <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                  <h3 className="font-black text-stone-900 flex items-center gap-2"><Ruler className="w-5 h-5 text-amber-600" /> 평면도 확인사항</h3>
                  <div className="mt-4 space-y-2">{result.floorplanNotes?.map((item, index) => <div key={index} className="flex gap-2 text-sm text-stone-600 leading-6"><ClipboardCheck className="w-4 h-4 text-blue-600 mt-1 shrink-0" />{item}</div>)}</div>
                </div>
              )}

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <h3 className="font-black text-stone-900 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-600" /> 예상 공사 범위</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">{result.estimatedScope.map((item, index) => <div key={index} className="rounded-xl bg-stone-50 border border-stone-100 px-3 py-3 text-xs font-semibold text-stone-700">{item}</div>)}</div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <h3 className="font-black text-stone-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-700" /> 추가금 방지 체크</h3>
                <div className="mt-4 space-y-2">{result.expertTips.map((item, index) => <div key={index} className="text-sm text-stone-700 leading-6">• {item}</div>)}</div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
                <p className="text-sm text-stone-600 leading-6">{result.summaryMessage}</p>
                {!showLeadForm && !leadSuccess && (
                  <button type="button" onClick={() => setShowLeadForm(true)} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-4 text-sm font-black text-stone-950 flex items-center justify-center gap-2">
                    <Ruler className="w-4 h-4" /> 현장 실측 상담 신청
                  </button>
                )}

                {showLeadForm && !leadSuccess && (
                  <form onSubmit={handleLeadSubmit} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5 space-y-3">
                    <div className="font-black text-stone-900 flex items-center gap-2"><UserRound className="w-4 h-4 text-amber-600" /> 실측 상담 접수</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input required aria-label="이름" autoComplete="name" maxLength={50} placeholder="이름" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-500" />
                      <input required aria-label="연락처" autoComplete="tel" maxLength={20} type="tel" placeholder="연락처" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="rounded-xl border border-stone-200 bg-white px-3 py-3 text-sm outline-none focus:border-amber-500" />
                    </div>
                    <label className="flex items-start gap-2 text-[11px] text-stone-600 leading-5 cursor-pointer">
                      <input type="checkbox" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="mt-1" />
                      <span>상담 및 현장 확인을 위한 개인정보와 첨부자료 수집·이용에 동의합니다. 첨부자료는 상담 및 공사 검토 목적으로 사용됩니다.</span>
                    </label>
                    <button type="submit" disabled={leadLoading} className="w-full rounded-xl bg-stone-950 px-4 py-3.5 text-sm font-black text-amber-300 disabled:opacity-50 flex items-center justify-center gap-2">
                      {leadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 상담 접수하기
                    </button>
                  </form>
                )}

                {leadSuccess && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                    <div className="font-black text-emerald-800">실측 상담 신청이 접수되었습니다.</div>
                    <p className="text-xs text-emerald-700 mt-1">입력한 조건과 예상 금액을 함께 접수했습니다. 담당자가 확인 후 연락드립니다.</p>
                    {notificationDelayed && <p className="text-xs text-emerald-800 mt-2">담당자 알림 확인이 지연되고 있습니다. 상담은 저장되었으니 다시 접수하지 않으셔도 됩니다.</p>}
                  </div>
                )}
                <a href={`tel:${SITE_CONFIG.company.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-stone-800">
                  <Phone className="w-4 h-4" /> 전화로 상담하기
                </a>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          [ShieldCheck, '확정견적 아님', '표시 금액은 참고 범위이며 실제 견적은 현장 실측과 자재 선택 후 확정합니다.'],
          [Ruler, '사진 없이 간편하게', '기본 조건만 입력해 확인하고, 필요하면 사진·평면도를 추가할 수 있습니다.'],
          [FileText, '누락 항목 우선 확인', '철거·보양·방수·전기·설비 등 추가금이 생기기 쉬운 항목을 먼저 점검합니다.'],
        ].map(([Icon, title, desc]: any) => (
          <div key={title} className="rounded-2xl border border-stone-200 bg-white p-5">
            <Icon className="w-5 h-5 text-amber-600" />
            <div className="font-black text-sm text-stone-900 mt-3">{title}</div>
            <p className="text-xs text-stone-500 leading-5 mt-1">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AIEstimateContractPage;
