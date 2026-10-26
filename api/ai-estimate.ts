import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdminApp } from "./_lib/firebaseAdmin.js";

interface AttachmentInput {
  path?: string;
  name?: string;
  mimeType?: string;
  kind?: "photo" | "floorplan" | string;
}

interface EstimateInput {
  spaceType?: string;
  location?: string;
  area?: string | number;
  scope?: "전체공사" | "부분공사" | string;
  startDate?: string;
  budget?: string;
  style?: string;
  details?: string;
  sessionId?: string;
  attachments?: AttachmentInput[];
}

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const MAX_ATTACHMENTS = 5;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 1000) : fallback;
}

function normalizeArea(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(300, Math.max(1, parsed));
}

function buildFallback(input: Required<Omit<EstimateInput, "attachments">>, attachmentCount: number) {
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
    visualFindings: attachmentCount
      ? ["첨부 자료는 저장되었으며, AI 시각 분석을 사용할 수 없어 현장 실측 시 함께 확인합니다."]
      : [],
    floorplanNotes: attachmentCount
      ? ["도면 치수와 벽체 성격, 배관 위치는 현장 실측과 원본 도면으로 재확인이 필요합니다."]
      : [],
    expertTips: [
      `${input.location} 현장의 실제 구조와 노후 설비 상태는 실측 후 확인이 필요합니다.`,
      "철거·폐기물·보양·양중·주차 등 부대비용 포함 여부를 견적서에서 확인하세요.",
      "욕실 방수, 전기 증설, 샷시, 가구 범위는 현장 조건에 따라 비용 차이가 커질 수 있습니다.",
      "정확한 금액은 자재 사양과 실제 공사 범위를 확정한 뒤 안내할 수 있습니다.",
    ],
    summaryMessage: `지니 인테리어는 입력하신 ${input.spaceType} ${pyung}평 조건을 기준으로 공사 범위와 예상 비용을 참고용으로 정리했습니다. 실제 계약 견적은 현장 실측 후 확정됩니다.`,
  };
}

function normalizeAttachments(body: EstimateInput) {
  const sessionId = cleanText(body.sessionId, "").slice(0, 100);
  if (!/^s_[A-Za-z0-9_-]{8,100}$/.test(sessionId)) return [];

  const raw = Array.isArray(body.attachments) ? body.attachments.slice(0, MAX_ATTACHMENTS) : [];
  const prefix = `ai-estimate/${sessionId}/`;

  return raw
    .map((item) => ({
      path: cleanText(item?.path, "").slice(0, 500),
      name: cleanText(item?.name, "첨부파일").slice(0, 120),
      mimeType: cleanText(item?.mimeType, "").slice(0, 100),
      kind: item?.kind === "floorplan" ? "floorplan" : "photo",
    }))
    .filter((item) => item.path.startsWith(prefix) && ALLOWED_MIME_TYPES.has(item.mimeType));
}

