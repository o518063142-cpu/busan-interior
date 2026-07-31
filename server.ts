import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", company: "한신인테리어" });
});

// AI Estimate API endpoint
app.post("/api/ai-estimate", async (req, res) => {
  try {
    const {
      spaceType,
      location = "부산진구 전포동",
      area = "30",
      scope = "전체공사",
      startDate = "협의",
      budget = "미정",
      style = "모던 미니멀",
      details = "",
    } = req.body;

    const ai = getGenAIClient();

    if (ai) {
      const prompt = `
당신은 부산 부산진구 전포동에 위치한 실내건축·인테리어 전문 업체 '한신인테리어'의 수석 견적·설계 전문가 AI입니다.
다음 고객이 입력한 인테리어 정보를 바탕으로 세부적인 참고용 예상 공사 계획 및 비용/기간 분석을 산출해주세요.

[고객 입력 정보]
- 공간 유형: ${spaceType}
- 공사 지역: ${location}
- 면적: ${area}평 (약 ${Math.round(Number(area) * 3.3 || 99)}m²)
- 공사 범위: ${scope}
- 희망 공사 시작일: ${startDate}
- 예상 예산: ${budget}
- 선호 인테리어 스타일: ${style}
- 고객 추가 요청사항: ${details || "없음"}

[응답 요구사항 - 반드시 지정된 JSON 구조로 응답하세요]
1. estimatedScope: 해당 공간 유형과 면적, 공사 범위에 따른 상세 추천 공사 항목 5~8개 (배열)
2. constructionPhases: 공사 단계별 상세 과정 (배열, 각 객체는 phaseName, description, durationDays 포함)
3. costRange: 예상 비용 범위 (문자열, 예: "약 3,500만 원 ~ 4,800만 원 (자재 등급에 따라 변동)")
4. durationRange: 예상 공사기간 (문자열, 예: "약 3주 ~ 4주")
5. expertTips: 한신인테리어 현장 전문가의 조언 및 추가 확인이 필요한 중요 사항 3~4개 (배열)
6. summaryMessage: 한신인테리어의 공간에 맞춘 디자인 제안 및 한줄 인삿말

반드시 사실적이고 한국의 최신 인테리어 시공 시세(부산 지역 기준)를 반영하여 작성해주세요.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              estimatedScope: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "추천 주요 공사 항목 리스트",
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
                },
                description: "공사 진행 단계별 정보",
              },
              costRange: { type: Type.STRING, description: "예상 비용 범위" },
              durationRange: { type: Type.STRING, description: "예상 공사 기간" },
              expertTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "현장 실측 시 필수 확인 사항",
              },
              summaryMessage: { type: Type.STRING, description: "요약 종합 의견" },
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

      const resultText = response.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        return res.json({ success: true, source: "gemini", data: parsed });
      }
    }

    // Fallback algorithmic calculation if GEMINI_API_KEY is not set or response is empty
    const pyung = Number(area) || 30;
    const isFull = scope === "전체공사";
    const basePerPyungMin = isFull ? 120 : 60;
    const basePerPyungMax = isFull ? 180 : 90;
    const minCost = Math.round((pyung * basePerPyungMin) / 100) * 100;
    const maxCost = Math.round((pyung * basePerPyungMax) / 100) * 100;
    const weeksMin = isFull ? Math.max(2, Math.ceil(pyung / 12)) : 1;
    const weeksMax = isFull ? Math.max(3, Math.ceil(pyung / 8)) : 2;

    return res.json({
      success: true,
      source: "calculated",
      data: {
        estimatedScope: [
          `${spaceType} 공간 철거 및 기본 공사`,
          `목공 및 천장/벽체 레이아웃 구성`,
          `조명 계획 (간접조명, 다운라이트, 라인조명)`,
          `바닥재 (강마루 / 포세린 타일 선택)`,
          `맞춤 가구 및 수납장 제작`,
          `창호/필름/도배 마감 공사`,
          `전기 설비 및 스위치/콘센트 증설`,
        ],
        constructionPhases: [
          { phaseName: "1단계: 현장 실측 및 맞춤 설계", description: "전문 디자이너의 부산 현장 구조 실측 및 1:1 도면 제안", durationDays: "3~5일" },
          { phaseName: "2단계: 철거 및 설비 공사", description: "기존 시설 철거, 배선 및 단열/배관 가공", durationDays: "2~3일" },
          { phaseName: "3단계: 목공 및 필름/타일 시공", description: "틀 잡기, 단열 작업, 필름 래핑 및 욕실/주방 타일 작업", durationDays: "5~7일" },
          { phaseName: "4단계: 도배, 바닥, 조명 마감", description: "고급 실크벽지, 마루/타일 시공 및 디자인 조명 세팅", durationDays: "3~4일" },
          { phaseName: "5단계: 가구 설치 및 최종 점검", description: "맞춤 수납장/씽크대 세팅, 준공 청소 및 고객 현장 입회 검수", durationDays: "2~3일" },
        ],
        costRange: `약 ${minCost.toLocaleString()}만 원 ~ ${maxCost.toLocaleString()}만 원 (선택 자재 및 현장 구조에 따라 변동)`,
        durationRange: `약 ${weeksMin}주 ~ ${weeksMax}주`,
        expertTips: [
          `${location} 지역 특성상 기존 건축물의 내력벽 구조 및 노후 설비 상태 확인 필수`,
          `선택하신 ${style} 스타일 마감을 위해 메인 조명과 간접 조명의 전력 용량 점검 필요`,
          `공동주택/상가의 경우 입주자대표회의 동의서 제출 및 소음 공사 가능 시간 사전 파악 필요`,
          `현장 실측 시 단열 상태 및 창호 교체 여부를 함께 확인하면 정확한 비용 산출 가능`,
        ],
        summaryMessage: `한신인테리어는 부산진구 전포동·서면 지역 실내건축 면허 업체로서 고객님의 ${spaceType} 공간을 가장 효율적이고 감각적으로 완성해 드립니다.`,
      },
    });
  } catch (error: any) {
    console.error("AI estimate error:", error);
    res.status(500).json({
      error: "AI 견적 산출 중 오류가 발생했습니다.",
      details: error?.message || String(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`한신인테리어 홈페이지 서버가 포트 ${PORT}에서 실행 중입니다.`);
  });
}

startServer();
