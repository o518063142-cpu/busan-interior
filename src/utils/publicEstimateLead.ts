import { publicSelectionSummary, type PublicSelection32, type calculatePublicSelection } from "../../shared/publicEstimate32";

export type PublicEstimateQuote = ReturnType<typeof calculatePublicSelection>;

export interface PublicEstimateContact {
  name: string;
  phone: string;
  location: string;
  details: string;
}

/**
 * Pure builder for a successfully recalculated server quote.
 * No Firestore writes, external notifications, or public-to-private price conversion.
 * Caller validates contact/consent and performs persistence separately.
 */
export function buildPublicEstimateLead(
  selection: PublicSelection32,
  serverQuote: PublicEstimateQuote,
  contact: PublicEstimateContact,
  sessionId: string,
  isPreview: boolean,
) {
  const name = contact.name.trim();
  const isTest = isPreview || /^\[TEST\]/i.test(name);
  const details = `${isTest ? "[TEST] 테스트 접수 · 실적 집계 제외 · 실제 고객 연락 금지\n" : ""}${publicSelectionSummary(selection, serverQuote)}\n추가 요청: ${contact.details.trim() || "없음"}`;
  const payload = {
    name,
    phone: contact.phone.trim(),
    location: contact.location.trim(),
    spaceType: "아파트",
    area: String(serverQuote.area.supplyPyung),
    startDate: "협의",
    details,
  };
  const record = {
    ...payload,
    status: "new" as const,
    source: "ai-estimate" as const,
    estimateType: "public-selection-area" as const,
    sessionId,
    isTest,
    excludeFromMetrics: isTest,
    estimateConditions: selection,
    publicEstimateSnapshot: serverQuote,
  };
  return { payload, record, isTest };
}

export function buildPublicEstimateNotification(
  payload: ReturnType<typeof buildPublicEstimateLead>["payload"],
  docPath: string,
  createdAt: string,
) {
  return { ...payload, docPath, createdAt };
}
