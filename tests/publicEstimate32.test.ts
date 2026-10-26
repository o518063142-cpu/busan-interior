import test from "node:test";
import assert from "node:assert/strict";
import { defaultPublicSelection, calculatePublicSelection, validatePublicSelection, publicSelectionSummary, defaultMoldingSpace, getMoldingReference, PUBLIC_SOURCES } from "../shared/publicEstimate32.ts";
import handler from "../api/ai-estimate.ts";

test("선택이 없거나 가격 미확인 항목만 있으면 0원 견적으로 표시하지 않는다", () => {
  assert.equal(calculatePublicSelection(defaultPublicSelection()).subtotalWon, null);
  const quote = calculatePublicSelection({ ...defaultPublicSelection(), windows: true, shoeCabinet: true });
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.hasSelection, true);
  assert.equal(quote.pending.length, 2);
});
test("공개 도배·바닥 선택 금액을 정확히 합산하고 교체 시 이전 항목을 제거한다", () => {
  const first = calculatePublicSelection({ ...defaultPublicSelection(), wallpaper: "paper", floor: "vinyl18" });
  assert.equal(first.subtotalWon, 2202000);
  const changed = calculatePublicSelection({ ...defaultPublicSelection(), wallpaper: "silk", floor: "wood" });
  assert.equal(changed.subtotalWon, 4650000);
  assert.equal(changed.items.filter(i => i.id === "floor").length, 1);
  assert.ok(changed.pending.some(p => p.includes("기존 바닥")));
});
test("전체 철거+방수 욕실은 하나의 패키지이며 타일 추가만 한 번 더한다", () => {
  const selection = defaultPublicSelection();
  selection.bathrooms[0] = { method: "full", largeTile: true };
  const quote = calculatePublicSelection(selection);
  assert.equal(quote.subtotalWon, 5600000);
  assert.equal(quote.items.length, 2);
  assert.ok(quote.pending.some(p => p.includes("철거·폐기")));
  selection.bathrooms[1] = { method: "overlay", largeTile: false };
  assert.equal(calculatePublicSelection(selection).subtotalWon, 9100000);
});
test("방수만 선택하면 임의 금액을 만들지 않고 유지 욕실에 타일 추가를 허용하지 않는다", () => {
  const selection = defaultPublicSelection();
  selection.bathrooms[0].method = "waterproof";
  assert.equal(calculatePublicSelection(selection).subtotalWon, null);
  selection.bathrooms[0] = { method: "keep", largeTile: true };
  assert.ok(validatePublicSelection(selection));
});
test("주방은 원문의 1mm당 900원으로 계산하고 별도 철거비는 누락 상태로 남긴다", () => {
  for (const [length, total] of [[3, 2700000], [6, 5400000], [3.6, 3240000]]) {
    const quote = calculatePublicSelection({ ...defaultPublicSelection(), kitchen: true, kitchenLengthM: length });
    assert.equal(quote.subtotalWon, total);
    assert.ok(quote.pending.some(p => p.includes("주방 기존 가구 철거")));
  }
});
test("거주·확장·계단 조건에는 근거 없는 가산율을 적용하지 않는다", () => {
  const quote = calculatePublicSelection({ ...defaultPublicSelection(), wallpaper: "paper", occupied: true, expanded: true, elevator: false });
  assert.equal(quote.subtotalWon, 1290000);
  assert.equal(quote.pending.length, 3);
  assert.equal(quote.totalIsComplete, false);
  assert.equal(quote.vatStatus, "source_unverified");
  quote.sourceIds.forEach(id => assert.equal(PUBLIC_SOURCES[id].checkedAt, "2026-10-26"));
});
test("알 수 없는 ID, 잘못된 개수·수량·불리언을 서버 경계에서 거부한다", () => {
  for (const patch of [{ floor: "free" }, { wallpaper: "fake" }, { kitchenLengthM: -1 }, { kitchenLengthM: "3" }, { bathrooms: [] }, { windows: "true" }]) {
    assert.ok(validatePublicSelection({ ...defaultPublicSelection(), ...patch }));
  }
});
test("API는 조작된 소계를 무시하고 서버 기준으로 다시 계산한다", async () => {
  let status = 200; let payload: any;
  const res = { setHeader() {}, status(code: number) { status = code; return this; }, json(value: unknown) { payload = value; return this; } };
  await handler({ method: "POST", query: {}, body: { publicSelection: { ...defaultPublicSelection(), wallpaper: "silk", subtotalWon: 1 }, subtotalWon: 1 } } as any, res as any);
  assert.equal(status, 200);
  assert.equal(payload.source, "public-reference");
  assert.equal(payload.data.subtotalWon, 2010000);
  await handler({ method: "POST", query: {}, body: { publicSelection: defaultPublicSelection() } } as any, res as any);
  assert.equal(status, 400);
});

