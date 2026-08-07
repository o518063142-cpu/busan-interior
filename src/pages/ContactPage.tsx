import React, { useState } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import {
  Phone,
  Send,
  CheckCircle,
  MapPin,
  ExternalLink,
  Clock,
  ShieldCheck,
  Building,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { db, firebaseProjectId, firebaseDatabaseId } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ContactPageProps {
  initialData?: {
    spaceType?: string;
    location?: string;
    area?: string;
    details?: string;
  };
}

export const ContactPage: React.FC<ContactPageProps> = ({ initialData }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: initialData?.location || "부산진구 전포동",
    spaceType: initialData?.spaceType || "아파트",
    area: initialData?.area || "30",
    startDate: "가장 빠른 일자",
    details: initialData?.details || "",
  });

  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedDocPath, setSavedDocPath] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!privacyAgreed) {
      setErrorMessage("개인정보 수집 및 이용 동의에 체크해 주세요.");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage("이름과 연락처를 모두 작성해 주세요.");
      return;
    }

    setLoading(true);

    try {
      console.log("1. ContactPage 상담 신청 시작 (busan-interior Firestore)");

      if (!db) {
        throw new Error("Firebase 초기화 오류: Firestore DB 인스턴스가 존재하지 않습니다.");
      }

      // Save document to Firestore consultations collection using addDoc
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

      console.log("=== FIRESTORE DEBUG START ===");
      console.log("Project:", firebaseProjectId);
      console.log("Database:", firebaseDatabaseId);
      console.log("Collection: consultations");
      console.log("Payload:", consultationData);
      console.log("=== FIRESTORE WRITE START ===");

      let docRef;
      try {
        docRef = await addDoc(collection(db, "consultations"), consultationData);
        console.log("=== FIRESTORE WRITE SUCCESS ===");
        console.log("Document ID:", docRef.id);
        console.log("Document Path:", docRef.path);
        console.log("Project:", firebaseProjectId);
      } catch (error: any) {
        console.error("=== FIRESTORE WRITE FAILED ===");
        console.error("Error Code:", error?.code);
        console.error("Error Message:", error?.message);
        console.error("Error Name:", error?.name);
        console.error(error);
        throw error;
      }

      setSavedDocPath(docRef.path);
      setSubmitted(true);

      // Auxiliary Admin Email Notification (does not block client submission success)
      try {
        const notifyRes = await fetch("/api/notify-consultation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            location: formData.location.trim(),
            spaceType: formData.spaceType,
            area: formData.area.trim(),
            startDate: formData.startDate.trim(),
            details: formData.details.trim(),
            docPath: docRef.path,
            createdAt: new Date().toLocaleString("ko-KR"),
          }),
        });
        const notifyData = await notifyRes.json();
        if (notifyData?.success) {
          console.log("EMAIL NOTIFICATION SUCCESS");
        } else {
          console.error("EMAIL NOTIFICATION FAILED");
        }
      } catch (emailErr) {
        console.error("EMAIL NOTIFICATION FAILED");
      }

    } catch (error: any) {
      setSubmitted(false);
      setSavedDocPath(null);
      console.error("REAL FIRESTORE WRITE FAILED:", error);
      setErrorMessage(
        `상담 신청 중 오류가 발생했습니다 (${error?.message || "네트워크 오류"}). 잠시 후 다시 시도해 주세요.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          FREE CONSULTATION
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 font-serif">
          무료 현장 실측 & 견적 문의
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          부산진구 전포동, 서면 및 부산 전 지역 현장 실측 방문을 신청하세요.
          실내건축 면허 전문가가 1:1로 직접 세밀하게 안내해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Quick Actions & Company Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Call & Naver Place Buttons */}
          <div className="bg-stone-900 text-white p-6 rounded-3xl border border-stone-800 space-y-4 shadow-lg">
            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-400" />
              <span>빠른 다이렉트 상담</span>
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              전화상담을 이용하시면 더욱 빠르게 현장 실측 일정을 잡으실 수 있습니다.
            </p>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`tel:${SITE_CONFIG.company.phone}`}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>대표: {SITE_CONFIG.company.phone}</span>
                </a>

                <a
                  href={`tel:${SITE_CONFIG.company.mobilePhone}`}
                  className="flex items-center justify-center gap-2 py-3 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>직통: {SITE_CONFIG.company.mobilePhone}</span>
                </a>
              </div>

              <a
                href={SITE_CONFIG.company.naverPlaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-900 hover:bg-emerald-800 text-emerald-100 font-bold rounded-xl text-xs sm:text-sm transition-all border border-emerald-700/60"
              >
                <span>네이버 플레이스 연결 (위치 및 리뷰)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Location & Details Box */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm text-xs sm:text-sm text-stone-700">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2 border-b border-stone-200 pb-3">
              <Building className="w-5 h-5 text-amber-600" />
              <span>한신인테리어 정보</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>주소:</strong> {SITE_CONFIG.company.address} {SITE_CONFIG.company.addressDetail}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>면허:</strong> {SITE_CONFIG.company.licenseStatus} ({SITE_CONFIG.company.licenseNumber})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>영업시간:</strong> {SITE_CONFIG.company.operatingHours} ({SITE_CONFIG.company.closedDays})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Full Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif">
                견적 상담 신청이 정상 접수되었습니다!
              </h2>
              <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                작성해주신 정보를 바탕으로 한신인테리어 담당자가 빠르게 연락드려 현장 실측 방문 일정을 잡아드리겠습니다.
              </p>

              {savedDocPath && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl max-w-md mx-auto text-xs text-emerald-800 font-mono">
                  <strong>접수 문서 경로:</strong> {savedDocPath}
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: "",
                      phone: "",
                      location: "부산진구 전포동",
                      spaceType: "아파트",
                      area: "30",
                      startDate: "가장 빠른 일자",
                      details: "",
                    });
                  }}
                  className="px-6 py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 transition-colors"
                >
                  새로운 문의 작성
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
              <div className="border-b border-stone-200 pb-3">
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  견적 상담 신청서
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  모든 현장 방문 및 상담은 100% 무료입니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    이름 <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    연락처 <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    공사 지역 <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    placeholder="예: 부산진구 전포동, 서면"
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">공간 유형</label>
                  <select
                    value={formData.spaceType}
                    onChange={(e) => setFormData({ ...formData, spaceType: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">예상 면적 (평수)</label>
                  <input
                    type="number"
                    value={formData.area}
                    placeholder="30"
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">희망 공사일</label>
                  <input
                    type="text"
                    value={formData.startDate}
                    placeholder="가장 빠른 일자"
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">상담 내용</label>
                <textarea
                  rows={4}
                  value={formData.details}
                  placeholder="공사 범위 (전체/부분) 및 원하시는 디자인 스타일, 요청사항을 작성해 주세요."
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Privacy Consent Box */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="contactPrivacyAgreed"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 accent-amber-600 w-4 h-4 rounded shrink-0 cursor-pointer"
                  />
                  <label
                    htmlFor="contactPrivacyAgreed"
                    className="text-stone-700 cursor-pointer font-medium leading-relaxed select-none"
                  >
                    상담 신청을 위해 이름, 연락처 및 상담 내용을 수집·이용하는 것에 동의합니다.
                    <span className="text-amber-600 font-bold ml-1">(필수)</span>
                  </label>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !privacyAgreed}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-2xl text-base transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                      <span>접수 처리 중...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>견적 상담 신청</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
