import test from "node:test";
import assert from "node:assert/strict";
import { defaultPublicSelection, calculatePublicSelection, validatePublicSelection, PUBLIC_SOURCES } from "../shared/publicEstimate32.ts";
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