test("샤시 내외창은 원문의 묶음 가격을 사용하고 두 항목을 중복 합산하지 않는다", () => {
  for (const [windowScope, amount] of [["inner", 6200000], ["outer", 6620000], ["all", 12140000]] as const) {
    const quote = calculatePublicSelection({ ...defaultPublicSelection(), windows: true, windowScope });
    assert.equal(quote.subtotalWon, amount);
    assert.equal(quote.items.length, 1);
    assert.equal(quote.items[0].source, "windows");
    assert.ok(quote.pending.some(p => p.includes("유리·철거·양중")));
  }
});

test("필름 수량별 가격을 개당 가격으로 곱하거나 원문 밖 수량으로 보간하지 않는다", () => {
  for (const [count, amount] of [[1, 390000], [2, 420000], [3, 510000], [5, 820000], [10, 1590000]]) {
    const quote = calculatePublicSelection({ ...defaultPublicSelection(), film: true, filmDoors: count });
    assert.equal(quote.subtotalWon, amount);
    assert.equal(quote.items[0].quantity, count);
  }
  const unknown = calculatePublicSelection({ ...defaultPublicSelection(), film: true, filmDoors: 4 });
  assert.equal(unknown.subtotalWon, null);
  assert.ok(unknown.pending.some(p => p.includes("원문 수량별 가격 없음")));
});

test("필름 부위별 소계와 묶음 확인 항목을 보존한다", () => {
  const quote = calculatePublicSelection({ ...defaultPublicSelection(), film: true, filmDoors: 3, filmEntryDoors: 1 });
  assert.equal(quote.subtotalWon, 870000);
  assert.equal(quote.items.length, 2);
  assert.ok(quote.pending.some(p => p.includes("여러 부위")));
  assert.equal(quote.totalIsComplete, false);
});

test("신발장 교체와 필름 중복, 비활성 공사 수량, 잘못된 수량을 거부한다", () => {
  for (const patch of [
    { shoeCabinet: true, film: true, filmShoeCabinets: 1 },
    { film: false, filmDoors: 1 }, { film: true, filmDoors: -1 },
    { film: true, filmDoors: 1.5 }, { film: true, filmDoors: 21 },
    { windows: false, windowScope: "all" }, { windows: true, windowScope: "fake" },
  ]) assert.ok(validatePublicSelection({ ...defaultPublicSelection(), ...patch }));
});

test("기존 v1 선택에는 새 가격을 임의 추가하지 않는다", () => {
  const legacy = defaultPublicSelection();
  delete legacy.windowScope; delete legacy.filmDoors;
  delete legacy.filmShoeCabinets; delete legacy.filmEntryDoors;
  legacy.windows = true; legacy.film = true;
  const quote = calculatePublicSelection(legacy);
  assert.equal(quote.subtotalWon, null);
  assert.ok(quote.pending.some(p => p.includes("샷시")));
  assert.ok(quote.pending.some(p => p.includes("필름")));
});


