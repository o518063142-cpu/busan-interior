import test from "node:test";
import assert from "node:assert/strict";
import { isTestConsultation, productionMetricRecords } from "../shared/consultationMetrics.ts";
import track from "../api/track-conversion.ts";

test("테스트 상담과 연결된 세션 이벤트만 실적에서 제외한다", () => {
  const consultations = [
    { name: "실제 고객", sessionId: "real", status: "contract" },
    { name: "[TEST] 상담 검증", sessionId: "test", status: "contract" },
    { name: "미리보기", isTest: true, sessionId: "preview" },
    { name: "별도 제외", excludeFromMetrics: true, sessionId: "excluded" },
  ];
  const result = productionMetricRecords(consultations, [
    { sessionId: "real" }, { sessionId: "test" }, { sessionId: "preview" },
    { sessionId: "excluded" }, { sessionId: "ordinary" }, { sessionId: "flagged", isTest: true },
  ]);
  assert.deepEqual(result.consultations.map(x => x.name), ["실제 고객"]);
  assert.deepEqual(result.events.map(x => x.sessionId), ["real", "ordinary"]);
});
test("테스트 문자열을 포함한 실제 고객 이름이나 빈 세션을 과도하게 제외하지 않는다", () => {
  assert.equal(isTestConsultation({ name: "테스트매장" }), false);
  const result = productionMetricRecords([{ name: "[TEST]", sessionId: "" }], [{ sessionId: "" }, { sessionId: "normal" }]);
  assert.equal(result.events.length, 2);
});
test("Preview 방문 이벤트는 DB에 쓰기 전에 건너뛴다", async () => {
  const previous = process.env.VERCEL_ENV;
  let payload: any;
  try {
    process.env.VERCEL_ENV = "preview";
    await track({ method: "POST" } as any, { setHeader() {}, status() { return this; }, json(value: any) { payload = value; } } as any);
    assert.deepEqual(payload, { success: true, skipped: true, reason: "preview" });
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});
