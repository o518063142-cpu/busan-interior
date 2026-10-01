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
        title =
          "회사소개 (ABOUT)｜부산 실내건축공사업 등록업체 지니 인테리어";
        description =
          "부산 동래구 명륜동 지니 인테리어(GENE INTERIOR / 법적상호: 지니인테리어) 소개. 실내건축공사업 등록업체로 부산을 중심으로 경남·울산까지 주거·상업·교육시설 인테리어와 리모델링을 진행합니다.";
        break;

      case "SERVICE":
        title =
          "서비스 안내 (SERVICE)｜부산 인테리어·리모델링 서비스｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR)의 주요 서비스. 부산을 중심으로 경남·울산까지 아파트·주택 리모델링, 상가·매장, 사무실, 학교·교육시설의 실내건축·인테리어를 진행합니다.";
        break;

      case "PROJECT":
        title =
          "시공사례 (PROJECT)｜부산 인테리어 실제 시공사례｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR)가 직접 진행한 실제 시공사례를 확인하세요. 부산 아파트·빌라 리모델링부터 학교·공공 교육시설까지 지역, 공간 유형, 공사 내용과 시공 정보를 소개합니다.";
        break;

      case "INFORMATION":
        title =
          "이용안내 & FAQ｜실내건축공사업 정보 및 부산 인테리어 가이드｜지니 인테리어";
        description =
          "지니 인테리어(GENE INTERIOR)의 실내건축공사업 등록 정보, 공사 진행 수칙, 자주 묻는 질문(FAQ)과 부산 인테리어·리모델링 시공 가이드를 확인하세요.";
        break;

      case "AI_ESTIMATE":
        title =
          "AI 상담·견적｜부산 인테리어 AI 예상 견적｜지니 인테리어";
        description =
          "공간 유형, 면적, 공사 범위와 선호 스타일을 바탕으로 인테리어 예상 비용과 공사 기간을 확인할 수 있는 지니 인테리어 AI 상담·견적 서비스입니다.";
        break;

      case "CONTACT":
        title =
          "현장 실측 & 견적 문의｜부산 인테리어 상담｜지니 인테리어";
        description =
          "부산 동래구 명륜동 지니 인테리어(GENE INTERIOR) 현장 실측 및 견적 상담 신청. 부산 전 지역을 중심으로 공간 구조와 공사 범위에 맞춘 상담과 견적을 안내합니다.";
        break;

      case "ADMIN":
        title = "상담 관리자 시스템｜지니 인테리어";
        description =
          "지니 인테리어 실측 및 견적 상담 관리자 시스템.";
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

    const ogDesc = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDesc) {
      ogDesc.setAttribute("content", description);
    }
  }, [activeTab, customTitle, customDescription]);

  return null;
};
