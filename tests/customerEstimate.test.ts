import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/ai-estimate.ts";
import { getCustomerPriceReference, validateCustomerConditions } from "../shared/customerEstimate.ts";

async function request(body: unknown, method = "POST") {
  let status = 200;
  let payload: any;
  const headers: Record<string, string> = {};
  const res = {
    setHeader(key: string, value: string) { headers[key] = value; },
    status(code: number) { status = code; return this; },
    json(value: unknown) { payload = value; return this; },
  };
  await handler({ method, body, query: {}, headers: {} } as any, res as any);
  return { status, payload, headers };
}

test("32평 주거 전체공사는 공개 참고 범위와 계산 근거를 반환한다", async () => {
  const { status, payload } = await request({ spaceType: "아파트", area: 32, scope: "전체공사" });
  assert.equal(status, 200);
  assert.equal(payload.source, "calculated");
  assert.equal(payload.data.pricing.minManwon, 3840);
  assert.equal(payload.data.pricing.maxManwon, 5760);
  assert.match(payload.data.pricing.basis, /참고 단가/);
});

test("부분공사에는 전체 평수 기준의 임의 금액이나 미선택 항목을 제시하지 않는다", async () => {
  const { status, payload } = await request({ area: 32, scope: "부분공사", selectedItems: ["도배", "바닥"] });
  assert.equal(status, 200);
  assert.equal(payload.data.pricing.minManwon, null);
  assert.deepEqual(payload.data.estimatedScope, ["도배 공사 범위·수량 확인", "바닥 공사 범위·수량 확인"]);
  assert.match(payload.data.durationRange, /확인 후/);
});

test("선택 없는 부분공사와 알 수 없는 공종은 서버에서도 거부한다", async () => {
  for (const selectedItems of [[], ["임의공종"], "도배"]) {
    assert.equal((await request({ area: 30, scope: "부분공사", selectedItems })).status, 400);
  }
});

test("잘못된 면적을 조용히 30평이나 최대치로 바꾸지 않는다", async () => {
  for (const area of [undefined, "", 0, -1, 301, "abc", Infinity]) {
    assert.equal((await request({ area, scope: "전체공사" })).status, 400);
  }
  assert.equal(validateCustomerConditions({ spaceType: "아파트", area: 32.5, scope: "전체공사" }), null);
});

test("상가·학교에는 주거 평당 기준을 적용하지 않는다", () => {
  for (const spaceType of ["상가", "사무실", "학교·교육시설", "기타"]) {
    const price = getCustomerPriceReference({ spaceType, area: 30, scope: "전체공사" });
    assert.equal(price.status, "consultation_required");
    assert.equal(price.maxManwon, null);
  }
});

test("사진 없는 간편 계산은 AI 키 유무·희망 예산에 따라 가격이 바뀌지 않는다", async () => {
  const previous = process.env.GEMINI_API_KEY;
  try {
    process.env.GEMINI_API_KEY = "test-must-not-call-provider";
    const low = await request({ area: 30, scope: "전체공사", budget: "100만원" });
    const high = await request({ area: 30, scope: "전체공사", budget: "1억원" });
    assert.equal(low.payload.source, "calculated");
    assert.equal(low.payload.data.costRange, high.payload.data.costRange);
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});

test("잘못된 HTTP 메서드는 거부하고 견적 응답은 캐시하지 않는다", async () => {
  const result = await request({}, "GET");
  assert.equal(result.status, 405);
  assert.equal(result.headers.Allow, "POST");
  assert.equal(result.headers["Cache-Control"], "no-store");
});
