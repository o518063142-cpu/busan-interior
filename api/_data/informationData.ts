export interface InformationArticleSection {
  heading: string;
  content: string;
}

export interface InformationArticleData {
  id: string;
  slug: string;
  title: string;
  shortAnswer: string;
  content: string;
  category?: string;
  description?: string;
  author?: string;
  sections?: InformationArticleSection[];
  consumerChecklist?: string[];
  faq?: { question: string; answer: string }[];
  featuredImage?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const INFORMATION_ARTICLES: InformationArticleData[] = [
  {
    id: "interior-license-guide",
    slug: "interior-license-guide",
    title: "부산 실내건축공사업 면허 업체 확인법과 무면허 공사의 법적 위험",
    description: "건설산업기본법상 1,500만원 이상 실내건축공사는 면허 등록업체 시공이 필수입니다. 무면허 시공 피해 예방과 정식 등록업체 확인 가이드.",
    category: "법규 및 면허",
    shortAnswer: "건설산업기본법에 따라 1,500만원 이상 공사는 실내건축공사업 정식 등록업체만 법적으로 시공할 수 있습니다. 지자체 등록증 및 국토교통부 키스콘(KISCON)에서 면허 유무를 즉시 검증할 수 있습니다.",
    author: "지니 인테리어 기술팀",
    publishedAt: "2025-01-15",
    updatedAt: "2025-02-10",
    sections: [
      {
        heading: "1. 실내건축공사업 면허란 무엇인가?",
        content: "실내건축공사업은 건설산업기본법 제9조에 의거하여 일정 자본금(1억 5천만 원 이상), 국가기술자격 기술인력(2인 이상 상시 근무), 공제조합 출자 예치 등 법적 요건을 충족한 전문건설업체에만 지자체에서 발급하는 국가 정식 건설업 면허입니다.",
      },
      {
        heading: "2. 1,500만 원 이상 공사 시 면허 의무화 규정",
        content: "현행 건설산업기본법에 따르면, 공사 예정 금액이 1,500만 원(부가세 포함) 이상인 실내건축·리모델링 공사는 반드시 실내건축공사업 등록업체가 시공하도록 규정되어 있습니다.",
      },
      {
        heading: "3. 무면허 시공 피해 예방과 정식 등록업체 확인",
        content: "무면허 업체와의 계약 시 하자보수이행증권 발급 불가, 공사 중단 시 법적 구제 한계 등 심각한 위험이 따릅니다. 공사 계약 전 반드시 지자체 발급 '건설업등록증' 또는 국토교통부 키스콘(KISCON) 시스템을 통해 실내건축공사업 정식 등록 여부를 확인해야 합니다.",
      },
    ],
    content: `1. 실내건축공사업 면허란 무엇인가?
실내건축공사업은 건설산업기본법 제9조에 의거하여 일정 자본금(1억 5천만 원 이상), 국가기술자격 기술인력(2인 이상 상시 근무), 공제조합 출자 예치 등 법적 요건을 충족한 전문건설업체에만 지자체에서 발급하는 국가 정식 건설업 면허입니다.

2. 1,500만 원 이상 공사 시 면허 의무화 규정
현행 건설산업기본법에 따르면, 공사 예정 금액이 1,500만 원(부가세 포함) 이상인 실내건축·리모델링 공사는 반드시 실내건축공사업 등록업체가 시공하도록 규정되어 있습니다.

3. 무면허 시공 피해 예방과 정식 등록업체 확인
무면허 업체와의 계약 시 하자보수이행증권 발급 불가, 공사 중단 시 법적 구제 한계 등 심각한 위험이 따릅니다. 공사 계약 전 반드시 지자체 발급 '건설업등록증' 또는 국토교통부 키스콘(KISCON) 시스템을 통해 실내건축공사업 정식 등록 여부를 확인해야 합니다.`,
    consumerChecklist: [
      "공사 계약 전 시공 업체의 실내건축공사업 등록증 원본 또는 사본 확인",
      "국토교통부 KISCON(건설산업지식정보시스템)에서 업체 상호 및 등록번호 조회",
      "공사금액 1,500만원 이상 시 정식 실내건축공사업 등록업체와의 표준계약서 작성",
      "하자이행보증보험증권 발급 가능 여부 확인",
    ],
  },
  {
    id: "busanjin-remodeling-checklist",
    slug: "busanjin-remodeling-checklist",
    title: "부산진구 전포동·서면 아파트·상가 인테리어 완벽 체크리스트",
    description: "부산진구 전포동 카페거리 및 서면 상권 매장, 주거 공간 리모델링 시 필수 점검 사항. 실측, 철거, 단열, 방수, 전기 증설 가이드.",
    category: "시공 가이드",
    shortAnswer: "부산진구 노후 아파트 및 상권 매장은 층고 실측, 노후 배관 방수 상태, 전기 계약 전력 용량 점검이 최우선입니다. 100% 무료 현장 실측을 통해 사전 오차를 완벽히 차단해야 합니다.",
    author: "지니 인테리어 현장감리팀",
    publishedAt: "2025-01-20",
    updatedAt: "2025-02-12",
    sections: [
      {
        heading: "1. 전포동 상가 및 카페거리 공사 특수성",
        content: "부산진구 전포동 카페거리와 서면 상권은 노후 건물 및 협소한 진입로가 많아 사전 현장 실측 시 층고, 수도 배관 위치, 전기 계약 전력 용량 확인이 필수적입니다.",
      },
      {
        heading: "2. 아파트 리모델링 시 단열 및 창호 점검",
        content: "부산 지역 아파트 구축 리모델링 시 결로 및 곰팡이 방지를 위해 외벽 접촉부 단열재 시공과 고효율 로이유리 이중창 교체 시공이 무엇보다 중요합니다.",
      },
      {
        heading: "3. 무료 현장 실측을 통한 사전 리스크 예방",
        content: "지니 인테리어는 부산진구 전포동 본사를 기점으로 부산 전 지역 100% 무료 현장 실측을 통해 사전 구조 진단과 실측 오차 없는 맞춤 상세 견적서를 발행해 드립니다.",
      },
    ],
    content: `1. 전포동 상가 및 카페거리 공사 특수성
부산진구 전포동 카페거리와 서면 상권은 노후 건물 및 협소한 진입로가 많아 사전 현장 실측 시 층고, 수도 배관 위치, 전기 계약 전력 용량 확인이 필수적입니다.

2. 아파트 리모델링 시 단열 및 창호 점검
부산 지역 아파트 구축 리모델링 시 결로 및 곰팡이 방지를 위해 외벽 접촉부 단열재 시공과 고효율 로이유리 이중창 교체 시공이 무엇보다 중요합니다.

3. 무료 현장 실측을 통한 사전 리스크 예방
지니 인테리어는 부산진구 전포동 본사를 기점으로 부산 전 지역 100% 무료 현장 실측을 통해 사전 구조 진단과 실측 오차 없는 맞춤 상세 견적서를 발행해 드립니다.`,
    consumerChecklist: [
      "건물 연식에 따른 배관(급수/배수) 부식 상태 점검",
      "상가 매장인 경우 한전 계약 전력 용량 및 분전함 증설 필요성 확인",
      "외벽 및 베란다 확장부 단열 기밀 시공 여부 확인",
      "욕실/발코니 바닥 2중 우레탄 및 도막 방수 공정 확인",
    ],
  },
];

export const PILLAR_ARTICLES: Record<string, InformationArticleData> = INFORMATION_ARTICLES.reduce(
  (acc, article) => {
    acc[article.slug] = article;
    return acc;
  },
  {} as Record<string, InformationArticleData>
);
