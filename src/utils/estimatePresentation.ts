/** Presentation only: never use rounded amounts for saved quotes or API requests. */
export function approximateWon(amount: number): string {
  if (amount > 0 && amount < 10000) return "약 1만원 미만";
  return `약 ${Math.round(amount / 10000).toLocaleString("ko-KR")}만원`;
}