async function loadAttachmentParts(attachments: ReturnType<typeof normalizeAttachments>) {
  if (!attachments.length) return [] as any[];

  const app = await getFirebaseAdminApp();
  if (!app) return [] as any[];

  const bucket = getStorage(app).bucket();
  const parts: any[] = [];

  for (const item of attachments) {
    try {
      const [buffer] = await bucket.file(item.path).download();
      parts.push({
        inlineData: {
          mimeType: item.mimeType,
          data: buffer.toString("base64"),
        },
      });
      parts.push({
        text: `[첨부자료 메모] 종류=${item.kind}, 파일명=${item.name}`,
      });
    } catch (error: any) {
      console.warn("AI attachment load skipped:", item.path, error?.message || error);
    }
  }

  return parts;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "POST 요청만 지원합니다." });
  }

  const body = (req.body || {}) as EstimateInput;
  const area = normalizeArea(body.area);
  const input: Required<Omit<EstimateInput, "attachments">> = {
    spaceType: cleanText(body.spaceType, "아파트") || "아파트",
    location: cleanText(body.location, "부산") || "부산",
    area: String(area),
    scope: body.scope === "부분공사" ? "부분공사" : "전체공사",
    startDate: cleanText(body.startDate, "협의") || "협의",
    budget: cleanText(body.budget, "미정") || "미정",
    style: cleanText(body.style, "모던 미니멀") || "모던 미니멀",
    details: cleanText(body.details, ""),
    sessionId: cleanText(body.sessionId, ""),
  };
  const attachments = normalizeAttachments(body);
  const fallback = buildFallback(input, attachments.length);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      success: true,
      source: "calculated",
      attachmentCount: attachments.length,
      data: fallback,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const attachmentParts = await loadAttachmentParts(attachments);
    const hasFloorplan = attachments.some((item) => item.kind === "floorplan");
    const photoCount = attachments.filter((item) => item.kind === "photo").length;

    const prompt = `
당신은 부산의 실내건축공사업 등록업체 '지니 인테리어'의 상담 보조 AI입니다.
고객이 입력한 정보와 첨부 사진/평면도를 바탕으로 현장 실측 전 단계의 참고용 진단을 작성하세요.

[절대 원칙]
- 확정 견적을 단정하지 마세요.
- 내부 원가, 협력업체 단가, 마진 등 비공개 영업정보를 추정하거나 노출하지 마세요.
- 사진에 보이지 않는 누수, 배관 내부, 전기 용량, 구조체 상태를 사실처럼 단정하지 마세요.
- 평면도에서 내력벽/비내력벽을 확정하지 마세요.
- 도면에 명확한 치수가 없으면 임의 치수를 만들지 마세요.
- 문, 창, 주방, 욕실, 수납, 드레스룸 등의 객체는 보이는 범위에서 '후보'로만 설명하세요.
- 현장 사진과 도면이 충돌하면 현장 실측이 우선이라고 명시하세요.

[고객 입력]
- 공간 유형: ${input.spaceType}
- 공사 지역: ${input.location}
- 면적: ${input.area}평
- 공사 범위: ${input.scope}
- 희망 시작일: ${input.startDate}
- 고객 예상 예산: ${input.budget}
- 선호 스타일: ${input.style}
- 추가 요청: ${input.details || "없음"}
- 현장 사진 수: ${photoCount}장
- 평면도 포함: ${hasFloorplan ? "예" : "아니오"}

[작성 기준]
1. estimatedScope: 추천 주요 공사 범위 5~8개
2. constructionPhases: 상담·실측부터 마감 점검까지 단계별 과정
3. costRange: 부산 지역의 일반적인 참고 범위로만 표시하고 확정 견적처럼 표현하지 말 것
4. durationRange: 예상 공사기간 범위
5. visualFindings: 첨부 사진에서 실제로 확인 가능한 상태/마감/노후 요소. 보이지 않으면 추정하지 말 것
6. floorplanNotes: 평면도에서 확인 가능한 공간 구성 및 객체 후보와, GENE PLAN 객체화 전에 실측해야 할 항목
7. expertTips: 추가금·누락·현장 변수 방지를 위해 꼭 확인할 사항 3~6개
8. summaryMessage: 고객이 다음 단계인 현장 실측 상담을 이해할 수 있는 짧은 요약
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, ...attachmentParts],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedScope: { type: Type.ARRAY, items: { type: Type.STRING } },
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
            visualFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            floorplanNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
            expertTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            summaryMessage: { type: Type.STRING },
          },
          required: [
            "estimatedScope",
            "constructionPhases",
            "costRange",
            "durationRange",
            "visualFindings",
            "floorplanNotes",
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
      attachmentCount: attachments.length,
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI estimate API fallback:", error?.message || error);
    return res.status(200).json({
      success: true,
      source: "calculated",
      warning: "AI 시각 분석을 사용할 수 없어 참고 계산 결과를 표시했습니다.",
      attachmentCount: attachments.length,
      data: fallback,
    });
  }
}
