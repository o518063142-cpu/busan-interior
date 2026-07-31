import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { Consultation, ConsultationStatus } from "../types";
import {
  Lock,
  LogOut,
  Search,
  Phone,
  Calendar,
  MapPin,
  Building,
  Ruler,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  X,
  ChevronRight,
  Filter,
  UserCheck,
  AlertCircle,
  Eye,
  Copy,
  Check,
} from "lucide-react";

// Status metadata for badges and colors
const STATUS_CONFIG: Record<
  ConsultationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: "신규",
    bg: "bg-rose-950/80",
    text: "text-rose-300",
    border: "border-rose-700/60",
  },
  contacted: {
    label: "연락완료",
    bg: "bg-amber-950/80",
    text: "text-amber-300",
    border: "border-amber-700/60",
  },
  site_visit: {
    label: "현장실측",
    bg: "bg-purple-950/80",
    text: "text-purple-300",
    border: "border-purple-700/60",
  },
  estimate: {
    label: "견적발송",
    bg: "bg-blue-950/80",
    text: "text-blue-300",
    border: "border-blue-700/60",
  },
  contract: {
    label: "계약",
    bg: "bg-emerald-950/80",
    text: "text-emerald-300",
    border: "border-emerald-700/60",
  },
  completed: {
    label: "공사완료",
    bg: "bg-stone-800",
    text: "text-stone-300",
    border: "border-stone-700",
  },
};

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Consultations state
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Consultation Detail Modal
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Copy notification state
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch consultations when user is authenticated
  useEffect(() => {
    if (!user) {
      setConsultations([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setDataError(null);

    const q = query(
      collection(db, "consultations"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Consultation[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || "이름 없음",
            phone: data.phone || "",
            location: data.location || "",
            spaceType: data.spaceType || "",
            area: data.area || "",
            startDate: data.startDate || "",
            details: data.details || "",
            photoUrls: data.photoUrls || [],
            createdAt: data.createdAt,
            status: (data.status as ConsultationStatus) || "new",
          };
        });
        setConsultations(list);
        setDataLoading(false);
      },
      (err) => {
        console.error("Error fetching consultations:", err);
        setDataError(
          "상담 목록을 불러오는 중 권한 오류가 발생했습니다. 파이어베이스 보안 규칙 및 로그인 상태를 확인하세요."
        );
        setDataLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setLoginError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.code === "auth/too-many-requests") {
        setLoginError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도하세요.");
      } else {
        setLoginError(
          "로그인 중 오류가 발생했습니다. 계정이 파이어베이스에 등록되어 있는지 확인하세요."
        );
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSelectedConsultation(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (
    id: string,
    newStatus: ConsultationStatus
  ) => {
    try {
      const docRef = doc(db, "consultations", id);
      await updateDoc(docRef, { status: newStatus });
      if (selectedConsultation && selectedConsultation.id === id) {
        setSelectedConsultation((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // Handle Delete Consultation
  const handleDeleteConsultation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "consultations", id));
      setDeletingId(null);
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("상담 삭제 중 오류가 발생했습니다.");
    }
  };

  // Format timestamp safely
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "방금 전";
    if (timestamp instanceof Timestamp) {
      const date = timestamp.toDate();
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")} ${String(
        date.getHours()
      ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }
    if (typeof timestamp === "string") return timestamp;
    return "날짜 표시 불가";
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate status counts
  const statusCounts = {
    all: consultations.length,
    new: consultations.filter((c) => c.status === "new").length,
    contacted: consultations.filter((c) => c.status === "contacted").length,
    site_visit: consultations.filter((c) => c.status === "site_visit").length,
    estimate: consultations.filter((c) => c.status === "estimate").length,
    contract: consultations.filter((c) => c.status === "contract").length,
    completed: consultations.filter((c) => c.status === "completed").length,
  };

  // Copy phone number helper
  const copyPhoneToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-200">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
        <p className="text-sm font-medium">관리자 시스템 확인 중...</p>
      </div>
    );
  }

  // Login View (Unauthenticated)
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
              한신인테리어 관리자 시스템
            </span>
            <h2 className="text-2xl font-bold font-serif text-white">
              상담 관리 로그인
            </h2>
            <p className="text-xs text-stone-400">
              실측 상담 신청 내역을 조회 및 관리할 수 있습니다.
            </p>
          </div>

          {/* Login Error Alert */}
          {loginError && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                관리자 이메일
              </label>
              <input
                type="email"
                required
                placeholder="admin@busan-interior.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loginLoading}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginLoading}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>로그인 확인 중...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>관리자 로그인</span>
                </>
              )}
            </button>
          </form>

          {/* Help Box for Firebase Auth Setup */}
          <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-xs text-stone-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>관리자 계정 등록 방법</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-400 leading-relaxed">
              <li>Firebase Console 접속</li>
              <li>Authentication 메뉴 - Users 탭 클릭</li>
              <li>'사용자 추가' 버튼 클릭 후 이메일/비밀번호 등록</li>
              <li>등록한 계정으로 위 폼에 로그인하여 상담 관리 사용</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard View (Authenticated Admin)
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-16">
      {/* Top Admin Navigation Header */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                한신인테리어 공식 관리 시스템
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-white font-serif">
                실측 및 견적 상담 관리
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
            <span className="text-xs text-stone-400 truncate max-w-[200px]">
              <strong className="text-amber-300 font-medium">관리자:</strong>{" "}
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Stat Cards Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {[
            { key: "all", label: "전체 신청", count: statusCounts.all, color: "text-white" },
            { key: "new", label: "신규 접수", count: statusCounts.new, color: "text-rose-400" },
            { key: "contacted", label: "연락 완료", count: statusCounts.contacted, color: "text-amber-400" },
            { key: "site_visit", label: "현장 실측", count: statusCounts.site_visit, color: "text-purple-400" },
            { key: "estimate", label: "견적 발송", count: statusCounts.estimate, color: "text-blue-400" },
            { key: "contract", label: "계약 체결", count: statusCounts.contract, color: "text-emerald-400" },
            { key: "completed", label: "공사 완료", count: statusCounts.completed, color: "text-stone-400" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                statusFilter === item.key
                  ? "bg-stone-800 border-amber-400 shadow-lg ring-1 ring-amber-400"
                  : "bg-stone-900 border-stone-800 hover:border-stone-700"
              }`}
            >
              <span className="text-[11px] text-stone-400 font-medium block">
                {item.label}
              </span>
              <span className={`text-xl sm:text-2xl font-black ${item.color} mt-0.5 block`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="고객명, 연락처, 공사지역, 요청내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 text-xs sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Select Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs text-stone-400 shrink-0 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              상태:
            </span>
            {[
              { id: "all", label: "전체" },
              { id: "new", label: "신규" },
              { id: "contacted", label: "연락완료" },
              { id: "site_visit", label: "현장실측" },
              { id: "estimate", label: "견적발송" },
              { id: "contract", label: "계약" },
              { id: "completed", label: "공사완료" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? "bg-amber-500 text-stone-950"
                    : "bg-stone-950 text-stone-300 border border-stone-800 hover:bg-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Loading / Error Banner */}
        {dataError && (
          <div className="p-4 bg-rose-950/90 border border-rose-500/50 rounded-2xl text-rose-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">상담 데이터를 읽을 수 없습니다.</p>
              <p className="text-xs text-rose-300 leading-relaxed">{dataError}</p>
            </div>
          </div>
        )}

        {/* Consultations Data List */}
        {dataLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-sm text-stone-400">
              Firestore에서 상담 신청 내역을 불러오는 중입니다...
            </p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="py-16 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3 p-6">
            <FileText className="w-12 h-12 text-stone-600 mx-auto" />
            <h3 className="text-base font-bold text-white">
              조건에 일치하는 상담 신청이 없습니다.
            </h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              검색어나 상태 필터를 변경하거나, 고객이 홈페이지에서 실측 상담을 신청할 때까지 기다려주세요.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">고객명 / 연락처</th>
                    <th className="py-3.5 px-4">공사 지역 / 공간</th>
                    <th className="py-3.5 px-4">면적 / 희망일</th>
                    <th className="py-3.5 px-4">첨부 사진</th>
                    <th className="py-3.5 px-4">신청 일시</th>
                    <th className="py-3.5 px-4">상담 상태</th>
                    <th className="py-3.5 px-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-200">
                  {filteredConsultations.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-850/60 transition-colors group cursor-pointer"
                        onClick={() => setSelectedConsultation(item)}
                      >
                        {/* Name & Phone */}
                        <td className="py-4 px-4">
                          <div className="font-bold text-white text-sm">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-amber-400 font-mono text-xs">
                            <a
                              href={`tel:${item.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{item.phone}</span>
                            </a>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyPhoneToClipboard(item.phone);
                              }}
                              className="text-stone-500 hover:text-stone-300 p-0.5"
                              title="복사"
                            >
                              {copiedPhone === item.phone ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Location & Space */}
                        <td className="py-4 px-4">
                          <div className="font-medium text-stone-200">
                            {item.location}
                          </div>
                          <div className="text-stone-400 text-[11px] mt-0.5">
                            {item.spaceType}
                          </div>
                        </td>

                        {/* Area & Date */}
                        <td className="py-4 px-4">
                          <div className="text-stone-300">
                            {item.area ? `${item.area}평` : "미입력"}
                          </div>
                          <div className="text-stone-400 text-[11px] mt-0.5">
                            시작: {item.startDate || "미지정"}
                          </div>
                        </td>

                        {/* Photos */}
                        <td className="py-4 px-4">
                          {item.photoUrls && item.photoUrls.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded-full text-[11px] font-semibold">
                              <ImageIcon className="w-3 h-3" />
                              {item.photoUrls.length}장
                            </span>
                          ) : (
                            <span className="text-stone-500 text-[11px]">
                              없음
                            </span>
                          )}
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-4 text-stone-400 text-[11px]">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Status Select */}
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleStatusChange(
                                item.id,
                                e.target.value as ConsultationStatus
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border ${cfg.bg} ${cfg.text} ${cfg.border} focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer transition-all`}
                          >
                            <option value="new" className="bg-stone-900 text-rose-300">
                              신규
                            </option>
                            <option value="contacted" className="bg-stone-900 text-amber-300">
                              연락완료
                            </option>
                            <option value="site_visit" className="bg-stone-900 text-purple-300">
                              현장실측
                            </option>
                            <option value="estimate" className="bg-stone-900 text-blue-300">
                              견적발송
                            </option>
                            <option value="contract" className="bg-stone-900 text-emerald-300">
                              계약
                            </option>
                            <option value="completed" className="bg-stone-900 text-stone-300">
                              공사완료
                            </option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedConsultation(item)}
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              title="상세보기"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>상세</span>
                            </button>

                            <button
                              onClick={() => setDeletingId(item.id)}
                              className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-lg text-xs transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {filteredConsultations.map((item) => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.new;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedConsultation(item)}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-4 space-y-3 cursor-pointer shadow-lg transition-all"
                  >
                    {/* Top row: Name & Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-stone-800/80 pb-3">
                      <div>
                        <span className="text-[10px] text-stone-400 font-medium block">
                          신청일: {formatDate(item.createdAt)}
                        </span>
                        <h3 className="text-base font-bold text-white font-serif mt-0.5">
                          {item.name}
                        </h3>
                      </div>

                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as ConsultationStatus
                            )
                          }
                          className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${cfg.bg} ${cfg.text} ${cfg.border} focus:outline-none cursor-pointer`}
                        >
                          <option value="new" className="bg-stone-900 text-rose-300">
                            신규
                          </option>
                          <option value="contacted" className="bg-stone-900 text-amber-300">
                            연락완료
                          </option>
                          <option value="site_visit" className="bg-stone-900 text-purple-300">
                            현장실측
                          </option>
                          <option value="estimate" className="bg-stone-900 text-blue-300">
                            견적발송
                          </option>
                          <option value="contract" className="bg-stone-900 text-emerald-300">
                            계약
                          </option>
                          <option value="completed" className="bg-stone-900 text-stone-300">
                            공사완료
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                      <div>
                        <span className="text-stone-500 block text-[10px]">연락처</span>
                        <a
                          href={`tel:${item.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-amber-400 font-mono font-bold hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 shrink-0" />
                          <span>{item.phone}</span>
                        </a>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px]">공사 지역</span>
                        <span className="font-medium truncate block">{item.location}</span>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px]">공간 / 면적</span>
                        <span className="font-medium">
                          {item.spaceType} ({item.area ? `${item.area}평` : "면적미입력"})
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px]">희망 공사일</span>
                        <span className="font-medium">{item.startDate || "가장 빠른 일자"}</span>
                      </div>
                    </div>

                    {/* Photo Badge & Actions */}
                    <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      {item.photoUrls && item.photoUrls.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          사진 {item.photoUrls.length}장 첨부됨
                        </span>
                      ) : (
                        <span className="text-[11px] text-stone-500">사진 없음</span>
                      )}

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedConsultation(item)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>상세보기</span>
                        </button>

                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 bg-stone-800 hover:bg-rose-950 text-stone-400 hover:text-rose-400 rounded-lg text-xs"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Consultation Detail Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  상담 신청 상세 정보
                </span>
                <h3 className="text-lg font-bold text-white font-serif mt-0.5">
                  {selectedConsultation.name} 고객님
                </h3>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Quick Call Action Bar */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-xs text-amber-300 font-semibold">
                    고객 연락처
                  </span>
                  <div className="text-xl font-bold font-mono text-white">
                    {selectedConsultation.phone}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${selectedConsultation.phone}`}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>바로 전화 걸기</span>
                  </a>

                  <button
                    onClick={() => copyPhoneToClipboard(selectedConsultation.phone)}
                    className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1"
                  >
                    {copiedPhone === selectedConsultation.phone ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">복사됨</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>복사</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status Change Selector Bar */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-xs text-stone-400 font-semibold block">
                  상담 상태 관리 변경
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { key: "new", label: "신규" },
                    { key: "contacted", label: "연락완료" },
                    { key: "site_visit", label: "현장실측" },
                    { key: "estimate", label: "견적발송" },
                    { key: "contract", label: "계약" },
                    { key: "completed", label: "공사완료" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() =>
                        handleStatusChange(
                          selectedConsultation.id,
                          s.key as ConsultationStatus
                        )
                      }
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedConsultation.status === s.key
                          ? "bg-amber-500 text-stone-950 border-amber-400 shadow"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800 hover:text-white"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold block">
                    공사 지역
                  </span>
                  <p className="text-stone-100 font-medium text-sm">
                    {selectedConsultation.location}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold block">
                    공간 유형 및 면적
                  </span>
                  <p className="text-stone-100 font-medium text-sm">
                    {selectedConsultation.spaceType} /{" "}
                    {selectedConsultation.area
                      ? `${selectedConsultation.area}평`
                      : "면적 미입력"}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold block">
                    희망 공사 시작일
                  </span>
                  <p className="text-stone-100 font-medium text-sm">
                    {selectedConsultation.startDate || "가장 빠른 일자"}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-semibold block">
                    신청 접수 일시
                  </span>
                  <p className="text-stone-100 font-medium text-sm">
                    {formatDate(selectedConsultation.createdAt)}
                  </p>
                </div>
              </div>

              {/* Consultation Details Text */}
              <div className="space-y-2">
                <span className="text-xs text-stone-400 font-semibold block">
                  상담 요청 내용
                </span>
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 text-stone-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed min-h-[80px]">
                  {selectedConsultation.details || "작성된 세부 요청 내용이 없습니다."}
                </div>
              </div>

              {/* Attached Photos Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 font-semibold block">
                    첨부된 현장 / 참고 사진 (Firebase Storage)
                  </span>
                  <span className="text-xs text-amber-400 font-bold">
                    총{" "}
                    {selectedConsultation.photoUrls
                      ? selectedConsultation.photoUrls.length
                      : 0}
                    장
                  </span>
                </div>

                {selectedConsultation.photoUrls &&
                selectedConsultation.photoUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedConsultation.photoUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="group relative bg-stone-950 border border-stone-800 rounded-xl overflow-hidden aspect-square cursor-pointer"
                        onClick={() => setPreviewImage(url)}
                      >
                        <img
                          src={url}
                          alt={`첨부사진 ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-2 bg-stone-900/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            확대
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-stone-950 border border-stone-800 rounded-2xl text-center text-xs text-stone-500">
                    고객이 첨부한 사진이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={() => setDeletingId(selectedConsultation.id)}
                className="px-4 py-2 bg-stone-900 hover:bg-rose-950 text-stone-400 hover:text-rose-400 border border-stone-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>상담 기록 삭제</span>
              </button>

              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="사진 원본"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl border border-stone-800"
            />
            <div className="mt-3 flex items-center justify-between">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>새 탭에서 원본 열기</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-stone-800 text-white text-xs font-semibold rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-950 text-rose-400 border border-rose-800 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white font-serif">
                상담 기록을 삭제하시겠습니까?
              </h4>
              <p className="text-xs text-stone-400">
                삭제된 상담 신청 정보는 복구할 수 없습니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold"
              >
                취소
              </button>
              <button
                onClick={() => handleDeleteConsultation(deletingId)}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow"
              >
                네, 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