test("추가 공사만 선택해도 0원 대신 금액 확인 대상으로 접수 가능하다", () => {
  const selection = { ...defaultPublicSelection(), extraWork: { demolition: "work", electrical: "consult" } } as const;
  const quote = calculatePublicSelection(selection);
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.hasSelection, true);
  assert.equal(quote.pending.length, 2);
  assert.match(publicSelectionSummary(selection, quote), /전기·조명: 상담 후 결정/);
  assert.match(publicSelectionSummary(selection, quote), /목공·몰딩: 유지 \/ 공사 없음/);
});
test("추가 공사 확인 대상은 기존 소계를 바꾸거나 철거비를 중복 가산하지 않는다", () => {
  const selection = defaultPublicSelection();
  selection.bathrooms[0].method = "full";
  selection.extraWork = { demolition: "work", carpentry: "consult", doors: "work", balconyTile: "work", entranceTile: "consult" };
  const quote = calculatePublicSelection(selection);
  assert.equal(quote.subtotalWon, 4800000);
  assert.equal(quote.scopeChoices.filter(s => s.choice !== "keep").length, 5);
  selection.extraWork = {};
  assert.ok(!calculatePublicSelection(selection).pending.some(p => p.includes("공사/교체 희망")));
});
test("추가 공사 잘못된 값은 거부하고 이전 버전 입력은 호환한다", () => {
  for (const extraWork of [null, [], "work", { unknown: "work" }, { doors: "bad" }]) {
    assert.ok(validatePublicSelection({ ...defaultPublicSelection(), extraWork }));
  }
  const selection = defaultPublicSelection();
  delete selection.extraWork;
  const quote = calculatePublicSelection(selection);
  assert.equal(quote.hasSelection, false);
  assert.ok(quote.scopeChoices.every(s => s.choice === "keep"));
});


test("방문은 사양별 단가×수량이며 다른 공종과 함께일 때만 참고 소계에 더한다", () => {
  for (const [doorSpec, unit] of [["leaf",240000],["frame",450000],["yerim",520000],["slim",560000]] as const) {
    const s = { ...defaultPublicSelection(), wallpaper: "silk", extraWork: { doors: "work" as const }, doorSpec, doorCount: 3 };
    assert.equal(calculatePublicSelection(s).subtotalWon, 2010000 + unit * 3);
    assert.equal(calculatePublicSelection({ ...s, wallpaper: "keep" }).subtotalWon, null);
  }
});
test("문 교체와 필름 대상 구분 전에는 교체를 합산하지 않고 확인 후에만 더한다", () => {
  const s = { ...defaultPublicSelection(), film: true, filmDoors: 3, extraWork: { doors: "work" as const }, doorSpec: "frame", doorCount: 2 };
  assert.equal(calculatePublicSelection(s).subtotalWon, 510000);
  assert.equal(calculatePublicSelection({ ...s, doorsSeparateFromFilm: true }).subtotalWon, 1410000);
  assert.match(publicSelectionSummary(s, calculatePublicSelection(s)), /방문 상세:.*2개/);
});
test("방문 상세는 잘못된 사양·수량·상태를 거부하고 이전 선택값은 유지한다", () => {
  for (const patch of [{ doorSpec: "invalid" }, { doorCount: 0 }, { doorCount: 1.2 }, { doorCount: 11 }, { doorsSeparateFromFilm: "yes" }, { doorSpec: "frame" }]) assert.ok(validatePublicSelection({ ...defaultPublicSelection(), ...patch }));
  const s = defaultPublicSelection(); delete s.doorSpec; delete s.doorCount; delete s.doorsSeparateFromFilm;
  assert.equal(calculatePublicSelection(s).subtotalWon, null);
});


