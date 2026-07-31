// 한신인테리어 사이트 중앙 설정 파일
// 개발자 및 실제 사용자(업체)가 전화번호, 주소, 사업자정보, 면허번호 등을 쉽게 교체할 수 있습니다.

export interface CompanyInfo {
  name: string; // 업체명
  title: string; // 주요 슬로건
  subTitle: string; // 서브 타이틀
  industry: string; // 업종
  licenseStatus: string; // 면허 보유 여부
  licenseNumber: string; // 면허번호
  phone: string; // 매장/일반전화 (051-806-3143)
  mobilePhone: string; // 직통/휴대전화 (010-723-11470)
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

export const SITE_CONFIG = {
  company: {
    name: "한신인테리어",
    title: "부산진구 전포동 실내건축·인테리어 전문",
    subTitle: "아파트·주택 리모델링부터 상가·매장·사무실 인테리어까지",
    heroDescription: "네이버 플레이스 정보 기반 공식 안내. 현장 실측부터 설계·견적·시공까지 책임지고 제안합니다.",
    industry: "실내건축·인테리어 전문",
    licenseStatus: "실내건축 면허 보유",
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
    mainTitle: "부산진구 인테리어 전문 한신인테리어｜전포동·서면 실내건축·리모델링",
    metaDescription:
      "부산진구 전포동 한신인테리어. 아파트·주택 리모델링, 상가·매장·카페·사무실 인테리어 및 실내건축 전문. 부산진구·전포동·서면 및 부산 전 지역 상담. 무료 현장 실측 및 견적 상담.",
    keywords: [
      "부산진구 인테리어",
      "전포동 인테리어",
      "서면 인테리어",
      "부산진구 상가 인테리어",
      "전포동 상가 인테리어",
      "부산 아파트 리모델링",
      "부산 실내건축",
      "부산 사무실 인테리어",
      "부산 카페 인테리어",
      "부산 주택 리모델링",
      "한신인테리어",
    ],
  },

  heroImages: {
    main: "/src/assets/images/hanshin_hero_bg_1784852933011.jpg",
    commercial: "/src/assets/images/hanshin_commercial_interior_1784852944836.jpg",
  },
};
