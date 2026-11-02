const SESSION_KEY = "gene_conversion_session_id";
// Browser-only fallback when storage is unavailable. Never populated during SSR.
const memory = new Map<string, string>();

export function getTrackingValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(key);
    if (value !== null) memory.set(key, value);
    return value ?? memory.get(key) ?? null;
  } catch { return memory.get(key) ?? null; }
}
export function setTrackingValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  memory.set(key, value);
  try { window.sessionStorage.setItem(key, value); } catch { /* Tracking must not interrupt the customer. */ }
}
export function removeTrackingValue(key: string) {
  if (typeof window === "undefined") return;
  memory.delete(key);
  try { window.sessionStorage.removeItem(key); } catch { /* Storage may be blocked. */ }
}
export function getConversionSessionId() {
  if (typeof window === "undefined") return "";
  const existing = getTrackingValue(SESSION_KEY);
  if (existing) return existing;
  const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  setTrackingValue(SESSION_KEY, id);
  return id;
}
export async function trackEstimateEvent(
  eventName: "ai_estimate_generate" | "ai_estimate_consultation_click" | "consultation_submitted",
  sessionId = getConversionSessionId(),
) {
  if (typeof window === "undefined") return;
  try {
    setTrackingValue("gene_lead_source", "ai-estimate");
    await fetch("/api/track-conversion", {
      method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ eventName, path: "/ai-estimate", source: "ai-estimate", sessionId }),
    });
  } catch { /* A metric failure must never change the consultation result. */ }
}
