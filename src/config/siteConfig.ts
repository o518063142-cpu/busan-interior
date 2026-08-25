// 지니 인테리어 (GENE INTERIOR) 사이트 중앙 설정 파일
// 고객 노출 브랜드 정보와 법적 사업자(한신인테리어) 정보를 명확히 분리 관리하는 Entity Source of Truth

export interface BrandInfo {
  nameKo: string; // 한글 브랜드명 ("지니 인테리어")
  nameEn: string; // 영문 브랜드명 ("GENE INTERIOR")
  displayName: string; // 표시용 풀 브랜드명 ("지니 인테리어 | GENE INTERIOR")
  slogan: string; // 브랜드 슬로건
  shortDescription: string; // 브랜드 한 줄 요약
}

export interface LegalInfo {
  businessName: string; // 법적 상호 ("한신인테리어")
  representative: string; // 대표자 성명 ("정혜은")
  businessNumber: string; // 사업자등록번호 (상담 시 확인 가능)
  licenseStatus: string; // 면허 보유 여부 ("실내건축공사업 등록업체")
  licenseNumber: string; // 면허번호
  industry: string; // 업종
  address: string; // 사업장 소재지 기본 주소
  addressDetail: string; // 상세주소
  phone: string; // 대표 일반전화
  mobilePhone: string; // 대표 휴대전화
  phoneDisplay: string; // 화면 표시 전화번호
}

export interface CompanyInfo {
  name: string; // 업체/브랜드 표시명
  title: string; // 주요 슬로건
  subTitle: string; // 서브 타이틀
  heroDescription: string; // 히어로 설명문
  industry: string; // 업종
  licenseStatus: string; // 면허 보유 여부
  licenseNumber: string; // 면허번호
  phone: string; // 매장/일반전화 (051-806-3143)
  mobilePhone: string; // 직통/휴대전화 (010-7231-1470)
  phoneDisplay: string; // 화면 표시 전화번호
  address: string; // 기본 주소
  addressDetail: string; // 상세주소
  businessNumber: string; // 사업자등록번호
  representative: string; // 대표자명
  email: string; // 이메일
  naverPlaceUrl: string; // 네이버 플레이스 URL
  kakaoTalkUrl: string; // 카카오톡 상담 URL
  operatingHours: string; // 영업시간
  closedDays: string; // 휴무일
  primaryRegions: string[]; // 주요 활동 지역
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
    shortDescription: "부산 주거·소형 상업공간 인테리어·리모델링을 다루는 실내건축공사업 등록업체",
  },
  legal: {
    businessName: "한신인테리어",
    representative: "정혜은",
    businessNumber: "상담 시 확인 가능",
    licenseStatus: "실내건축공사업 등록업체",
    licenseNumber: "상담 시 확인 가능",
    industry: "실내건축·인테리어 전문",
    address: "부산광역시 부산진구 전포동",
    addressDetail: "(상세위치: 네이버 플레이스 참조)",
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
  logo: "/images/hanshin_hero_bg_1784852933011.jpg",
  address: {
    street: "전포동",
    locality: "부산진구",
    region: "부산광역시",
    country: "KR",
  },
  serviceArea: ["부산진구", "전포동", "서면", "부산광역시"],
  license: {
    name: "실내건축공사업",
    isHolder: true,
    officialTitle: "실내건축공사업 등록업체",
  },
  socialLinks: {
    naverPlace: "https://map.naver.com/p/search/%ED%95%9C%EC%8B%A0%EC%9D%B8%ED%85%8C%EB%A6%AC%EC%96%B4",
  },
};

export const SITE_CONFIG = {
  // 1. 고객 노출 브랜드 정보
  brand: SITE_ENTITY.brand,

  // 2. 법적 사업자 및 관공서 등록 정보 (원형 보존)
  legal: SITE_ENTITY.legal,

  // 3. 기존 코드와의 호환성을 위한 company 객체 (브랜드 + 법적정보 매핑)
  company: {
    name: "지니 인테리어",
    title: "부산진구 전포동 실내건축·인테리어 전문",
    subTitle: "아파트·주택 리모델링부터 상가·매장·사무실 인테리어까지",
    heroDescription: "실내건축공사업 등록업체로서 현장 실측부터 설계·견적·시공까지 책임지고 제안합니다.",
    industry: "실내건축·인테리어 전문",
    licenseStatus: "실내건축공사업 등록업체",
    licenseNumber: "상담 시 확인 가능",
    phone: "051-806-3143",
    mobilePhone: "010-7231-1470",
    phoneDisplay: "051-806-3143 / 010-7231-1470",
    address: "부산광역시 부산진구 전포동",
    addressDetail: "(상세위치: 네이버 플레이스 참조)",
    businessNumber: "상담 시 확인 가능",
    representative: "정혜은",
    email: "상담 시 안내",
    naverPlaceUrl: "https://map.naver.com/p/search/%ED%95%9C%EC%8B%A0%EC%9D%B8%ED%85%8C%EB%A6%AC%EC%96%B4",
    kakaoTalkUrl: "https://pf.kakao.com",
    operatingHours: "월~토요일 08:30 - 18:30",
    closedDays: "일요일 및 공휴일 휴무",
    primaryRegions: [
      "부산진구",
      "전포동",
      "서면",
      "부전동",
      "가야동",
      "범천동",
      "연제구",
      "수영구",
      "해운대구",
      "부산 전 지역",
    ],
  } as CompanyInfo,

  seo: {
    mainTitle: "지니 인테리어 (GENE INTERIOR)｜부산진구 전포동·서면 실내건축·리모델링",
    metaDescription:
      "지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어)는 부산의 주거·소형 상업공간 인테리어·리모델링을 전문으로 하는 실내건축공사업 등록업체입니다. 아파트·주택·상가·카페 맞춤 시공 및 무료 현장 실측.",
    canonicalUrl: "https://gene-interior.vercel.app/",
    keywords: [
      "지니 인테리어",
      "지니인테리어",
      "GENE INTERIOR",
      "부산진구 인테리어",
      "전포동 인테리어",
      "서면 인테리어",
      "부산진구 상가 인테리어",
      "전포동 상가 인테리어",
      "부산 아파트 리모델링",
      "부산 실내건축",
      "부산 사무실 인테리어",
      "부산 카페 인테리어",
      "한신인테리어",
    ],
  },

  heroImages: {
    main: "/images/hanshin_hero_bg_1784852933011.jpg",
    commercial: "/images/hanshin_commercial_interior_1784852944836.jpg",
  },
};


