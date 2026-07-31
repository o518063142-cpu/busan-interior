import { ProjectItem } from "../types";

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "sample-proj-1",
    isSample: true,
    title: "[샘플 프로젝트] 전포동 32평 아파트 모던 내추럴 올 리모델링",
    location: "부산진구 전포동",
    category: "주거",
    spaceTypeDetail: "32평 (105m²) 주거 아파트",
    area: "32평 / 105m²",
    duration: "3주 소요",
    scope: "전체 올 리모델링 (철거, 발코니 확장, 목공, 라인조명, 포세린 타일, 강마루, 시스템 에어컨)",
    clientRequest:
      "어두웠던 노후 구조를 트렌디하고 따뜻한 톤앤매너로 바꾸고, 거실 발코니 확장과 라인 조명으로 넓어 보이는 공간감을 연출해주길 원하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "/src/assets/images/hanshin_hero_bg_1784852933011.jpg",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "부산진구 전포동에 위치한 32평형 아파트 샘플 리모델링 현장입니다. 따뜻한 오크 우드와 미색 마감재를 매치하여 편안하면서도 현대적인 감각을 살렸습니다. 거실과 주방을 잇는 동선에 라인조명과 무몰딩 도어로 극상의 미니멀리즘을 표현하였습니다.",
    keyFeatures: [
      "거실 발코니 무결점 단열 확장 및 이중창호 교체",
      "마이너스 몰딩 및 히든 도어 라인 마감",
      "주방 11자 아일랜드 싱크대 및 인덕션 하부장 맞춤 제작",
      "욕실 600각 포세린 타일 졸리컷 마감 & 졸리컷 수납 선반",
    ],
  },
  {
    id: "sample-proj-2",
    isSample: true,
    title: "[샘플 프로젝트] 서면 전포카페거리 로스터리 감성 카페 인테리어",
    location: "부산진구 전포동 (카페거리)",
    category: "카페·음식점",
    spaceTypeDetail: "22평 (72m²) 로스터리 카페",
    area: "22평 / 72m²",
    duration: "2.5주 소요",
    scope: "상업 공간 전체 시공 (파사드, 브루잉 카운터, 콩자갈/마이크로시멘트 바닥, 간접 조명, 테라스)",
    clientRequest:
      "전포 카페거리 감성에 어우러지는 묵직하면서도 감각적인 원목 카운터 바와, 고객들이 인스타그램 사진을 찍기 좋은 포토존 조명 연출을 요청하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1525438160292-0b0759812b46?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "/src/assets/images/hanshin_commercial_interior_1784852944836.jpg",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "서면 및 전포동 유동인구가 많은 지역의 특성을 반영하여 외부 파사드부터 손님의 시선을 끌 수 있도록 설계한 샘플 카페 인테리어 프로젝트입니다. 원목의 깊은 질감과 따스한 3000K 색온도 조명의 조화가 인상적인 분위기를 완성합니다.",
    keyFeatures: [
      "에스프레소 머신 및 급배수 특수 설비 전용 주방 동선",
      "핸드메이드 원목 브루잉 바 카운터 및 특수 제작 바 스툴",
      "유리 파사드 전면 창호 및 주황빛 입구 포인트 펜던트 조명",
      "방음 및 매장 음향 밸런스를 배려한 벽체 천연 목재 루버",
    ],
  },
  {
    id: "sample-proj-3",
    isSample: true,
    title: "[샘플 프로젝트] 서면 로드숍 의류·뷰티 부티크 매장 인테리어",
    location: "부산진구 서면",
    category: "상가·매장",
    spaceTypeDetail: "18평 (60m²) 로드숍 매장",
    area: "18평 / 60m²",
    duration: "2주 소요",
    scope: "매장 파사드, 맞춤 행거/진열장, 에폭시 라이닝 바닥, 레일 스포트라이트, 드레스룸",
    clientRequest:
      "좁은 평수에서도 의류 상품이 더욱 고급스러워 보이도록 백색 미니멀 바탕에 은은한 샴페인 골드 행거를 세팅하고자 하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "부산 서면 핵심 상권의 의류 및 악세사리 로드숍 샘플 프로젝트입니다. 광택감을 더한 바닥 마감과 선명한演色性(CRI 95+) 스포트 조명을 사용하여 디스플레이된 상품의 색감이 생생히 표현됩니다.",
    keyFeatures: [
      "외부 전면 갈바 프레임 및 투명 강화유리 파사드",
      "벽체 встроенный(내장) 형태 금속 라운드 행거 시스템",
      "고객 편의를 고려한 거울 셀카 포토존 드레스룸 조성",
      "카운터 하부 포스기 및 안전 케이블 은폐 처리",
    ],
  },
  {
    id: "sample-proj-4",
    isSample: true,
    title: "[샘플 프로젝트] 부전동 IT 스타트업 스마트 오피스 인테리어",
    location: "부산진구 부전동",
    category: "사무실",
    spaceTypeDetail: "45평 (148m²) 오피스",
    area: "45평 / 148m²",
    duration: "3.5주 소요",
    scope: "유리 파티션, 대 회의실 방음, 카페테리아 라운지, 로비 로고월, 플로어 배선, 개별 냉난방",
    clientRequest:
      "답답한 격벽 대신 개방감이 넘치는 유리 파티션을 활용하고, 임직원들이 자유롭게 소통할 수 있는 중앙 라운지 카페테리아 조성을 희망하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "부산진구 부전동 소재 오피스 빌딩의 샘플 스마트 오피스 시공 사례입니다. 블랙 스틸 프레임과 통유리를 접목한 회의실, 전 도킹 데스크 통신망 구축, 우드 톤 라운지를 구축하여 혁신적인 기업 분위기를 연출했습니다.",
    keyFeatures: [
      "슬림 프레임 강화유리 도어 및 흡음 회의실 인테리어",
      "기업 C.I를 부각하는 로비 입구 조명 아크릴 로고월",
      "바닥 악세스 플로어 및 3채널 전선 박스 시공",
      "임직원휴식용 아일랜드 식탁 및 원두커피 파트 라운지",
    ],
  },
  {
    id: "sample-proj-5",
    isSample: true,
    title: "[샘플 프로젝트] 가야동 단독주택 내외부 힐링 리모델링",
    location: "부산진구 가야동",
    category: "주거",
    spaceTypeDetail: "2층 단독주택 (총 40평)",
    area: "40평 / 132m²",
    duration: "4주 소요",
    scope: "주택 단열 보강, 지붕 방수, 1/2층 계단 재시공, 2실 욕실 리모델링, 마당 데크 설치",
    clientRequest:
      "오래된 단독주택의 추위와 누수 문제를 완벽히 해결하고, 마당과 연계되는 아늑한 우드 테라스를 갖춘 집으로 재탄생되기를 원하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "부산진구 가야동에 위치한 오래된 구옥 단독주택 샘플 리모델링 현장입니다. 외벽 우레탄 단열 보강과 로이 복층 유리 창호 시공으로 단열 성능을 극대화하고, 내부 천장 박공 구조를 살려 개방감을 배가시켰습니다.",
    keyFeatures: [
      "고성능 아이소핑크 단열재 및 3중 방풍 시스템",
      "1, 2층 원목 내부 계단 및 안전 유리 난간 시공",
      "외부 마당 방부목 데크 및 조경 폴라드 등 설치",
      "주택 특성에맞춘 2단계 슬라브 우레탄 방수 공사",
    ],
  },
  {
    id: "sample-proj-6",
    isSample: true,
    title: "[샘플 프로젝트] 범천동 브런치 다이닝 파스타 전문점 인테리어",
    location: "부산진구 범천동",
    category: "카페·음식점",
    spaceTypeDetail: "28평 (92m²) 레스토랑",
    area: "28평 / 92m²",
    duration: "3주 소요",
    scope: "상업 주방 전체 방수 및 배관, 홀 붙박이 소파, 빈티지 미장 벽체, 아치 도어, 은은한 간접 조명",
    clientRequest:
      "유럽풍 빈티지 미장 벽체와 따뜻한 주황빛 조명으로 데이트 코스에 적합한 로맨틱한 파스타 브런치 레스토랑 연출을 요구하셨습니다.",
    beforeImage:
      "https://images.unsplash.com/photo-1525438160292-0b0759812b46?auto=format&fit=crop&w=800&q=80",
    inProgressImage:
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
    afterImages: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    ],
    description:
      "부산 범천동 지역 상권에 맞춘 샘플 다이닝 레스토랑 인테리어입니다. 유럽 스타일 유럽 미장 벽체 마감과 곡선 아치 포인트를 주어 정갈하면서도 깊이 있는 세련된 식사 공간을 연출했습니다.",
    keyFeatures: [
      "상업용 주방 특수 3중 우레탄 방수 및 스테인리스 닥트 공사",
      "고급 인조가죽 맞춤 제작 홀 붙박이 소파 존 구성",
      "포인트 유럽 미장 특수 기법 벽체 및 아치 게이트",
      "테이블별 독립적 디밍(밝기 조절) 조명 스위칭 시스템",
    ],
  },
];
