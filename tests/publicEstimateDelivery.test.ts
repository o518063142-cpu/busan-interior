import test from "node:test";
import assert from "node:assert/strict";
import { calculatePublicSelection, defaultPublicSelection } from "../shared/publicEstimate32.ts";
import { completePublicEstimateSubmission, isPublicEstimatePreviewHost } from "../src/utils/publicEstimateDelivery.ts";
import { buildConsultationKakao, KAKAO_TEXT_LIMIT } from "../shared/kakaoConsultation.ts";

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
const contact = {
  name: "  [TEST] 상담 검증 ",
  phone: "010-0000-0000",
  location: "부산 동래구",
  details: "ㄱ자 주방 예정",
};
const expectedQuote = calculatePublicSelection(selection);
const docPath = "consultations/isolated-qa-document";

function setup(options: {
  quoteFails?: boolean;
  saveFails?: boolean;
  notifyFails?: boolean;
  notifyThrows?: boolean;
  trackFails?: boolean;
} = {}) {
  const calls: string[] = [];
  const saves: any[] = [];
  const notifications: any[] = [];
  const tracking: string[] = [];
  const callbacks: string[] = [];
  const adapters = {
    async fetchQuote(input: typeof selection) {
      calls.push("quote");
      assert.deepEqual(input, selection);
      if (options.quoteFails) throw Error("mock: server quote unavailable");
      return expectedQuote;
    },
    async saveLead(record: any) {
      calls.push("save");
      if (options.saveFails) throw Error("mock: firestore unavailable");
      saves.push(record);
      return { path: docPath };
    },
    async notify(payload: any) {
      calls.push("notify");
      notifications.push(payload);
      if (options.notifyThrows) throw Error("mock: kakao network unavailable");
      return !options.notifyFails;
    },
    trackSubmitted(sessionId: string) {
      calls.push("track");
      tracking.push(sessionId);
      if (options.trackFails) throw Error("mock: analytics unavailable");
    },
    getSessionId: () => "qa-session-fixed",
    createdAt: () => "2026. 11. 6.",
    onSaved: () => { calls.push("saved"); callbacks.push("saved"); },
  };
  return { calls, saves, notifications, tracking, callbacks, adapters };
}

test("저장 성공→접수완료→카카오 성공: 서버값·저장·알림·추적 연결", async () => {
  const t = setup();
  const result = await completePublicEstimateSubmission(selection, contact, true, t.adapters);
  assert.equal(result.saved, true);
  assert.equal(result.notified, true);
  assert.equal(result.docPath, docPath);
  assert.deepEqual(t.calls, ["quote", "save", "saved", "track", "notify"]);
  assert.equal(t.saves.length, 1);
  assert.equal(t.notifications.length, 1);
  assert.deepEqual(t.tracking, ["qa-session-fixed"]);
  assert.deepEqual(t.callbacks, ["saved"]);
  assert.equal(result.record.estimateType, "public-selection-area");
  assert.deepEqual(result.record.estimateConditions, selection);
  assert.equal(result.record.publicEstimateSnapshot.subtotalWon, 12_603_125);
  assert.equal(result.record.area, "42");
  assert.equal(result.record.sessionId, "qa-session-fixed");
  assert.equal(result.record.isTest, true);
  assert.equal(result.record.excludeFromMetrics, true);
  assert.match(result.record.details, /^\[TEST\] 테스트 접수/);
  assert.deepEqual(t.notifications[0], {
    name: "[TEST] 상담 검증",
    phone: "010-0000-0000",
    location: "부산 동래구",
    spaceType: "아파트",
    area: "42",
    startDate: "협의",
    details: result.record.details,
    docPath,
    createdAt: "2026. 11. 6.",
  });
  const kakao = buildConsultationKakao(t.notifications[0]);
  assert.ok(kakao.text.length <= KAKAO_TEXT_LIMIT);
  assert.match(kakao.text, /고객 연락 금지/);
});

