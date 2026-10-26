// Public customer-facing assumptions only. Never import the internal price catalog.
export const CUSTOMER_WORK_ITEMS = [
  "도배", "바닥", "욕실", "주방", "목공", "전기·조명", "문·필름", "창호", "철거",
] as const;
export type CustomerWorkItem = typeof CUSTOMER_WORK_ITEMS[number];

export interface CustomerEstimateConditions {
  spaceType: string;
  area: string | number;
  scope: string;
  selectedItems?: string[];
}

export function validateCustomerConditions(input: CustomerEstimateConditions) {
  const area = Number(input.area);
  if (!Number.isFinite(area) || area < 1 || area > 300) {
    return "면적은 1~300평 사이의 숫자로 입력해 주세요.";
  }
  if (input.scope !== "전체공사" && input.scope !== "부분공사") {
    return "전체공사 또는 부분공사를 선택해 주세요.";
  }
  if (input.selectedItems !== undefined && (!Array.isArray(input.selectedItems) ||
      input.selectedItems.some((item) => !CUSTOMER_WORK_ITEMS.includes(item as CustomerWorkItem)))) {
    return "공사 항목을 다시 선택해 주세요.";
  }
  if (input.scope === "부분공사" && !input.selectedItems?.length) {
    return "부분공사 항목을 하나 이상 선택해 주세요.";
  }
  return null;
}

export function getCustomerPriceReference(input: CustomerEstimateConditions) {
  const residential = ["아파트", "빌라", "주택"].includes(input.spaceType);
  // Preserves the existing website draft's broad reference. This is not a
  // verified quotation, market statistic, or item-level/internal cost catalog.
  const available = residential && input.scope === "전체공사";
  const min = available ? Math.floor(Number(input.area) * 120 / 10) * 10 : null;
  const max = available ? Math.ceil(Number(input.area) * 180 / 10) * 10 : null;
  return {
    version: "customer-reference-v1",
    status: available ? "reference" as const : "consultation_required" as const,
    minManwon: min,
    maxManwon: max,
    costRange: available
      ? `약 ${min!.toLocaleString("ko-KR")}만 원 ~ ${max!.toLocaleString("ko-KR")}만 원`
      : "공사 항목 확인 후 개별 안내",
    basis: available
      ? "입력 면적 × 참고 단가(평당 120~180만 원). 실제 현장·자재 사양을 반영한 견적이 아닙니다."
      : input.scope === "부분공사"
        ? "부분공사는 시공할 실제 면적·수량과 자재 사양이 필요해 전체 평수만으로 금액을 계산하지 않습니다."
        : "상가·사무실·교육시설 등은 용도와 설비 조건에 따라 차이가 커 별도 상담으로 안내합니다.",
    checks: [
      "철거·폐기물·보양·양중 및 부가세 포함 여부",
      "창호·확장·구조 변경·전기 증설·배관 보수 범위",
      "욕실 개수, 주방 길이와 자재·가구 사양",
    ],
  };
}
