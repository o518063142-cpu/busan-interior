import React, { useState, useEffect } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import {
  X,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";
import { db, firebaseProjectId, firebaseDatabaseId } from "../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledData?: {
    spaceType?: string;
    location?: string;
    area?: string;
    details?: string;
  };
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  prefilledData,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: prefilledData?.location || "부산진구 전포동",
    spaceType: prefilledData?.spaceType || "아파트",
    area: prefilledData?.area || "30",
    startDate: "가장 빠른 일자",
    details: prefilledData?.details || "",
  });

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedDocPath, setSavedDocPath] = useState<string | null>(null);

  // Sync prefilled data if updated while modal is open
  useEffect(() => {
    if (prefilledData && isOpen) {
      setFormData((prev) => ({
        ...prev,
        location: prefilledData.location || prev.location,
        spaceType: prefilledData.spaceType || prev.spaceType,
        area: prefilledData.area || prev.area,
        details: prefilledData.details || prev.details,
      }));
    }
  }, [prefilledData, isOpen]);

  if (!isOpen) return null;

  // Timeout wrapper helper (15 seconds max for Firestore operation)
  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number = 15000,
    timeoutErrorMessage: string = "요청 시간이 초과되었습니다."
  ): Promise<T> => {
    let timer: any;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(timeoutErrorMessage));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timer);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Privacy Consent
    if (!privacyAgreed) {
      setErrorMessage("개인정보 수집 및 이용 동의에 체크해 주세요.");
      return;
    }

    // 2. Validate Inputs
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("이름과 연락처를 모두 작성해 주세요.");
      return;
    }

    setLoading(true);

    try {
      console.log("1. 상담 신청 시작");

      if (!db) {
        throw new Error("Firebase 초기화 오류: Firestore DB 인스턴스가 존재하지 않습니다.");
      }

      // 1. 상담 document 참조 및 ID 생성
      const consultationRef = doc(collection(db, "consultations"));
      const consultationId = consultationRef.id;
      console.log("2. 상담 ID:", consultationId);

      // 2. Firestore 저장 시작
      console.log("3. Firestore 저장 시작");
      const consultationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        spaceType: formData.spaceType,
        area: formData.area.trim(),
        startDate: formData.startDate.trim(),
        details: formData.details.trim(),
        createdAt: serverTimestamp(),
        status: "new",
      };

      await withTimeout(
        setDoc(consultationRef, consultationData),
        15000,
        "Firestore 저장 오류: 15초 시간 초과"
      );

      // 3. Firestore 저장 성공 및 경로 기록
      console.log("4. Firestore 저장 성공");
      console.log("5. 저장된 문서 경로:", consultationRef.path);
      setSavedDocPath(consultationRef.path);

      // 4. 저장 성공 완료된 후에만 성공 화면 표시
      console.log("6. 상담 신청 성공 화면 표시");
      setSubmitted(true);
    } catch (error: any) {
      console.error("Firestore 저장 실패:", error);
      console.error("Firebase error code:", error?.code);
      console.error("Firebase error message:", error?.message);

      setErrorMessage("상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setLoading(false);
    setErrorMessage(null);
    setSavedDocPath(null);
    setPrivacyAgreed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
              {SITE_CONFIG.company.name} 공식 실측 신청
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
              무료 현장 실측 & 견적 신청
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {/* Error Message Box */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            /* Submission Completed View */
            <div className="text-center py-6 sm:py-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/40 shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white font-serif">
                  실측 상담 신청이 접수되었습니다.
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md mx-auto font-medium">
                  한신인테리어 담당자가 입력하신 연락처로 상담을 안내해 드리겠습니다.
                </p>
              </div>

              {/* Submitted Details Summary */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-left space-y-2 text-stone-300">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800 font-bold text-amber-300">
                  <span>신청 내역 요약</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Firestore 저장 성공</span>
                </div>

                {savedDocPath && (
                  <div className="p-2 bg-stone-900 border border-emerald-500/30 rounded-lg text-[11px] font-mono text-emerald-300 break-all">
                    <strong>문서 경로:</strong> {savedDocPath}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <p>
                    <strong className="text-stone-400">성함:</strong> {formData.name}
                  </p>
                  <p>
                    <strong className="text-stone-400">연락처:</strong> {formData.phone}
                  </p>
                  <p>
                    <strong className="text-stone-400">지역:</strong> {formData.location}
                  </p>
                  <p>
                    <strong className="text-stone-400">유형/면적:</strong> {formData.spaceType} ({formData.area}평)
                  </p>
                </div>

                {/* Firebase Connection Diagnostics info */}
                <div className="pt-2 border-t border-stone-800/80 text-[10px] text-stone-400 font-mono space-y-0.5">
                  <p><strong>Project ID:</strong> {firebaseProjectId}</p>
                  <p><strong>Database ID:</strong> {firebaseDatabaseId}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <a
                  href={`tel:${SITE_CONFIG.company.phone}`}
                  className="w-full min-h-[44px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition-all shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-[0.99] text-center"
                >
                  <Phone className="w-4 h-4 shrink-0 text-white" />
                  <span>📞 지금 바로 전화 상담하기 ({SITE_CONFIG.company.phone})</span>
                </a>

                <button
                  onClick={handleResetAndClose}
                  className="w-full min-h-[44px] py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl transition-all shadow-lg text-xs sm:text-sm"
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            /* Consultation Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    이름 <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    연락처 <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Location & SpaceType */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    공사 지역 <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    placeholder="부산진구 전포동"
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    공간 유형 <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={formData.spaceType}
                    onChange={(e) =>
                      setFormData({ ...formData, spaceType: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  >
                    <option value="아파트">아파트</option>
                    <option value="주택">주택</option>
                    <option value="상가">상가</option>
                    <option value="카페">카페</option>
                    <option value="음식점">음식점</option>
                    <option value="사무실">사무실</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              {/* Area & StartDate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    예상 면적 (평수)
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    placeholder="30"
                    onChange={(e) =>
                      setFormData({ ...formData, area: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-semibold mb-1 text-xs">
                    희망 공사 시작일
                  </label>
                  <input
                    type="text"
                    value={formData.startDate}
                    placeholder="가장 빠른 일자"
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-stone-300 font-semibold mb-1 text-xs">
                  상담 요청 내용
                </label>
                <textarea
                  rows={3}
                  value={formData.details}
                  placeholder="공사 범위(전체/부분) 및 원하시는 스타일, 기타 요구사항을 자유롭게 작성해 주세요."
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none text-xs sm:text-sm"
                />
              </div>

              {/* Privacy Consent Box */}
              <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="privacyAgreed"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 accent-amber-500 w-4 h-4 rounded shrink-0 cursor-pointer"
                  />
                  <label
                    htmlFor="privacyAgreed"
                    className="text-stone-200 cursor-pointer font-medium leading-relaxed select-none"
                  >
                    상담 신청을 위해 이름, 연락처 및 상담 내용을 수집·이용하는 것에 동의합니다.
                    <span className="text-amber-400 font-bold ml-1">(필수)</span>
                  </label>
                </div>

                <div className="pt-2 border-t border-stone-800/80 text-[11px] text-stone-400 space-y-0.5 pl-6">
                  <p>
                    • <strong className="text-stone-300">수집 목적:</strong> 인테리어 상담 및 견적 문의 응대
                  </p>
                  <p>
                    • <strong className="text-stone-300">보유기간:</strong> 상담 목적 달성 후 지체 없이 파기
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading || !privacyAgreed}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                      <span>접수 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>무료 현장 실측 신청하기</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-stone-400 text-center">
                * 현장 방문 및 실측 상담은 부담 없이 100% 무료로 진행됩니다.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