test("거실·주방·복도·방별 천장과 걸레받이를 별도로 저장하고 임의 가격은 만들지 않는다", () => {
  const s = defaultPublicSelection();
  s.extraWork = { carpentry: "work" };
  s.moldingBySpace = {
    living: { ceiling: { method: "replace", lengthM: 18.5 }, baseboard: { method: "keep", lengthM: null } },
    kitchen: { ceiling: { method: "film", lengthM: 7 }, baseboard: { method: "consult", lengthM: null } },
    hall: { ceiling: { method: "remove", lengthM: 5 }, baseboard: { method: "remove", lengthM: null } },
    room1: defaultMoldingSpace(), room6: defaultMoldingSpace(),
  };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.hasSelection, true);
  assert.equal(quote.moldingSelection.spaces.length, 5);
  assert.ok(!quote.pending.some(p => p.startsWith("거실 걸레받이")));
  const summary = publicSelectionSummary(s, quote);
  assert.match(summary, /몰딩 상세: 거실 \/ 천장 몰딩 \/ 교체 \/ 18.5m/);
  assert.match(summary, /몰딩 상세: 거실 \/ 걸레받이 \/ 기존 유지 \/ 길이 미확인/);
  assert.match(summary, /복도 \/ 걸레받이 \/ 철거 후 걸레받이 없이 마감 검토/);
  assert.match(summary, /방 6/);
});
test("공간별 몰딩은 기존 공개 소계를 바꾸거나 마루와 중복 합산하지 않는다", () => {
  const s = { ...defaultPublicSelection(), wallpaper: "silk", floor: "wood", extraWork: { carpentry: "work" as const }, moldingBySpace: { living: defaultMoldingSpace() } };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, 4650000);
  assert.ok(!quote.items.some(i => i.id === "molding"));
  assert.ok(!quote.sourceIds.includes("molding"));
  const spaces = { ...s.moldingBySpace }; delete (spaces as any).living;
  assert.equal(calculatePublicSelection({ ...s, moldingBySpace: spaces }).moldingSelection.spaces.length, 0);
});
test("몰딩 길이 미확인은 null이며 잘못된 공간·부위·방식·길이는 거부한다", () => {
  const s = { ...defaultPublicSelection(), extraWork: { carpentry: "work" as const } };
  for (const moldingBySpace of [null, [], { unknown: defaultMoldingSpace() }, { living: {} }, { living: [] }, { living: { ...defaultMoldingSpace(), wall: {} } },
    ...[-1, 0, 201, 1/0, NaN, "5"].map(lengthM => ({ living: { ...defaultMoldingSpace(), ceiling: { method: "replace", lengthM } } })),
    { living: { ...defaultMoldingSpace(), ceiling: { method: "invalid", lengthM: null } } },
    { living: { ...defaultMoldingSpace(), ceiling: { method: "keep", lengthM: 5 } } },
  ]) assert.ok(validatePublicSelection({ ...s, moldingBySpace }));
  assert.equal(validatePublicSelection({ ...s, moldingBySpace: { living: defaultMoldingSpace() } }), null);
  assert.ok(validatePublicSelection({ ...defaultPublicSelection(), moldingBySpace: { living: defaultMoldingSpace() } }));
});
test("이전 방 개수별 선택은 읽되 새 공간에 배분하거나 예전 가격을 재가산하지 않는다", () => {
  const s = { ...defaultPublicSelection(), extraWork: { carpentry: "work" as const }, moldingScope: "both", moldingRooms: 3 };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, null);
  assert.deepEqual(quote.moldingSelection.legacyReference, { scope: "both", rooms: 3 });
  assert.deepEqual(quote.moldingSelection.spaces, []);
  assert.ok(quote.pending.some(p => p.includes("이전 방 개수별")));
  assert.ok(validatePublicSelection({ ...s, moldingBySpace: { living: defaultMoldingSpace() } }));
});
test("공간별 선택 없는 이전 입력은 미확인 공사나 가격을 새로 만들지 않는다", () => {
  const old = defaultPublicSelection();
  delete old.moldingBySpace; delete old.moldingScope; delete old.moldingRooms;
  const quote = calculatePublicSelection(old);
  assert.equal(quote.hasSelection, false);
  assert.equal(quote.subtotalWon, null);
});
test("서버 API는 공간별 몰딩을 보존하고 전달된 공간 가격을 신뢰하지 않는다", async () => {
  const selection = { ...defaultPublicSelection(), extraWork: { carpentry: "work" as const }, moldingBySpace: { living: defaultMoldingSpace() } };
  let payload: any; let status = 200;
  const res = { setHeader() {}, status(code: number) { status = code; return this; }, json(value: unknown) { payload = value; return this; } };
  await handler({ method: "POST", query: {}, body: { publicSelection: { ...selection, subtotalWon: 1234 }, subtotalWon: 1234 } } as any, res as any);
  assert.equal(status, 200);
  assert.equal(payload.data.subtotalWon, null);
  assert.equal(payload.data.moldingSelection.spaces[0].label, "거실");
  assert.equal(payload.data.moldingSelection.spaces[0].parts[0].lengthM, null);
});


