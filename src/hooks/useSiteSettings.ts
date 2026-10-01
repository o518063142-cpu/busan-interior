import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { SITE_CONFIG, SITE_ENTITY } from "../config/siteConfig";

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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone: SITE_CONFIG.company.phone,
  mobilePhone: SITE_CONFIG.company.mobilePhone,
  email: "8063143@naver.com",
  address: SITE_CONFIG.company.address,
  addressDetail: SITE_CONFIG.company.addressDetail,
  operatingHours: SITE_CONFIG.company.operatingHours,
  closedDays: SITE_CONFIG.company.closedDays,
  naverPlace:
    SITE_ENTITY.socialLinks.naverPlace ||
    SITE_CONFIG.company.naverPlaceUrl ||
    "",
  naverBlog: SITE_ENTITY.socialLinks.naverBlog || "",
  naverClip: SITE_ENTITY.socialLinks.naverClip || "",
  instagram: SITE_ENTITY.socialLinks.instagram || "",
  youtube: SITE_ENTITY.socialLinks.youtube || "",
  kakaoChannel: SITE_ENTITY.socialLinks.kakaoChannel || "",
};

export const useSiteSettings = () => {
  const [settings, setSettings] =
    useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, "siteSettings", "main");

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSettings(DEFAULT_SITE_SETTINGS);
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setSettings({
          phone: data.phone || DEFAULT_SITE_SETTINGS.phone,
          mobilePhone:
            data.mobilePhone || DEFAULT_SITE_SETTINGS.mobilePhone,
          email: data.email || DEFAULT_SITE_SETTINGS.email,
          address: data.address || DEFAULT_SITE_SETTINGS.address,
          addressDetail:
            data.addressDetail || DEFAULT_SITE_SETTINGS.addressDetail,
          operatingHours:
            data.operatingHours || DEFAULT_SITE_SETTINGS.operatingHours,
          closedDays:
            data.closedDays || DEFAULT_SITE_SETTINGS.closedDays,
          naverPlace:
            data.naverPlace || DEFAULT_SITE_SETTINGS.naverPlace,
          naverBlog:
            data.naverBlog || DEFAULT_SITE_SETTINGS.naverBlog,
          naverClip:
            data.naverClip || DEFAULT_SITE_SETTINGS.naverClip,
          instagram:
            data.instagram || DEFAULT_SITE_SETTINGS.instagram,
          youtube:
            data.youtube || DEFAULT_SITE_SETTINGS.youtube,
          kakaoChannel:
            data.kakaoChannel || DEFAULT_SITE_SETTINGS.kakaoChannel,
        });

        setLoading(false);
      },
      (error) => {
        console.warn(
          "사이트 설정을 불러오지 못해 기본값을 사용합니다:",
          error
        );
        setSettings(DEFAULT_SITE_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const phoneDisplay = [settings.phone, settings.mobilePhone]
    .filter(Boolean)
    .join(" / ");

  const fullAddress = [settings.address, settings.addressDetail]
    .filter(Boolean)
    .join(" ");

  return {
    settings,
    loading,
    phoneDisplay,
    fullAddress,
  };
};
