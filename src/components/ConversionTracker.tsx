import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getConversionSessionId, getTrackingValue, setTrackingValue, removeTrackingValue } from "../utils/conversionTracking";

type ConversionEventName =
  | "page_view"
  | "ai_estimate_generate"
  | "ai_estimate_consultation_click"
  | "consultation_submitted";

const LEAD_SOURCE_KEY = "gene_lead_source";
const CONSULTATION_LOGGED_KEY = "gene_consultation_logged";

function safeReferrer() {
  if (!document.referrer) return "";
  try {
    const url = new URL(document.referrer);
    return `${url.origin}${url.pathname}`.slice(0, 300);
  } catch {
    return "";
  }
}

function getAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",
    referrer: safeReferrer(),
  };
}

async function writeEvent(eventName: ConversionEventName, path: string) {
  try {
    const source = getTrackingValue(LEAD_SOURCE_KEY) || "website";
    const attribution = getAttribution();

    await fetch("/api/track-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        path,
        source,
        sessionId: getConversionSessionId(),
        ...attribution,
      }),
    });
  } catch (error) {
    // Analytics must never interrupt the customer's consultation flow.
    console.warn("Conversion tracking skipped:", error);
  }
}

export const ConversionTracker: React.FC = () => {
  const location = useLocation();
  const previousPathRef = useRef<string>("");

  useEffect(() => {
    const path = location.pathname;
    if (previousPathRef.current === path) return;
    previousPathRef.current = path;

    if (path === "/ai-estimate") {
      setTrackingValue(LEAD_SOURCE_KEY, "ai-estimate");
    }

    void writeEvent("page_view", path);
  }, [location.pathname]);

  useEffect(() => {
    const handleSubmit = (event: SubmitEvent) => {
      if (window.location.pathname !== "/ai-estimate") return;

      const submitter = event.submitter as HTMLElement | null;
      const label = submitter?.textContent || "";
      if (label.includes("AI 예상 견적") || label.includes("분석 산출")) {
        setTrackingValue(LEAD_SOURCE_KEY, "ai-estimate");
        void writeEvent("ai_estimate_generate", "/ai-estimate");
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button, a") as HTMLElement | null;
      if (!button || button.dataset.conversionHandled === "true") return;

      const label = button.textContent || "";
      const path = window.location.pathname;

      if (
        path === "/ai-estimate" &&
        (label.includes("현장 실측") || label.includes("견적 상담 신청"))
      ) {
        setTrackingValue(LEAD_SOURCE_KEY, "ai-estimate");
        removeTrackingValue(CONSULTATION_LOGGED_KEY);
        void writeEvent("ai_estimate_consultation_click", path);
      } else if (
        label.includes("상담") ||
        button.getAttribute("href")?.startsWith("tel:")
      ) {
        setTrackingValue(LEAD_SOURCE_KEY, `website:${path}`);
        removeTrackingValue(CONSULTATION_LOGGED_KEY);
      }
    };

    document.addEventListener("submit", handleSubmit, true);
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("submit", handleSubmit, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (getTrackingValue(CONSULTATION_LOGGED_KEY) === "1") return;

      const bodyText = document.body?.innerText || "";
      if (bodyText.includes("실측 상담 신청이 접수되었습니다.")) {
        setTrackingValue(CONSULTATION_LOGGED_KEY, "1");
        void writeEvent("consultation_submitted", window.location.pathname);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
};