test("몰딩 교체 자재 예시와 기존 필름 시공 단가를 구분하고 원문·VAT를 보존한다", () => {
  const paint = getMoldingReference("ceiling", "replace")!;
  assert.equal(paint.minWonPerM, 8000); assert.equal(paint.maxWonPerM, 15000);
  assert.equal(paint.vat, "미확인"); assert.match(paint.label, /도장 평몰딩/);
  const pvc = getMoldingReference("baseboard", "replace")!;
  assert.equal(pvc.minWonPerM, 4000); assert.equal(pvc.maxWonPerM, 8000);
  const film = getMoldingReference("ceiling", "film")!;
  assert.equal(film.minWonPerM, 10000); assert.equal(film.maxWonPerM, 20000);
  assert.equal(film.vat, "별도"); assert.match(film.url, /mokdonginterior/);
  for (const method of ["keep", "remove", "consult"] as const) assert.equal(getMoldingReference("ceiling", method), null);
  assert.equal(getMoldingReference("baseboard", "film"), null);
});
test("길이가 있어도 몰딩 참고범위를 곱하거나 평균내거나 전체 소계에 섞지 않는다", () => {
  const s = { ...defaultPublicSelection(), wallpaper: "paper", extraWork: { carpentry: "work" as const }, moldingBySpace: {
    living: { ceiling: { method: "replace" as const, lengthM: 18.5 }, baseboard: { method: "replace" as const, lengthM: 16 } },
    kitchen: { ceiling: { method: "film" as const, lengthM: 7 }, baseboard: { method: "film" as const, lengthM: 5 } },
  } };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, 1290000);
  assert.equal(quote.items.length, 1);
  assert.equal(quote.moldingReferences.length, 3);
  assert.equal(quote.moldingSelection.spaces[1].parts[1].reference, null);
  assert.ok(quote.moldingReferences.every(reference => reference.excludedFromSubtotal && reference.exampleOnly));
  assert.ok(!quote.sourceIds.includes("moldingPaintPvc"));
  assert.ok(quote.moldingReferenceSourceIds.includes("moldingPaintPvc"));
  assert.match(publicSelectionSummary(s, quote), /몰딩 공개 단가 참고 \(소계 제외·예시 사양\)/);
  assert.match(publicSelectionSummary(s, quote), /최소 시공비 미확인/);
});
test("미입력 길이에도 단가 참고만 남기고 가격을 조작한 새 필드는 거부한다", () => {
  const s = { ...defaultPublicSelection(), extraWork: { carpentry: "work" as const }, moldingBySpace: { living: { ...defaultMoldingSpace(), ceiling: { method: "replace" as const, lengthM: null } } } };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.moldingReferences.length, 1);
  assert.equal(quote.moldingSelection.spaces[0].parts[0].lengthM, null);
  assert.ok(validatePublicSelection({ ...s, moldingBySpace: { living: { ...s.moldingBySpace.living, ceiling: { ...s.moldingBySpace.living.ceiling, minWonPerM: 1 } } } }));
});


