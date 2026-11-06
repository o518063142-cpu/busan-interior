import test from "node:test";
import assert from "node:assert/strict";
import { calculatePublicSelection, defaultPublicSelection, publicSelectionSummary } from "../shared/publicEstimate32.ts";
import { buildPublicEstimateLead, buildPublicEstimateNotification } from "../src/utils/publicEstimateLead.ts";
import { buildConsultationKakao, KAKAO_TEXT_LIMIT } from "../shared/kakaoConsultation.ts";
import estimateHandler from "../api/ai-estimate.ts";

function response() {
  return { code: 200, payload: undefined as any, setHeader() {}, status(code: number) { this.code = code; return this; }, json(data: unknown) { this.payload = data; return this; } };
}

test("간편 견적의 서버 재계산 금액·면적·공종이 실제 상담 스냅샷과 일치", async () => {
  const selection = {
    ...defaultPublicSelection(),
    supplyPyung: 42,
    furnitureBasis: "gene" as const,
    wallpaper: "silk",
    floor: "wood",
    bathrooms: [{ method: "overlay", largeTile: false }, { method: "keep", largeTile: false }],
    kitchen: true,
    kitchenLengthM: 3,
  };
  const local = calculatePublicSelection(selection);
  assert.equal(local.subtotalWon, 12_603_125);
  const res = response();
  await estimateHandler({ method: "POST", query: {}, body: { publicSelection: selection, subtotalWon: 1 } } as any, res as any);
  assert.equal(res.code, 200);
  assert.equal(res.payload.source, "public-reference");
  assert.deepEqual(res.payload.data, local);

  const contact = { name: "  상담 고객  ", phone: " 010-0000-0000 ", location: " 부산 동래구 ", details: "  ㄱ자 주방 실측 요청 " };
  const session = "qa-fixed-session-id";
  const lead = buildPublicEstimateLead(selection, res.payload.data, contact, session, false);
  assert.deepEqual(lead.payload, {
    name: "상담 고객", phone: "010-0000-0000", location: "부산 동래구",
    spaceType: "아파트", area: "42", startDate: "협의",
    details: publicSelectionSummary(selection, local) + "\n추가 요청: ㄱ자 주방 실측 요청",
  });
  assert.equal(lead.record.isTest, false);
  assert.equal(lead.record.excludeFromMetrics, false);
  assert.equal(lead.record.sessionId, session);
  assert.equal(lead.record.estimateType, "public-selection-area");
  assert.deepEqual(lead.record.estimateConditions, selection);
  assert.deepEqual(lead.record.publicEstimateSnapshot, local);
  assert.equal(lead.record.publicEstimateSnapshot.subtotalWon, 12_603_125);

  const notification = buildPublicEstimateNotification(lead.payload, "consultations/qa-example", "2026. 11. 6.");
  assert.deepEqual(notification, { ...lead.payload, docPath: "consultations/qa-example", createdAt: "2026. 11. 6." });
  const kakao = buildConsultationKakao(notification);
  assert.ok(kakao.text.length <= KAKAO_TEXT_LIMIT);
  assert.ok(kakao.text.includes("12,603,125원"));
  assert.ok(kakao.text.includes("010-0000-0000"));
  assert.ok(kakao.text.includes("qa-example"));
});

test("Preview와 [TEST] 상담은 실적 집계에서 제외하고 실제 연락 금지를 명시", () => {
  const selection = { ...defaultPublicSelection(), wallpaper: "paper", supplyPyung: 32 };
  const quote = calculatePublicSelection(selection);
  const contact = { name: "일반 입력", phone: "010-0000-0000", location: "부산", details: "" };
  const preview = buildPublicEstimateLead(selection, quote, contact, "qa-session", true);
  assert.equal(preview.record.isTest, true);
  assert.equal(preview.record.excludeFromMetrics, true);
  assert.match(preview.record.details, /^\[TEST\] 테스트 접수/);
  assert.match(preview.record.details, /실제 고객 연락 금지/);
  const namedTest = buildPublicEstimateLead(selection, quote, { ...contact, name: "[TEST] 계정 검증" }, "qa-session", false);
  assert.equal(namedTest.record.isTest, true);
  assert.equal(namedTest.record.excludeFromMetrics, true);
  assert.equal(namedTest.payload.name, "[TEST] 계정 검증");
});

test("실측 없이는 가격 확인이 안 되는 공종은 합계나 범위를 임의 생성하지 않음", () => {
  const selection = { ...defaultPublicSelection(), supplyPyung: 42, windows: true, windowScope: "all" };
  const quote = calculatePublicSelection(selection);
  assert.equal(quote.subtotalWon, null);
  assert.equal(quote.totalIsComplete, false);
  const lead = buildPublicEstimateLead(selection, quote, { name: "문의", phone: "010-0000-0000", location: "부산", details: "" }, "qa-session", true);
  assert.equal(lead.record.publicEstimateSnapshot.subtotalWon, null);
  assert.match(lead.payload.details, /실측 견적 필요/);
  assert.match(lead.payload.details, /산출 항목 없음/);
});
