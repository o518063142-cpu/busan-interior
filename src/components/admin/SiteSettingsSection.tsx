import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { SITE_CONFIG } from "../../config/siteConfig";
import {
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Link as LinkIcon,
  Building2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export interface SiteSettings {
  phone: string;
  mobilePhone: string;
  email: string;

  address: string;
  addressDetail: string;

  operatingHours: string;
  closedDays: string;

  naverPlace: string;
  naverBlog: string;
  naverClip: string;
  instagram: string;
  youtube: string;
  kakaoChannel: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  phone: SITE_CONFIG.company.phone,
  mobilePhone: SITE_CONFIG.company.mobilePhone,

  // 현재 홈페이지 상단에서 실제 사용 중인 이메일을 초기 기본값으로 사용
  email: "8063143@naver.com",

  address: SITE_CONFIG.company.address,
  addressDetail: SITE_CONFIG.company.addressDetail,

  operatingHours: SITE_CONFIG.company.operatingHours,
  closedDays: SITE_CONFIG.company.closedDays,

  naverPlace:
    SITE_CONFIG.socialLinks?.naverPlace ||
    SITE_CONFIG.company.naverPlaceUrl ||
    "",

  naverBlog: SITE_CONFIG.socialLinks?.naverBlog || "",
  naverClip: SITE_CONFIG.socialLinks?.naverClip || "",
  instagram: SITE_CONFIG.socialLinks?.instagram || "",
  youtube: SITE_CONFIG.socialLinks?.youtube || "",
  kakaoChannel: SITE_CONFIG.socialLinks?.kakaoChannel || "",
};

export const SiteSettingsSection: React.FC = () => {
  const [settings, setSettings] =
    useState<SiteSettings>(DEFAULT_SETTINGS);

  const [initialSettings, setInitialSettings] =
    useState<SiteSettings>(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setMessage(null);

      try {
        const ref = doc(db, "siteSettings", "main");
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
          const data = snapshot.data();

          const loaded: SiteSettings = {
            ...DEFAULT_SETTINGS,
            ...(data || {}),
          };

          setSettings(loaded);
          setInitialSettings(loaded);
        } else {
          setSettings(DEFAULT_SETTINGS);
          setInitialSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error("사이트 설정 불러오기 오류:", error);

        setMessage({
          type: "error",
          text: "사이트 설정을 불러오지 못했습니다. 현재 기본 설정값을 표시합니다.",
        });

        setSettings(DEFAULT_SETTINGS);
        setInitialSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateField = (
    field: keyof SiteSettings,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (message) {
      setMessage(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const ref = doc(db, "siteSettings", "main");

      await setDoc(
        ref,
        {
          ...settings,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );

      setInitialSettings(settings);

      setMessage({
        type: "success",
        text: "사이트 설정이 저장되었습니다.",
      });
    } catch (error) {
      console.error("사이트 설정 저장 오류:", error);

      setMessage({
        type: "error",
        text: "저장하지 못했습니다. Firebase 권한 또는 네트워크 상태를 확인해주세요.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setMessage(null);
  };

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(initialSettings);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-3" />

        <p className="text-sm">
          사이트 설정을 불러오는 중입니다...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-amber-400" />

              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Website Settings
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white">
              홈페이지 사이트 설정
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 mt-2 leading-relaxed">
              홈페이지에 표시되는 연락처, 사업장 주소,
              영업시간 및 공식 채널 정보를 관리합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl text-xs font-bold text-stone-300 flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                변경 취소
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}

              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-5 p-3.5 rounded-xl border flex items-start gap-2 text-xs ${
              message.type === "success"
                ? "bg-emerald-950/60 border-emerald-700/60 text-emerald-300"
                : "bg-rose-950/60 border-rose-700/60 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}

            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Contact */}
      <SettingCard
        title="연락처"
        description="홈페이지의 전화 및 이메일 표시용 정보입니다."
        icon={<Phone className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput
            label="대표전화"
            value={settings.phone}
            placeholder="051-806-3143"
            onChange={(value) => updateField("phone", value)}
          />

          <SettingInput
            label="휴대전화"
            value={settings.mobilePhone}
            placeholder="010-7231-1470"
            onChange={(value) =>
              updateField("mobilePhone", value)
            }
          />

          <div className="md:col-span-2">
            <SettingInput
              label="이메일"
              type="email"
              value={settings.email}
              placeholder="8063143@naver.com"
              onChange={(value) => updateField("email", value)}
              icon={<Mail className="w-4 h-4" />}
            />
          </div>
        </div>
      </SettingCard>

      {/* Address */}
      <SettingCard
        title="사업장 주소"
        description="홈페이지에 고객에게 표시할 현재 사업장 주소입니다."
        icon={<MapPin className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput
            label="기본 주소"
            value={settings.address}
            placeholder="부산광역시 동래구 명륜로 222"
            onChange={(value) => updateField("address", value)}
          />

          <SettingInput
            label="상세 주소"
            value={settings.addressDetail}
            placeholder="상가동 A-209호"
            onChange={(value) =>
              updateField("addressDetail", value)
            }
          />
        </div>
      </SettingCard>

      {/* Hours */}
      <SettingCard
        title="영업시간"
        description="Footer 및 연락처 영역에 표시할 운영시간입니다."
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput
            label="영업시간"
            value={settings.operatingHours}
            placeholder="월~토요일 08:30 - 18:30"
            onChange={(value) =>
              updateField("operatingHours", value)
            }
          />

          <SettingInput
            label="휴무일"
            value={settings.closedDays}
            placeholder="일요일 및 공휴일 휴무"
            onChange={(value) =>
              updateField("closedDays", value)
            }
          />
        </div>
      </SettingCard>

      {/* Channels */}
      <SettingCard
        title="공식 채널 및 외부 링크"
        description="네이버·Instagram·YouTube·Kakao 등 공식 채널 주소입니다."
        icon={<LinkIcon className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingInput
            label="네이버 플레이스"
            value={settings.naverPlace}
            placeholder="https://..."
            onChange={(value) =>
              updateField("naverPlace", value)
            }
          />

          <SettingInput
            label="네이버 블로그"
            value={settings.naverBlog}
            placeholder="https://..."
            onChange={(value) =>
              updateField("naverBlog", value)
            }
          />

          <SettingInput
            label="네이버 클립"
            value={settings.naverClip}
            placeholder="https://..."
            onChange={(value) =>
              updateField("naverClip", value)
            }
          />

          <SettingInput
            label="Instagram"
            value={settings.instagram}
            placeholder="https://..."
            onChange={(value) =>
              updateField("instagram", value)
            }
          />

          <SettingInput
            label="YouTube"
            value={settings.youtube}
            placeholder="https://..."
            onChange={(value) =>
              updateField("youtube", value)
            }
          />

          <SettingInput
            label="Kakao 채널"
            value={settings.kakaoChannel}
            placeholder="https://..."
            onChange={(value) =>
              updateField("kakaoChannel", value)
            }
          />
        </div>
      </SettingCard>

      {/* SEO notice */}
      <div className="bg-blue-950/30 border border-blue-800/40 rounded-2xl p-4 text-xs text-blue-200 leading-relaxed">
        <strong className="text-blue-300">
          검색 정보 안내:
        </strong>{" "}
        이 화면은 홈페이지 운영정보를 관리하기 위한 설정입니다.
        검색엔진용 핵심 사업자 정보와 구조화데이터는 안전성을 위해
        별도의 기본 설정값을 유지합니다.
      </div>
    </div>
  );
};

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <section className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden">
      <div className="p-5 border-b border-stone-800">
        <div className="flex items-center gap-2 text-amber-400">
          {icon}

          <h3 className="text-base font-bold text-white">
            {title}
          </h3>
        </div>

        <p className="text-xs text-stone-400 mt-1.5">
          {description}
        </p>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
};

interface SettingInputProps {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  onChange: (value: string) => void;
}

const SettingInput: React.FC<SettingInputProps> = ({
  label,
  value,
  placeholder,
  type = "text",
  icon,
  onChange,
}) => {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-stone-300 mb-1.5">
        {label}
      </span>

      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full py-3 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-none focus:border-amber-400 transition-colors ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </label>
  );
};