test("전체 철거 참고는 부분·미확인 범위에 적용하지 않고 욕실 패키지 중복을 안내한다", () => {
  const s = defaultPublicSelection(); s.extraWork = { demolition: "work" }; s.bathrooms[0].method = "full";
  for (const demolitionScope of ["unknown", "partial"]) assert.equal(calculatePublicSelection({ ...s, demolitionScope }).additionalWorkReferences.length, 0);
  const quote = calculatePublicSelection({ ...s, demolitionScope: "whole" });
  assert.equal(quote.subtotalWon, 4800000);
  assert.equal(quote.additionalWorkReferences[0].minWon, 2500000);
  assert.equal(quote.additionalWorkReferences[0].maxWon, 4500000);
  assert.match(quote.demolitionOverlapChecks[0], /욕실 1.*중복 확인/);
  assert.equal(quote.additionalWorkReferences[0].vat, "별도");
});
test("조명 작업별 자재 포함 참고와 단위·제외 조건을 구분하며 배선 전체 가격은 만들지 않는다", () => {
  const s = { ...defaultPublicSelection(), extraWork: { electrical: "work" as const }, electricalWorks: ["existing", "downlight", "indirect", "circuits", "rewiring"] };
  const quote = calculatePublicSelection(s);
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.additionalWorkReferences.length, 4);
  assert.deepEqual(quote.additionalWorkReferences.map(r => r.unit), ["30평대 전체", "개", "m", "개소"]);
  assert.ok(quote.additionalWorkReferences.every(r => r.excludedFromSubtotal && r.vat === "별도"));
  assert.ok(quote.pending.some(p => p.includes("전체 배선·분전반")));
  assert.match(publicSelectionSummary(s, quote), /추가 공사 공개 참고 \(소계 제외\)/);
  assert.ok(!quote.sourceIds.includes("lightingReference"));
});
test("비활성 공사 상세·잘못된 ID·중복 작업은 거부한다", () => {
  for (const patch of [{ demolitionScope: "whole" },{ demolitionScope: "fake" },{ electricalWorks: ["existing"] },{ electricalWorks: null },{ electricalWorks: "existing" },{ extraWork:{ electrical:"work" },electricalWorks:["fake"] },{ extraWork:{ electrical:"work" },electricalWorks:["existing","existing"] }]) assert.ok(validatePublicSelection({ ...defaultPublicSelection(), ...patch }));
});
test("이전 입력에 철거·전기 참고를 임의 추가하지 않고 선택 해제 시 제거한다", () => {
  const old = defaultPublicSelection(); delete old.demolitionScope; delete old.electricalWorks;
  assert.equal(calculatePublicSelection(old).additionalWorkReferences.length, 0);
  const s = { ...old, wallpaper:"paper", extraWork:{electrical:"work" as const}, electricalWorks:["downlight"] };
  assert.equal(calculatePublicSelection(s).subtotalWon,1290000);
  assert.equal(calculatePublicSelection(s).additionalWorkReferences.length,1);
  assert.equal(calculatePublicSelection({ ...s,electricalWorks:[] }).additionalWorkReferences.length,0);
});

test("지니 가구 기준은 출처를 분리하고 길이와 마감 선택을 보존한다", () => {
  const base = { ...defaultPublicSelection(), furnitureBasis: "gene" as const, kitchen: true, kitchenLengthM: 6, kitchenFinish: "pet" as const, shoeCabinet: true, shoeCabinetLengthM: 1.2, shoeCabinetFinish: "highgloss" as const, wallpaper: "paper" };
  const q = calculatePublicSelection(base);
  assert.equal(q.geneSubtotalWon, 6720000);
  assert.equal(q.publicSubtotalWon, 1290000);
  assert.equal(q.subtotalWon, 8010000);
  assert.equal(q.items.find(i => i.id === "kitchen")?.source, "geneFurniture");
  assert.deepEqual(q.items.find(i => i.id === "kitchen")?.includes, ["상·하부장", "기본 상판"]);
  assert.match(publicSelectionSummary(base, q), /PET/);
  assert.match(publicSelectionSummary(base, q), /하이그로시/);
  assert.match(q.pending.join(" "), /부가세/);
  assert.equal(q.totalIsComplete, false);
  assert.equal(calculatePublicSelection({ ...base, kitchenFinish: "highgloss", shoeCabinetFinish: "pet" }).subtotalWon, q.subtotalWon);
  assert.equal(calculatePublicSelection({ ...base, kitchen: false, wallpaper: "keep", shoeCabinetLengthM: null }).subtotalWon, null);
  for (const length of [-1, 0, 0.2, 13, Infinity, NaN]) assert.ok(validatePublicSelection({ ...base, shoeCabinetLengthM: length }));
  assert.ok(validatePublicSelection({ ...base, kitchenFinish: "invented" }));
  assert.ok(validatePublicSelection({ ...base, film: true, filmShoeCabinets: 1 }));
  assert.equal(calculatePublicSelection({ ...defaultPublicSelection(), kitchen: true }).subtotalWon, 2700000);
});
