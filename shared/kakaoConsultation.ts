// Kakao default text template: https://developers.kakao.com/docs/ko/message-template/default
export const KAKAO_TEXT_LIMIT = 200;
const ADMIN_URL = "https://gene-interior.vercel.app/admin";

function text(value: unknown, max: number, fallback = "미입력") {
  const raw = typeof value === "string" || typeof value === "number" ? String(value).replace(/\s+/g, " ").trim() : "";
  if (!raw) return fallback;
  if (raw.length <= max) return raw;
  return raw.slice(0, max - 1).replace(/[\uD800-\uDBFF]$/, "") + "…";
}

export function buildConsultationKakao(input: Record<string, unknown> = {}) {
  const details = typeof input.details === "string" ? input.details : "";
  const isTest = input.isTest === true || /^\[TEST\]/i.test(String(input.name || "").trim()) || /^\[TEST\]/i.test(details.trim());
  const subtotal = details.match(/^가격 확인 항목 소계:\s*([^\r\n]+)$/m)?.[1];
  const documentId = typeof input.docPath === "string" ? input.docPath.match(/^consultations\/([A-Za-z0-9_-]{1,128})$/)?.[1] : undefined;
  const lines = [
    isTest ? "[TEST] 지니 상담 · 실제 고객 연락 금지" : "지니 인테리어 새 상담 접수",
    `성함: ${text(input.name, 16)}`,
    `연락처: ${text(input.phone, 20)}`,
    `지역: ${text(input.location, 20)}`,
    ...(subtotal ? [`참고 소계: ${text(subtotal, 24)} (총액 아님)`] : []),
    ...(documentId ? [`접수번호: ${text(documentId, 24)}`] : []),
  ];
  const footer = "전체 내역·별도 비용: 관리자 확인";
  // Keep the contact and reference subtotal before optional context and free text.
  for (const optional of [
    `${text(input.spaceType, 10)} / ${text(input.area, 8)}평 / ${text(input.startDate, 12)}`,
    ...(!subtotal && details.trim() ? [`요청: ${text(details, 45)}`] : []),
  ]) {
    const remaining = KAKAO_TEXT_LIMIT - [...lines, footer].join("\n").length - 1;
    if (remaining >= 8) lines.push(text(optional, remaining, ""));
  }
  return {
    object_type: "text" as const,
    text: [...lines, footer].join("\n"),
    link: { web_url: ADMIN_URL, mobile_web_url: ADMIN_URL },
    button_title: "상담 내역 확인",
  };
}
