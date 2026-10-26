import React from "react";
import { useSearchParams } from "react-router-dom";
import { AIEstimateContractPage } from "./AIEstimateContractPage";
import { PublicEstimatePage } from "./PublicEstimatePage";
import type { NavigationMenu } from "../types";

interface Props {
  setActiveTab?: (tab: NavigationMenu) => void;
  openContactModalWithData?: (data: { spaceType: string; location: string; area: string; details: string }) => void;
}
export function AIEstimatePage(props: Props) {
  const [params] = useSearchParams();
  return params.get("mode") === "photos"
    ? <AIEstimateContractPage {...props} />
    : <PublicEstimatePage />;
}
