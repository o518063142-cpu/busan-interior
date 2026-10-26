import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

interface EstimateInput {
  spaceType?: string;
  location?: string;
  area?: string | number;
  scope?: "전체공사" | "부분공사" | string;
  startDate?: string;
  budget?: string;
  style?: string;
  details?: string;
}

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.6-flash";

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 1000) : fallback;
}

function normalizeArea(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(300, Math.max(1, parsed));
}

function buildFallback(input: Required<EstimateInput>) {
  const pyung = normalizeArea(input.area);
  const isFull = input.scope === "전체공사";
  const basePerPyungMin = isFull ? 120 : 60;
  const basePerPyungMax = isFull ? 180 : 90;
  const minCost = Math.round((pyung * basePerPyungMin) / 100) * 100;
  const maxCost = Math.round((pyung * basePerPyungMax) / 100) * 100;
  const weeksMin = isFull ? Math.max(2, Math.ceil(pyung / 12)) : 1;
  const weeksMax = isFull ? Math.max(3, Math.ceil(pyung / 8)) : 2;

  return {
    estimatedScope: [
      `${input.spaceType} 공간 철거 및 기본 공사`,
      "목공 및 천장·벽체 레이아웃 구성",
      "조명 계획 및 전기 스위치·콘센트 점검",
      "바닥재와 벽체 마감 공사",
      "주방·수납 등 맞춤 가구 검토",
      "욕실·설비 상태 및 방수 범위 확인",
      "창호·필름·도배 등 마감 범위 확인",
    ],
    constructionPhases: [
      {
        phaseName: "1단계: 상담 및 현장 실측",
        description: "현장 상태, 치수, 기존 설비와 고객 요청 범위를 확인합니다.",
        durationDays: "1~3일",
      },
      {
        phaseName: "2단계: 공사 범위 및 견적 확정",
        description: "철거, 목공, 전기, 설비, 타일, 마감 등 필요한 공정을 정리합니다.",
        durationDays: "2~5일",
      },
      {
        phaseName: "3단계: 철거 및 기초 공사",
        description: "기존 마감 철거 후 배선·배관·바탕 상태를 정리합니다.",
        durationDays: "2~4일",
      },
      {
        phaseName: "4단계: 주요 공정 시공",
        description: "목공, 타일, 필름, 도장, 도배, 바닥, 가구, 조명을 순차 시공합니다.",
        durationDays: "7~15일",
      },
      {
        phaseName: "5단계: 마감 및 최종 점검",
        description: "마감 상태와 작동 여부를 점검하고 보완 후 인도합니다.",
        durationDays: "1~3일",
      },
    ],
    costRange: `약 ${minCost.toLocaleString()}만 원 ~ ${maxCost.toLocaleString()}만 원 (입력 정보 기준 참고 범위)`,
    durationRange: `약 ${weeksMin}주 ~ ${weeksMax}주`,
    expertTips: [
      `${input.location} 현장의 실제 구조와 노후 설비 상태는 실측 후 확인이 필요합니다.`,
      "철거·폐기물·보양·양중·주차 등 부대비용 포함 여부를 견적서에서 확인하세요.",
      "욕실 방수, 전기 증설, 샷시, 가구 범위는 현장 조건에 따라 비용 차이가 커질 수 있습니다.",
      "정확한 금액은 자재 사양과 실제 공사 범위를 확정한 뒤 안내할 수 있습니다.",
    ],
    summaryMessage: `지니 인테리어는 입력하신 ${input.spaceType} ${pyung}평 조건을 기준으로 공사 범위와 예상 비용을 참고용으로 정리했습니다. 실제 계약 견적은 현장 실측 후 확정됩니다.`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "POST 요청만 지원합니다." });
  }

  const body = (req.body || {}) as EstimateInput;
  const area = normalizeArea(body.area);
  const input: Required<EstimateInput> = {
    spaceType: cleanText(body.spaceType, "아파트") || "아파트",
    location: cleanText(body.location, "부산") || "부산",
    area: String(area),
    scope: body.scope === "부분공사" ? "부분공사" : "전체공사",
    startDate: cleanText(body.startDate, "협의") || "협의",
    budget: cleanText(body.budget, "미정") || "미정",
    style: cleanText(body.style, "모던 미니멀") || "모던 미니멀",
    details: cleanText(body.details, ""),
  };

  const fallback = buildFallback(input);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      source: "calculated",
      data: fallback,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
당신은 부산의 실내건축공사업 등록업체 '지니 인테리어'의 상담 보조 AI입니다.
고객이 입력한 정보만으로 확정 견적을 단정하지 말고, 현장 실측 전 단계에서 사용할 참고용 공사 계획과 넓은 예상 비용 범위를 작성하세요.
내부 원가, 협력업체 단가, 마진 등 비공개 영업정보를 추정하거나 노출하지 마세요.
구조 변경 가능 여부, 내력벽 여부, 누수·배관 상태 등 현장에서 확인해야 하는 사항은 사실처럼 단정하지 마세요.

[고객 입력]
- 공간 유형: ${input.spaceType}
- 공사 지역: ${input.location}
- 면적: ${input.area}평
- 공사 범위: ${input.scope}
- 희망 시작일: ${input.startDate}
- 고객 예상 예산: ${input.budget}
- 선호 스타일: ${input.style}
- 추가 요청: ${input.details || "없음"}

[작성 기준]
1. estimatedScope: 추천 주요 공사 범위 5~8개
2. constructionPhases: 상담·실측부터 마감 점검까지 단계별 과정
3. costRange: 부산 지역의 일반적인 참고 범위로만 표시하고, 확정 견적처럼 표현하지 말 것
4. durationRange: 예상 공사기간 범위
5. expertTips: 견적 누락이나 추가금 분쟁을 줄이기 위해 실측·견적 단계에서 꼭 확인할 사항 3~5개
6. summaryMessage: 고객이 다음 단계인 현장 실측 상담을 이해할 수 있는 짧은 요약
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedScope: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            constructionPhases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  durationDays: { type: Type.STRING },
                },
                required: ["phaseName", "description", "durationDays"],
              },
            },
            costRange: { type: Type.STRING },
            durationRange: { type: Type.STRING },
            expertTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryMessage: { type: Type.STRING },
          },
          required: [
            "estimatedScope",
            "constructionPhases",
            "costRange",
            "durationRange",
            "expertTips",
            "summaryMessage",
          ],
        },
      },
    });

    if (!response.text) {
      throw new Error("AI 응답 본문이 비어 있습니다.");
    }

    const parsed = JSON.parse(response.text);
    return res.status(200).json({
      success: true,
      source: "gemini",
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI estimate API fallback:", error?.message || error);
    return res.status(200).json({
      success: true,
      source: "calculated",
      warning: "AI 분석을 사용할 수 없어 참고 계산 결과를 표시했습니다.",
      data: fallback,
    });
  }
}