test("알림 API 실패는 저장 성공을 되돌리거나 중복 접수를 요구하지 않음", async () => {
  const t = setup({ notifyFails: true });
  const result = await completePublicEstimateSubmission(selection, contact, true, t.adapters);
  assert.equal(result.saved, true);
  assert.equal(result.notified, false);
  assert.deepEqual(t.calls, ["quote", "save", "saved", "track", "notify"]);
  assert.equal(t.saves.length, 1);
  assert.equal(t.callbacks.length, 1);
});

test("카카오 통신 예외도 상담 저장 성공 상태를 유지", async () => {
  const t = setup({ notifyThrows: true });
  const result = await completePublicEstimateSubmission(selection, contact, true, t.adapters);
  assert.equal(result.saved, true);
  assert.equal(result.notified, false);
  assert.equal(t.saves.length, 1);
  assert.equal(t.callbacks.length, 1);
});

test("견적 API 실패: 저장·알림·완료·추적 모두 금지", async () => {
  const t = setup({ quoteFails: true });
  await assert.rejects(completePublicEstimateSubmission(selection, contact, true, t.adapters), /server quote unavailable/);
  assert.deepEqual(t.calls, ["quote"]);
  assert.equal(t.saves.length, 0);
  assert.equal(t.notifications.length, 0);
  assert.equal(t.callbacks.length, 0);
  assert.equal(t.tracking.length, 0);
});

test("Firestore 저장 실패: 완료로 표시하지 않고 카카오와 추적을 보내지 않음", async () => {
  const t = setup({ saveFails: true });
  await assert.rejects(completePublicEstimateSubmission(selection, contact, true, t.adapters), /firestore unavailable/);
  assert.deepEqual(t.calls, ["quote", "save"]);
  assert.equal(t.saves.length, 0);
  assert.equal(t.notifications.length, 0);
  assert.equal(t.callbacks.length, 0);
  assert.equal(t.tracking.length, 0);
});

test("전환 추적 실패는 고객 상담 저장·카카오에 영향 없음", async () => {
  const t = setup({ trackFails: true });
  const result = await completePublicEstimateSubmission(selection, contact, true, t.adapters);
  assert.equal(result.saved, true);
  assert.equal(result.notified, true);
  assert.deepEqual(t.calls, ["quote", "save", "saved", "track", "notify"]);
  assert.equal(t.saves.length, 1);
  assert.equal(t.notifications.length, 1);
});

test("실측 필요 항목만 선택한 경우에도 금액을 지어내지 않고 상담 상태 전달", async () => {
  const t = setup();
  const windowSelection = { ...defaultPublicSelection(), supplyPyung: 42, windows: true, windowScope: "all" };
  const q = calculatePublicSelection(windowSelection);
  assert.equal(q.subtotalWon, null);
  const custom = {
    ...t.adapters,
    fetchQuote: async () => q,
  };
  const result = await completePublicEstimateSubmission(windowSelection, contact, true, custom);
  assert.equal(result.record.publicEstimateSnapshot.subtotalWon, null);
  assert.match(result.record.details, /실측 견적 필요/);
  assert.equal(result.saved, true);
});

test("Vercel PR Preview는 실제 상담 저장·카카오 발송 전에 차단하며 운영 주소는 유지", () => {
  const canonical = "https://gene-interior.vercel.app";
  assert.equal(isPublicEstimatePreviewHost("gene-interior.vercel.app", canonical), false);
  assert.equal(isPublicEstimatePreviewHost("gene-interior-mqq3t731w-o518063142-9435s-projects.vercel.app", canonical), true);
  assert.equal(isPublicEstimatePreviewHost("GENE-INTERIOR-PR20.vercel.app", canonical), true);
  assert.equal(isPublicEstimatePreviewHost("localhost", canonical), false);
  assert.equal(isPublicEstimatePreviewHost("gene-interior.example.com", canonical), false);
  assert.equal(isPublicEstimatePreviewHost("fakevercel.app", canonical), false);
});
