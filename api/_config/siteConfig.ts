// 지니 인테리어 (GENE INTERIOR) 사이트 중앙 설정 파일
// 브랜드·법적 사업자·주소·SEO 정보를 하나의 Entity Source of Truth로 관리

export interface BrandInfo {
  nameKo: string;
  nameEn: string;
  displayName: string;
  slogan: string;
  shortDescription: string;
}

export interface LegalInfo {
  businessName: string;
  representative: string;
  businessNumber: string;
  licenseStatus: string;
  licenseNumber: string;
  industry: string;
  address: string;
  addressDetail: string;
  phone: string;
  mobilePhone: string;
  phoneDisplay: string;
}

export interface CompanyInfo {
  name: string;
  title: string;
  subTitle: string;
  heroDescription: string;
  industry: string;
  licenseStatus: string;
  licenseNumber: string;
  phone: string;
  mobilePhone: string;
  phoneDisplay: string;
  address: string;
  addressDetail: string;
  businessNumber: string;
  representative: string;
  email: string;
  naverPlaceUrl: string;
  kakaoTalkUrl: string;
  operatingHours: string;
  closedDays: string;
  primaryRegions: string[];
}

export interface SiteEntity {
  brand: BrandInfo;
  legal: LegalInfo;
  contact: {
    phone: string;
    mobilePhone: string;
    phoneDisplay: string;
  };
  url: string;
  logo: string;
  address: {
    street: string;
    locality: string;
    region: string;
    country: string;
  };
  serviceArea: string[];
  license: {
    name: string;
    isHolder: boolean;
    officialTitle: string;
  };
  socialLinks: {
    naverPlace?: string;
    naverBlog?: string;
    naverClip?: string;
    instagram?: string;
    youtube?: string;
    kakaoChannel?: string;
  };
}

export const SITE_ENTITY: SiteEntity = {
  brand: {
    nameKo: "지니 인테리어",
    nameEn: "GENE INTERIOR",
    displayName: "지니 인테리어 | GENE INTERIOR",
    slogan: "공간의 가치를 더하는 맞춤형 인테리어 & 리모델링",
    shortDescription:
      "부산 주거·상업·교육시설 인테리어·리모델링을 수행하는 실내건축공사업 등록업체",
  },

  legal: {
    businessName: "지니인테리어",
    representative: "정혜은",
    businessNumber: "상담 시 확인 가능",
    licenseStatus: "실내건축공사업 등록업체",
    licenseNumber: "상담 시 확인 가능",
    industry: "실내건축·인테리어 전문",
    address: "부산광역시 동래구 명륜로 222",
    addressDetail: "상가동 A-209호",
    phone: "051-806-3143",
    mobilePhone: "010-7231-1470",
    phoneDisplay: "051-806-3143 / 010-7231-1470",
  },

  contact: {
    phone: "051-806-3143",
    mobilePhone: "010-7231-1470",
    phoneDisplay: "051-806-3143 / 010-7231-1470",
  },

  url: "https://gene-interior.vercel.app",
  logo: "/images/logo.png",

  address: {
    street: "명륜로 222 상가동 A-209호",
    locality: "동래구",
    region: "부산광역시",
    country: "KR",
  },

  serviceArea: [
    "부산광역시",
    "경상남도",
    "울산광역시",
    "동래구",
    "부산진구",
    "수영구",
    "해운대구",
    "연제구",
    "양산시",
    "김해시",
  ],

  license: {
    name: "실내건축공사업",
    isHolder: true,
    officialTitle: "실내건축공사업 등록업체",
  },

  socialLinks: {
    naverPlace: "https://m.place.naver.com/place/13556704/home",
    naverBlog: "https://blog.naver.com/8063142",
    naverClip: "https://clip.naver.com/@gene-interior",
    instagram: "https://www.instagram.com/gene.interior/",
    youtube: "https://www.youtube.com/@GENEINTERIOR",
    kakaoChannel: "https://pf.kakao.com/_xaAxniX",
  },
};

export const SITE_CONFIG = {
  // 1. 고객 노출 브랜드 정보
  brand: SITE_ENTITY.brand,

  // 2. 현재 법적 사업자 및 관공서 등록 정보
  legal: SITE_ENTITY.legal,

  // 3. 기존 코드와의 호환성을 위한 company 객체
  company: {
    name: "지니 인테리어",
    title: "부산 실내건축·인테리어·리모델링 전문",
    subTitle:
      "아파트·주택 리모델링부터 상가·매장·사무실·교육시설 인테리어까지",
    heroDescription:
      "실내건축공사업 등록업체로서 현장 실측부터 설계·견적·시공까지 책임지고 제안합니다.",
    industry: "실내건축·인테리어 전문",
    licenseStatus: "실내건축공사업 등록업체",
    licenseNumber: "상담 시 확인 가능",

    phone: "051-806-3143",
    mobilePhone: "010-7231-1470",
    phoneDisplay: "051-806-3143 / 010-7231-1470",

    address: "부산광역시 동래구 명륜로 222",
    addressDetail: "상가동 A-209호",

    businessNumber: "상담 시 확인 가능",
    representative: "정혜은",
    email: "8063143@naver.com",

    naverPlaceUrl: "https://m.place.naver.com/place/13556704/home",
    kakaoTalkUrl: "https://pf.kakao.com",

    operatingHours: "월~토요일 08:00 - 18:30",
    closedDays: "일요일 및 공휴일 휴무",

    primaryRegions: [
      "동래구",
      "명륜동",
      "사직동",
      "온천동",
      "부산진구",
      "전포동",
      "서면",
      "연제구",
      "수영구",
      "해운대구",
      "부산 전 지역",
      "경남",
      "울산",
      "양산",
      "김해",
    ],
  } as CompanyInfo,

  seo: {
    mainTitle:
      "지니 인테리어 (GENE INTERIOR)｜부산 실내건축·인테리어·리모델링",

    metaDescription:
      "부산 동래구 명륜동에 위치한 지니 인테리어(GENE INTERIOR)는 부산을 중심으로 경남·울산까지 아파트, 주택, 상가, 사무실, 교육시설의 실내건축·인테리어·리모델링을 진행하는 실내건축공사업 등록업체입니다.",

    canonicalUrl: "https://gene-interior.vercel.app/",

    keywords: [
      "지니 인테리어",
      "지니인테리어",
      "GENE INTERIOR",
      "부산 인테리어",
      "부산 인테리어 업체",
      "부산 실내건축",
      "부산 리모델링",
      "동래구 인테리어",
      "명륜동 인테리어",
      "동래구 리모델링",
      "부산 아파트 리모델링",
      "부산 구축 아파트 리모델링",
      "부산 상가 인테리어",
      "부산 사무실 인테리어",
      "부산 학교 인테리어",
      "부산 교육시설 인테리어",
      "부산 여성기업",
    ],
  },

  heroImages: {
    main: "/images/hanshin_hero_bg_1784852933011.jpg",
    commercial: "/images/hanshin_commercial_interior_1784852944836.jpg",
  },
};
