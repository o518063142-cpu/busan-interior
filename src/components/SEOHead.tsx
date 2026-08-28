import React, { useEffect } from "react";
import { SITE_CONFIG } from "../config/siteConfig";
import { NavigationMenu } from "../types";

interface SEOHeadProps {
  activeTab: NavigationMenu;
  customTitle?: string;
  customDescription?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  activeTab,
  customTitle,
  customDescription,
}) => {
  useEffect(() => {
    let title = SITE_CONFIG.seo.mainTitle;
    let description = SITE_CONFIG.seo.metaDescription;

    switch (activeTab) {
      case "ABOUT":
        title = "회사소개 (ABOUT)｜부산 실내건축공사업 등록업체 지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR / 법적상호: 한신인테리어) 소개. 실내건축공사업 면허 보유, 부산 전역 및 경남·울산 책임 시공. 공간의 가치를 높이는 1:1 맞춤 설계 및 정직한 시공 보장.";
        break;
      case "SERVICE":
        title = "서비스 안내 (SERVICE)｜부산 인테리어·리모델링 서비스｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR) 주요 서비스: 부산 및 경남·울산 아파트·주택 리모델링, 상가·매장, 카페·음식점, 사무실 인테리어 및 실내건축 전문.";
        break;
      case "PROJECT":
        title = "시공사례 (PROJECT)｜부산 인테리어 시공사례·포트폴리오｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR) 대표 시공사례 포트폴리오. 부산 및 인접 지역 주거, 상가, 카페, 사무실 리모델링 완공 및 비포/애프터 공사 과정 공개.";
        break;
      case "INFORMATION":
        title = "이용안내 & FAQ｜실내건축 면허 및 부산 인테리어 가이드｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR) 실내건축 면허 정보, 공사 진행 수칙, 자주 묻는 질문(FAQ) 및 인테리어 시공 가이드.";
        break;
      case "AI_ESTIMATE":
        title = "AI 상담·견적｜부산 인테리어 AI 예상 견적｜지니 인테리어";
        description =
          "인공지능 기반 맞춤 인테리어 예상 견적 및 공사 기간 산출. 부산 및 경남·울산 아파트/상가/카페 맞춤 AI 시공 가이드.";
        break;
      case "CONTACT":
        title = "무료 현장 실측 & 견적 문의｜부산 인테리어 무료 현장 실측·상담｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR) 부산 전역 및 경남·울산 무료 현장 실측 및 상담 신청. 네이버 플레이스 지도/위치 및 온라인 견적 안내.";
        break;
      case "ADMIN":
        title = "상담 관리자 시스템｜지니 인테리어";
        description = "지니 인테리어 실측 및 견적 상담 관리자 시스템.";
        break;
      default:
        break;
    }

    if (customTitle) title = customTitle;
    if (customDescription) description = customDescription;

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute("content", title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute("content", description);
    }
  }, [activeTab, customTitle, customDescription]);

  return null;
};
