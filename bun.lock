import React, { useState } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import {
  Phone,
  Send,
  Upload,
  CheckCircle,
  MapPin,
  ExternalLink,
  Clock,
  ShieldCheck,
  Building,
  Image as ImageIcon,
} from "lucide-react";

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

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setPhotos(selectedFiles);

      const previews = selectedFiles.map((file) => URL.createObjectURL(file as Blob));
      setPhotoPreviews(previews);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                    setPhotoPreviews([]);
                    setPhotos([]);
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

              {/* Photo Upload with live preview */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  사진 첨부 (현장 사진 또는 원하는 스타일)
                </label>
                <div className="border-2 border-dashed border-stone-200 bg-stone-50 p-4 rounded-2xl text-center hover:border-amber-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="contact-photo-upload"
                  />
                  <label htmlFor="contact-photo-upload" className="cursor-pointer block space-y-2">
                    <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                    <p className="text-xs text-stone-600 font-semibold">
                      클릭하여 사진 선택 (여러 장 첨부 가능)
                    </p>
                  </label>
                </div>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-3">
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} className="h-20 rounded-xl overflow-hidden border border-stone-200 relative">
                        <img src={src} alt="미리보기" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-2xl text-base transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  <span>견적 상담 신청</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
