export interface ProjectItem {
  id: string;
  slug?: string; // SEO 고정 영문 슬러그
  isSample: boolean; // 디자인 제안·콘셉트 표시 표지 (true)
  title: string; // 프로젝트명
  location: string; // 지역 (디자인 제안은 제안 지역)
  category: "주거" | "상가·매장" | "카페·음식점" | "사무실" | "공공·교육시설"; // 공간 유형 카테고리
  spaceTypeDetail: string; // 상세 공간 유형 (예: 아파트, 디저트카페, 뷰티숍, IT사무실)
  area: string; // 면적 (예: 32평 / 105m²)
  duration: string; // 예상 공사기간 (예: 3주)
  scope: string; // 제안 공사범위 (예: 전체 리모델링, 목공, 타일, 조명)
  clientRequest: string; // 디자인 방향 또는 고객 요청사항
  beforeImage: string; // 공사 전 또는 콘셉트 기준 이미지
  inProgressImage: string; // 공사 과정 또는 콘셉트 과정 이미지
  afterImages: string[]; // 완공 또는 디자인 콘셉트 이미지들
  description: string; // 프로젝트 설명
  keyFeatures: string[]; // 핵심 포인트 3~4개
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "sample-proj-1",
    isSample: true,
    title: "명륜동 32평 아파트 모던 내추럴 인테리어 디자인 제안",
    location: "부산 동래구 명륜동",
    category: "주거",
    spaceTypeDetail: "32평 (105m²) 주거 아파트",
    area: "32평 / 105m²",
    duration: "예상 3주",
    scope: "전체 리모델링 제안 (철거, 발코니 확장, 목공, 라인조명, 포세린 타일, 강마루, 시스템 에어컨)",
    clientRequest:
      "노후 아파트를 따뜻한 모던 내추럴 톤으로 정리하고, 거실 발코니 확장과 라인조명을 활용해 넓고 정돈된 공간감을 만드는 디자인 방향입니다.",
    beforeImage: "/images/sample_proj_1_before.jpg",
    inProgressImage: "/images/sample_proj_1_progress.jpg",
    afterImages: [
      "/images/sample_proj_1_after_01.jpg",
      "/images/sample_proj_1_after_02.jpg",
      "/images/sample_proj_1_after_03.jpg",
    ],
    description:
      "부산 동래구 명륜동의 30평대 아파트 주거환경을 가정해 구성한 모던 내추럴 인테리어 디자인 제안입니다. 따뜻한 오크 우드와 미색 마감재, 라인조명과 간결한 도어 디자인을 조합해 편안하면서도 정돈된 주거공간을 제안합니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "거실 발코니 단열 확장과 이중창호 구성 제안",
      "마이너스 몰딩과 히든 도어를 활용한 간결한 라인 계획",
      "주방 11자 아일랜드와 수납 중심의 맞춤 가구 구성",
      "욕실 600각 포세린 타일과 일체감 있는 수납 선반 디자인",
    ],
  },
  {
    id: "sample-proj-2",
    isSample: true,
    title: "광안동 로스터리 감성 카페 인테리어 디자인 제안",
    location: "부산 수영구 광안동",
    category: "카페·음식점",
    spaceTypeDetail: "22평 (72m²) 로스터리 카페",
    area: "22평 / 72m²",
    duration: "예상 2.5주",
    scope: "카페 공간 디자인 제안 (파사드, 브루잉 카운터, 콩자갈/마이크로시멘트 바닥, 간접조명, 테라스)",
    clientRequest:
      "광안동 상권과 어울리는 원목 중심의 로스터리 카페를 가정해 브루잉 바, 포토 포인트와 따뜻한 조명을 조합하는 디자인 방향입니다.",
    beforeImage: "/images/sample_proj_2_before.jpg",
    inProgressImage: "/images/sample_proj_2_progress.jpg",
    afterImages: [
      "/images/sample_proj_2_after_01.jpg",
      "/images/sample_proj_2_after_02.jpg",
      "/images/sample_proj_2_after_03.jpg",
    ],
    description:
      "부산 수영구 광안동의 카페 상권을 가정해 외부 파사드부터 내부 좌석과 브루잉 공간까지 연결한 로스터리 카페 디자인 제안입니다. 원목의 깊은 질감과 따뜻한 3000K 조명을 중심으로 머무르고 싶은 분위기를 구성했습니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "에스프레소 머신과 급배수를 고려한 브루잉 바 동선 계획",
      "원목 카운터와 바 좌석을 활용한 체류형 공간 구성",
      "전면 파사드와 따뜻한 포인트 조명을 활용한 입구 디자인",
      "목재 루버를 활용한 시각적 포인트와 음향 환경 고려",
    ],
  },
  {
    id: "sample-proj-3",
    isSample: true,
    title: "전포동 의류·뷰티 부티크 매장 인테리어 디자인 제안",
    location: "부산 부산진구 전포동",
    category: "상가·매장",
    spaceTypeDetail: "18평 (60m²) 로드숍 매장",
    area: "18평 / 60m²",
    duration: "예상 2주",
    scope: "매장 공간 디자인 제안 (파사드, 맞춤 행거/진열장, 에폭시 바닥, 레일 스포트라이트, 드레스룸)",
    clientRequest:
      "전포동의 개성 있는 로드숍 상권을 가정해 화이트 미니멀 배경과 샴페인 골드 디테일로 상품이 돋보이는 부티크 공간을 제안합니다.",
    beforeImage: "/images/sample_proj_3_before.jpg",
    inProgressImage: "/images/sample_proj_3_progress.jpg",
    afterImages: [
      "/images/sample_proj_3_after_01.jpg",
      "/images/sample_proj_3_after_02.jpg",
      "/images/sample_proj_3_after_03.jpg",
    ],
    description:
      "부산 부산진구 전포동의 로드숍 상권을 가정한 의류·뷰티 부티크 매장 디자인 제안입니다. 밝은 바탕과 금속 디테일, 연색성이 높은 스포트 조명을 조합해 상품의 색과 질감이 선명하게 보이는 공간을 구성했습니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "강화유리와 금속 프레임을 활용한 개방형 파사드 제안",
      "벽면과 중앙 진열을 연계한 슬림 행거 시스템 구성",
      "거울과 조명을 활용한 드레스룸·포토존 계획",
      "카운터와 POS 배선을 고려한 깔끔한 집기 배치",
    ],
  },
  {
    id: "sample-proj-4",
    isSample: true,
    title: "센텀 스마트 오피스 인테리어 디자인 제안",
    location: "부산 해운대구 우동·센텀권",
    category: "사무실",
    spaceTypeDetail: "45평 (148m²) 오피스",
    area: "45평 / 148m²",
    duration: "예상 3.5주",
    scope: "스마트 오피스 디자인 제안 (유리 파티션, 회의실 방음, 라운지, 로비 로고월, 플로어 배선, 개별 냉난방)",
    clientRequest:
      "센텀권 업무공간을 가정해 개방형 유리 파티션과 집중 업무공간, 회의실, 임직원 라운지가 자연스럽게 연결되는 스마트 오피스 구성을 제안합니다.",
    beforeImage: "/images/sample_proj_4_before.jpg",
    inProgressImage: "/images/sample_proj_4_progress.jpg",
    afterImages: [
      "/images/sample_proj_4_after_01.jpg",
      "/images/sample_proj_4_after_02.jpg",
      "/images/sample_proj_4_after_03.jpg",
    ],
    description:
      "부산 해운대구 우동·센텀권의 기업 업무환경을 가정해 구성한 스마트 오피스 인테리어 디자인 제안입니다. 블랙 프레임과 유리 파티션, 통신·전원 계획, 우드 톤 라운지를 조합해 개방감과 업무 효율을 함께 고려했습니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "슬림 프레임 유리 파티션과 흡음 회의실 구성",
      "기업 아이덴티티를 보여주는 로비 로고월 디자인",
      "업무 좌석 변화에 대응하는 전원·통신 배선 계획",
      "휴식과 협업을 위한 아일랜드 테이블 중심 라운지 구성",
    ],
  },
  {
    id: "sample-proj-5",
    isSample: true,
    title: "구서동 단독주택 내외부 리모델링 디자인 제안",
    location: "부산 금정구 구서동",
    category: "주거",
    spaceTypeDetail: "2층 단독주택 (총 40평)",
    area: "40평 / 132m²",
    duration: "예상 4주",
    scope: "단독주택 리모델링 제안 (단열 보강, 지붕 방수, 내부 계단, 욕실, 마당 데크)",
    clientRequest:
      "구서동의 오래된 단독주택을 가정해 단열과 방수 같은 기본 성능을 먼저 보완하고, 마당과 실내가 자연스럽게 이어지는 따뜻한 주거공간을 제안합니다.",
    beforeImage: "/images/sample_proj_5_before.jpg",
    inProgressImage: "/images/sample_proj_5_progress.jpg",
    afterImages: [
      "/images/sample_proj_5_after_01.jpg",
      "/images/sample_proj_5_after_02.jpg",
      "/images/sample_proj_5_after_03.jpg",
    ],
    description:
      "부산 금정구 구서동의 오래된 단독주택을 가정한 내외부 리모델링 디자인 제안입니다. 단열·방수·창호 등 주택의 기본 성능을 우선 검토하고, 원목 계단과 마당 데크, 개방감 있는 내부 구성을 통해 편안한 주거환경을 제안합니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "외벽 단열 보강과 고성능 창호를 고려한 외피 계획",
      "1·2층을 연결하는 원목 계단과 안전 난간 디자인",
      "마당과 실내를 이어주는 데크와 외부 조명 구성",
      "노후 주택 특성을 고려한 지붕·슬라브 방수 보강 제안",
    ],
  },
  {
    id: "sample-proj-6",
    isSample: true,
    title: "민락동 브런치·파스타 다이닝 인테리어 디자인 제안",
    location: "부산 수영구 민락동",
    category: "카페·음식점",
    spaceTypeDetail: "28평 (92m²) 레스토랑",
    area: "28평 / 92m²",
    duration: "예상 3주",
    scope: "다이닝 공간 디자인 제안 (상업주방, 홀 붙박이 소파, 미장 벽체, 아치 도어, 간접조명)",
    clientRequest:
      "민락동의 외식 상권을 가정해 따뜻한 미장 질감과 곡선 아치, 낮은 색온도의 조명을 활용한 편안하고 분위기 있는 브런치·파스타 다이닝을 제안합니다.",
    beforeImage: "/images/sample_proj_6_before.jpg",
    inProgressImage: "/images/sample_proj_6_progress.jpg",
    afterImages: [
      "/images/sample_proj_6_after_01.jpg",
      "/images/sample_proj_6_after_02.jpg",
      "/images/sample_proj_6_after_03.jpg",
    ],
    description:
      "부산 수영구 민락동의 다이닝 상권을 가정해 구성한 브런치·파스타 전문점 인테리어 디자인 제안입니다. 미장 질감의 벽체와 곡선 아치, 따뜻한 간접조명을 조합해 식사와 대화에 집중할 수 있는 공간 분위기를 제안합니다. 실제 시공실적과 구분되는 디자인 콘셉트입니다.",
    keyFeatures: [
      "상업주방의 급배수·방수·환기 동선을 고려한 기본 계획",
      "붙박이 소파를 활용한 효율적인 홀 좌석 구성",
      "미장 질감 벽체와 곡선 아치를 활용한 공간 아이덴티티",
      "테이블별 분위기를 조절할 수 있는 디밍 조명 계획",
    ],
  },
];