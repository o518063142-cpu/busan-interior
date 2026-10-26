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
  // Only the confirmed 32-pyung apartment reference is priced. Do not
  // extrapolate this package to other areas or building types.
  const available = input.spaceType === "아파트" && Number(input.area) === 32 && input.scope === "전체공사";
  return {
    version: "customer-reference-v2-20261026",
    status: available ? "reference" as const : "consultation_required" as const,
    referenceAreaPyung: 32,
    minManwon: available ? 5500 : null,
    maxManwon: null,
    referenceHighManwon: available ? 6000 : null,
    isPriceCap: false,
    flooringIncluded: available ? true : null,
    vatIncluded: false,
    costRange: available ? "약 5,500~6,000만 원대" : "공사 항목 확인 후 개별 안내",
    basis: available
      ? "32평 비확장 구축 아파트 전체형의 기본 구성 기준입니다. 마루 포함, 부가세 별도이며 실제 견적은 현장 확인 후 확정합니다."
      : input.scope === "부분공사"
        ? "부분공사는 시공할 실제 면적·수량과 자재 사양을 확인한 뒤 금액을 안내합니다."
        : "32평 아파트 전체형의 기본 참고예산은 약 5,500~6,000만 원대(마루 포함·부가세 별도)입니다. 입력하신 공간의 금액은 면적과 공사 범위를 확인한 뒤 개별 안내합니다.",
    priceNotice: available
      ? "6,000만 원은 최대 금액이 아닙니다. 선택 자재·가구·창호 사양, 추가 공사와 현장 상태에 따라 6,000만 원 이상 나올 수 있습니다."
      : "고객별 요청과 실제 공사 범위에 따라 금액이 달라지며, 최종 견적은 상담·실측 후 안내합니다.",
    checks: [
      "철거·폐기물·보양·양중 범위",
      "창호·확장·구조 변경·전기 증설·배관 보수 범위",
      "욕실 개수, 주방 길이와 자재·가구 사양",
    ],
  };
}
