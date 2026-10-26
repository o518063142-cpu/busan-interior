// Public supplier estimates only; never import GENE's private cost/margin data.
export const PUBLIC_CATALOG_VERSION = "public-32-2026-10-26-v5";
const checkedAt = "2026-10-26";
export const PUBLIC_SOURCES = {
  wallpaper: { name: "의정부 부부도배사", url: "https://eamu.info/web/service/wallpaper-cost-32py/", region: "의정부·양주", checkedAt, publishedAt: null, vat: "미확인", condition: "공급 32평·천장 포함. 자재·공임·부자재·폐기물·식대 포함. 확장·보수·짐 이동은 현장 확인." },
  premium: { name: "마미견적서 도배", url: "https://www.mommyestimate.com/estimation/papering", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "공급 32평/전용 24평 예시·빈집·미확장·엘리베이터 있음·천장 포함." },
  vinyl: { name: "마미견적서 장판", url: "https://www.mommyestimate.com/estimation/floor/jangpan", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "공급 32평/전용 24평 예시·빈집·미확장·엘리베이터 있음. 기존 바닥 철거·바탕 보수 포함 여부 미확인." },
  wood: { name: "마미견적서 마루", url: "https://www.mommyestimate.com/estimation/floor/maru", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "공급 32평/전용 24평 예시·빈집·미확장·엘리베이터 있음. 기존 바닥 철거·바탕 보수 포함 여부 미확인." },
  bathroom: { name: "마미견적서 욕실", url: "https://www.mommyestimate.com/estimation/bathroom", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "욕실 1개소 예시. 전체철거+방수 항목과 철거비 별도 공통 안내가 함께 있어 실제 철거·폐기·양중 범위 재확인 필요. 욕실 크기·기본 도기 사양 미확인." },
  windows: { name: "마미견적서 창호", url: "https://www.mommyestimate.com/estimation/window", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "아파트/오피스텔 30평대의 내창·외창·내외창 예시. 창별 규격·브랜드·유리·철거·양중은 별도 확인. 32평 모든 현장의 동일 사양을 보장하지 않음." },
  film: { name: "마미견적서 필름", url: "https://www.mommyestimate.com/estimation/firm", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "부위별 수량 1·2·3·5·10개의 공개 시공 예시. 수량별 금액이며 개당 단가로 곱하지 않음. 표에 없는 수량·여러 부위 동시시공·바탕 보수·부속품·철거·양중은 별도 확인." },
  molding: { name: "마미견적서 목공·몰딩", url: "https://www.mommyestimate.com/estimation/molding", region: "서울·경기 공개 예시 · 부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "아파트/오피스텔 방 2·3·4개별 상단/하단 몰딩 예시. 길이당 단가나 전체 목공비가 아님. 짐비·철거비·양중비 제외. 마루 동시시공 하단 몰딩은 별도 이벤트 조건으로 금액 미확인. 제품·길이·실측·VAT 별도 확인." },
  doors: { name: "마미견적서 방문", url: "https://www.mommyestimate.com/estimation/door", region: "서울·경기 공개 예시 · 부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "방문 개당 단가×수량. 다른 시공과 함께 진행하는 조건이며 단독 시공 불가. 실측 필수. 철거·폐기·부속품·문선 마감·규격과 VAT는 별도 확인." },
  kitchen: { name: "마미견적서 싱크대", url: "https://www.mommyestimate.com/estimation/sink", region: "부산 적용 미확인", checkedAt, publishedAt: null, vat: "미확인", condition: "상·하부장·기본 상판·하이드후드·기본 수전/싱크볼 예시. 철거·짐 이동·양중 별도. ㄱ/ㄷ자 연결부 중첩 길이 확인 필요." },
} as const;

export const WALLPAPER_OPTIONS = [
  { id: "keep", label: "기존 유지", price: null, source: null },
  { id: "paper", label: "전체 합지 · 천장 포함", price: 1290000, source: "wallpaper" },
  { id: "silk", label: "전체 실크 · 천장 포함", price: 2010000, source: "wallpaper" },
  { id: "premium", label: "고급 실크 · 천장 포함", price: 3495000, source: "premium" },
] as const;
export const FLOOR_OPTIONS = [
  { id: "keep", label: "기존 유지", price: null, source: null },
  { id: "vinyl18", label: "장판 1.8mm", price: 912000, source: "vinyl" },
  { id: "vinyl22", label: "장판 2.2mm", price: 1320000, source: "vinyl" },
  { id: "vinyl50", label: "장판 5.0mm · LX 엑스컴포트 예시", price: 3150000, source: "vinyl" },
  { id: "wood", label: "일반 강마루 · 동화 나투스강 오리진 예시", price: 2640000, source: "wood" },
  { id: "widewood", label: "직사각형 강마루 · 동화 나투스진 그란데 예시", price: 3312000, source: "wood" },
] as const;
export const BATHROOM_OPTIONS = [
  { id: "keep", label: "기존 유지", price: null },
  { id: "overlay", label: "덧방 기본 공사", price: 3500000 },
  { id: "full", label: "전체 철거 + 방수 기본 공사", price: 4800000 },
  { id: "waterproof", label: "방수만 검토 · 금액 별도 확인", price: null },
] as const;
export const WINDOW_OPTIONS = [
  { id: "unknown", label: "교체 범위를 상담 후 결정", price: null },
  { id: "inner", label: "30평대 내창 교체 예시", price: 6200000 },
  { id: "outer", label: "30평대 외창 교체 예시", price: 6620000 },
  { id: "all", label: "30평대 내창+외창 교체 예시", price: 12140000 },
] as const;
// Values are total published estimates for each exact quantity, not unit rates.
export const FILM_PRICE_TABLES = {
  doors: { 1: 390000, 2: 420000, 3: 510000, 5: 820000, 10: 1590000 },
  shoeCabinets: { 1: 390000, 2: 420000, 3: 510000, 5: 820000, 10: 1590000 },
  entryDoors: { 1: 360000, 2: 370000, 3: 390000, 5: 410000, 10: 740000 },
} as const;
export const FILM_QUANTITY_OPTIONS = [0, 1, 2, 3, 4, 5, 10];
export function filmPrice(part: keyof typeof FILM_PRICE_TABLES, quantity: number): number | null {
  return (FILM_PRICE_TABLES[part] as Record<number, number>)[quantity] ?? null;
}

export const MOLDING_OPTIONS = [
  { id: "unknown", label: "몰딩 범위를 상담 후 결정" },
  { id: "upper", label: "전체 상단 몰딩" },
  { id: "lower", label: "전체 하단 몰딩 / 걸레받이" },
  { id: "both", label: "전체 상단+하단 몰딩" },
] as const;
// One apartment's published total by room count, never multiplied by rooms.
export const MOLDING_PRICES = {
  2: { upper: 650000, lower: 450000, both: 1100000 },
  3: { upper: 700000, lower: 500000, both: 1200000 },
  4: { upper: 900000, lower: 600000, both: 1500000 },
} as const;
export const DOOR_OPTIONS = [
  { id: "unknown", label: "사양을 상담 후 결정", price: null },
  { id: "leaf", label: "문짝만 · 현대 예시", price: 240000 },
  { id: "frame", label: "문짝+문틀 · 현대 예시", price: 450000 },
  { id: "yerim", label: "문짝+문틀 · 예림 예시", price: 520000 },
  { id: "slim", label: "문짝+12mm 문틀 · 예림 예시", price: 560000 },
] as const;
export const EXTRA_WORK_OPTIONS = [
  { id: "keep", label: "유지 / 공사 없음" },
  { id: "work", label: "공사 / 교체 희망" },
  { id: "consult", label: "상담 후 결정" },
] as const;
export const EXTRA_WORK_SCOPES = [
  { id: "demolition", label: "철거·폐기물", detail: "기존 공종에 포함된 철거와 겹치지 않도록 철거 대상·반출·폐기 범위를 확인합니다." },
  { id: "electrical", label: "전기·조명", detail: "조명 수량, 콘센트·스위치 교체, 배선·분전반 공사 범위를 확인합니다." },
  { id: "carpentry", label: "목공·몰딩", detail: "천장·벽체·간접등 박스와 몰딩의 시공 길이·면적을 확인합니다." },
  { id: "doors", label: "방문·문틀", detail: "교체 개수·규격을 확인합니다. 필름도 선택했다면 같은 문인지 구분합니다." },
  { id: "balconyTile", label: "발코니 타일", detail: "시공 면적, 기존 타일 철거·덧방, 방수·배수 상태를 확인합니다." },
  { id: "entranceTile", label: "현관 타일", detail: "시공 면적, 기존 타일 철거·덧방, 현관문 하부 간섭을 확인합니다." },
] as const;
export type ExtraWorkId = typeof EXTRA_WORK_SCOPES[number]["id"];
export type ExtraWorkChoice = typeof EXTRA_WORK_OPTIONS[number]["id"];

export interface PublicSelection32 {
  moldingScope?: string;
  moldingRooms?: number;
  doorSpec?: string;
  doorCount?: number;
  doorsSeparateFromFilm?: boolean;
  extraWork?: Partial<Record<ExtraWorkId, ExtraWorkChoice>>;
  wallpaper: string;
  floor: string;
  bathrooms: Array<{ method: string; largeTile: boolean }>;
  kitchen: boolean;
  kitchenLengthM: number;
  shoeCabinet: boolean;
  windows: boolean;
  film: boolean;
  windowScope?: string;
  filmDoors?: number;
  filmShoeCabinets?: number;
  filmEntryDoors?: number;
  floorRemoval: string;
  occupied: boolean;
  expanded: boolean;
  elevator: boolean;
}
export const defaultPublicSelection = (): PublicSelection32 => ({
  extraWork: {}, moldingScope: "unknown", moldingRooms: 0, doorSpec: "unknown", doorCount: 1, doorsSeparateFromFilm: false,
  wallpaper: "keep", floor: "keep", bathrooms: [{ method: "keep", largeTile: false }, { method: "keep", largeTile: false }],
  kitchen: false, kitchenLengthM: 3, shoeCabinet: false, windows: false, film: false,
  windowScope: "unknown", filmDoors: 0, filmShoeCabinets: 0, filmEntryDoors: 0,
  floorRemoval: "unknown", occupied: false, expanded: false, elevator: true,
});

export function validatePublicSelection(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "선택 조건을 확인해 주세요.";
  const s = value as PublicSelection32;
  if (s.extraWork !== undefined) {
    if (!s.extraWork || typeof s.extraWork !== "object" || Array.isArray(s.extraWork)) return "추가 공사 범위를 확인해 주세요.";
    for (const [key, choice] of Object.entries(s.extraWork)) {
      if (!EXTRA_WORK_SCOPES.some(scope => scope.id === key) || !EXTRA_WORK_OPTIONS.some(option => option.id === choice)) return "추가 공사 범위의 선택이 올바르지 않습니다.";
    }
  }
  if (!MOLDING_OPTIONS.some(o => o.id === (s.moldingScope ?? "unknown"))) return "몰딩 공사 범위를 확인해 주세요.";
  if (s.moldingRooms !== undefined && ![0, 2, 3, 4].includes(s.moldingRooms)) return "몰딩 기준 방 개수를 확인해 주세요.";
  if (s.extraWork?.carpentry !== "work" && ((s.moldingScope && s.moldingScope !== "unknown") || s.moldingRooms)) return "목공·몰딩 공사 선택을 확인해 주세요.";
  if (!DOOR_OPTIONS.some(o => o.id === (s.doorSpec ?? "unknown"))) return "방문 사양을 확인해 주세요.";
  if (s.doorCount !== undefined && (!Number.isInteger(s.doorCount) || s.doorCount < 1 || s.doorCount > 10)) return "방문 수량은 1~10개 정수로 입력해 주세요.";
  if (s.doorsSeparateFromFilm !== undefined && typeof s.doorsSeparateFromFilm !== "boolean") return "문 교체·필름 대상을 확인해 주세요.";
  if (s.extraWork?.doors !== "work" && ((s.doorSpec && s.doorSpec !== "unknown") || s.doorsSeparateFromFilm)) return "방문 교체 선택을 확인해 주세요.";
  if (!WALLPAPER_OPTIONS.some(o => o.id === s.wallpaper) || !FLOOR_OPTIONS.some(o => o.id === s.floor)) return "도배·바닥 선택이 올바르지 않습니다.";
  if (!Array.isArray(s.bathrooms) || s.bathrooms.length !== 2 || s.bathrooms.some(b => !b || !BATHROOM_OPTIONS.some(o => o.id === b.method) || typeof b.largeTile !== "boolean" || (b.largeTile && !["overlay", "full"].includes(b.method)))) return "욕실 공사와 타일 선택을 확인해 주세요.";
  if (["kitchen", "shoeCabinet", "windows", "film", "occupied", "expanded", "elevator"].some(key => typeof s[key as keyof PublicSelection32] !== "boolean")) return "선택 조건이 올바르지 않습니다.";
  if (!["unknown", "none", "vinyl", "wood"].includes(s.floorRemoval)) return "기존 바닥 상태를 확인해 주세요.";
  if (!WINDOW_OPTIONS.some(o => o.id === (s.windowScope ?? "unknown"))) return "샤시 교체 범위를 확인해 주세요.";
  if (!s.windows && s.windowScope && s.windowScope !== "unknown") return "샤시 교체 선택을 확인해 주세요.";
  for (const count of [s.filmDoors, s.filmShoeCabinets, s.filmEntryDoors]) {
    if (count !== undefined && (!Number.isInteger(count) || count < 0 || count > 20)) return "필름 수량은 0~20 사이 정수로 입력해 주세요.";
    if (!s.film && count) return "필름 공사 선택을 확인해 주세요.";
  }
  if (s.shoeCabinet && s.filmShoeCabinets) return "같은 신발장의 교체와 필름 시공을 동시에 계산할 수 없습니다.";
  if (!Number.isFinite(s.kitchenLengthM) || s.kitchenLengthM < 1 || s.kitchenLengthM > 12) return "주방 길이는 1~12m 사이로 입력해 주세요.";
  return null;
}

export function calculatePublicSelection(value: unknown) {
  const error = validatePublicSelection(value);
  if (error) throw new Error(error);
  const s = value as PublicSelection32;
  const items: Array<{ id: string; label: string; amount: number; source: keyof typeof PUBLIC_SOURCES; quantity: number; includes: string[] }> = [];
  const pending: string[] = [];
  const add = (id: string, label: string, amount: number, source: keyof typeof PUBLIC_SOURCES, quantity = 1, includes: string[] = []) => items.push({ id, label, amount, source, quantity, includes });
  const wall = WALLPAPER_OPTIONS.find(o => o.id === s.wallpaper)!;
  if (wall.id !== "keep") add("wallpaper", wall.label, wall.price!, wall.source!, 1, ["천장 도배"]);
  const floor = FLOOR_OPTIONS.find(o => o.id === s.floor)!;
  if (floor.id !== "keep") {
    add("floor", floor.label, floor.price!, floor.source!);
    if (s.floorRemoval !== "none") pending.push(s.floorRemoval === "unknown" ? "기존 바닥 철거·폐기·바탕 보수 필요 여부" : "기존 바닥 철거·폐기·바탕 보수 비용");
  }
  s.bathrooms.forEach((bath, i) => {
    const option = BATHROOM_OPTIONS.find(o => o.id === bath.method)!;
    if (bath.method === "keep") return;
    if (bath.method === "waterproof") { pending.push(`욕실 ${i + 1} 방수 공사 범위·금액`); return; }
    add(`bathroom-${i}`, `욕실 ${i + 1} · ${option.label}`, option.price!, "bathroom", 1, bath.method === "full" ? ["철거+방수 패키지(원문 예시)"] : []);
    if (bath.largeTile) add(`bathroom-tile-${i}`, `욕실 ${i + 1} · 전체 600×600 타일 추가`, 800000, "bathroom");
    // Do not add demolition/waterproofing prices a second time to a full package.
    pending.push(`욕실 ${i + 1} 크기·도기 사양 및 철거·폐기·양중 포함 범위`);
    if (bath.method === "overlay") pending.push(`욕실 ${i + 1} 덧방 가능 여부·기존 방수 상태`);
  });
  if (s.kitchen) {
    const millimeters = Math.round(s.kitchenLengthM * 1000);
    add("kitchen", `주방 기본 구성 · ${(millimeters / 1000).toFixed(1)}m`, millimeters * 900, "kitchen", millimeters, ["상·하부장", "기본 상판·후드·수전·싱크볼"]);
    pending.push("주방 기존 가구 철거·폐기·양중·설비 연결 비용과 꺾임 구간 길이");
  }
  if (s.shoeCabinet) pending.push("신발장 교체 · 크기·사양·판매가격 확인");
  if (s.windows) {
    const window = WINDOW_OPTIONS.find(o => o.id === (s.windowScope ?? "unknown"))!;
    if (window.price !== null) add("windows", window.label, window.price, "windows", 1, ["평형대별 원문 시공 예시"]);
    pending.push(window.price === null ? "샷시 교체 · 창별 규격·유리·설치가격 확인" : "샷시 교체 · 창 개수·실측·브랜드·유리·철거·양중 범위 확인");
  }
  if (s.film) {
    const parts = [
      { key: "doors" as const, count: s.filmDoors ?? 0, label: "문·문틀" },
      { key: "shoeCabinets" as const, count: s.filmShoeCabinets ?? 0, label: "신발장" },
      { key: "entryDoors" as const, count: s.filmEntryDoors ?? 0, label: "현관문 안쪽" },
    ];
    for (const part of parts.filter(p => p.count > 0)) {
      const amount = filmPrice(part.key, part.count);
      if (amount === null) pending.push(`필름 ${part.label} ${part.count}개 · 원문 수량별 가격 없음`);
      else add(`film-${part.key}`, `필름 ${part.label} · ${part.count}개`, amount, "film", part.count, ["부위별 수량 합계 예시"]);
    }
    if (parts.every(p => p.count === 0)) pending.push("필름 · 시공 부위·면적·가격 확인");
    else pending.push("필름 · 실제 대상 규격·표면 보수·부속품 및 여러 부위 동시시공 금액 확인");
  }
  let pricedMolding = false;
  if (s.extraWork?.carpentry === "work") {
    const scope = s.moldingScope ?? "unknown";
    const rooms = s.moldingRooms ?? 0;
    if (scope !== "unknown" && rooms > 0) {
      const prices = MOLDING_PRICES[rooms as keyof typeof MOLDING_PRICES];
      const withWood = ["wood", "widewood"].includes(s.floor);
      const pricedScope = withWood && scope === "both" ? "upper" : scope;
      if (!(withWood && scope === "lower")) {
        add("molding", `방 ${rooms}개 · ${MOLDING_OPTIONS.find(o => o.id === pricedScope)!.label} 예시`, prices[pricedScope as keyof typeof prices], "molding", 1, ["방 개수별 전체 몰딩 예시"]);
        pricedMolding = true;
        pending.push("몰딩 · 실측 길이·제품·기존 몰딩 철거·짐 이동·양중·마감 확인");
      }
      if (withWood && ["lower", "both"].includes(scope)) pending.push("하단 몰딩 · 마루 동시시공 이벤트 조건·포함 범위·금액 미확인 · 소계 제외");
    }
  }
  let pricedDoors = false;
  if (s.extraWork?.doors === "work") {
    const door = DOOR_OPTIONS.find(o => o.id === (s.doorSpec ?? "unknown"))!;
    const overlappingFilm = s.film && (s.filmDoors ?? 0) > 0 && !s.doorsSeparateFromFilm;
    if (overlappingFilm) pending.push("방문 교체와 문·문틀 필름의 대상 구분 필요 · 문 교체 금액은 소계에서 제외");
    if (door.price !== null && !overlappingFilm) {
      if (items.length > 0) {
        add("doors", `${door.label} · ${s.doorCount ?? 1}개`, door.price * (s.doorCount ?? 1), "doors", s.doorCount ?? 1, ["다른 공종 동시시공 조건의 방문 공개 예시"]);
        pricedDoors = true;
        pending.push("방문 · 실측·규격·철거·폐기·부속품·문선 마감과 동시시공 조건 확인");
      } else pending.push("방문 · 원문은 다른 공종 동시시공 조건 · 단독 선택 금액은 별도 확인");
    }
  }
  const scopeChoices = EXTRA_WORK_SCOPES.map(scope => ({ id: scope.id, label: scope.label, choice: s.extraWork?.[scope.id] ?? "keep" }));
  for (const scope of scopeChoices) {
    if (scope.id === "doors" && pricedDoors) continue;
    if (scope.id === "carpentry" && pricedMolding) {
      pending.push("목공 · 선택 몰딩 외 천장·벽체·등박스 등의 공사 필요 여부와 금액 확인");
      continue;
    }
    if (scope.choice !== "keep") pending.push(`${scope.label} · ${scope.choice === "work" ? "공사/교체 희망" : "상담 후 결정"} · 범위·수량·금액 확인`);
  }
  const selectedCount = items.length + pending.length;
  if (selectedCount && s.occupied) pending.push("거주 중 가구 이동·보양 추가비");
  if (selectedCount && s.expanded) pending.push("확장 구조에 따른 실제 시공 면적·가격");
  if (selectedCount && !s.elevator) pending.push("계단 운반·양중 조건과 추가비");
  return {
    version: PUBLIC_CATALOG_VERSION,
    area: { supplyPyung: 32, exampleExclusivePyung: 24 },
    items,
    scopeChoices,
    moldingSelection: { scope: s.moldingScope ?? "unknown", rooms: s.moldingRooms ?? 0 },
    doorSelection: { spec: s.doorSpec ?? "unknown", count: s.extraWork?.doors === "work" ? s.doorCount ?? 1 : 0, separateFromFilm: s.doorsSeparateFromFilm ?? false },
    sourceIds: [...new Set(items.map(i => i.source))],
    pending: [...new Set(pending)],
    subtotalWon: items.length ? items.reduce((sum, item) => sum + item.amount, 0) : null,
    hasSelection: selectedCount > 0,
    totalIsComplete: false,
    vatStatus: "source_unverified" as const,
    notice: "공개된 타 업체 가격의 참고 소계입니다. 부산 현장 적용·부가세·선택 공종의 부대비용은 별도 확인이 필요하며 지니 인테리어의 확정 판매가격이 아닙니다.",
  };
}
export function formatWon(amount: number) { return `${amount.toLocaleString("ko-KR")}원`; }
export function publicSelectionSummary(selection: PublicSelection32, quote: ReturnType<typeof calculatePublicSelection>) {
  return ["[32평 공종 선택형 공개가격 참고]", `조건: ${selection.occupied ? "거주 중" : "빈집"} / ${selection.expanded ? "확장" : "미확장"} / 엘리베이터 ${selection.elevator ? "있음" : "없음"}`,
    ...EXTRA_WORK_SCOPES.map(scope => `${scope.label}: ${EXTRA_WORK_OPTIONS.find(o => o.id === (selection.extraWork?.[scope.id] ?? "keep"))!.label}`),
    ...(selection.extraWork?.carpentry === "work" ? [`몰딩 상세: ${MOLDING_OPTIONS.find(o => o.id === (selection.moldingScope ?? "unknown"))!.label} / 방 ${selection.moldingRooms || "개수 미확인"}${selection.moldingRooms ? "개" : ""}`] : []),
    ...(selection.extraWork?.doors === "work" ? [`방문 상세: ${DOOR_OPTIONS.find(o => o.id === (selection.doorSpec ?? "unknown"))!.label} / ${selection.doorCount ?? 1}개 / 필름과 다른 대상 확인: ${selection.doorsSeparateFromFilm ? "예" : "미확인"}`] : []),
    ...quote.items.map(i => `${i.label}: ${formatWon(i.amount)}`),
    `가격 확인 항목 소계: ${quote.subtotalWon === null ? "산출 항목 없음" : formatWon(quote.subtotalWon)}`,
    `금액 별도 확인: ${quote.pending.join(", ") || "선택 공종의 부대비용·현장 조건"}`, quote.notice, `기준표: ${quote.version}`].join("\n");
}
