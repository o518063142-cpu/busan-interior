import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { AboutPage } from "../pages/AboutPage";
import { ServicePage } from "../pages/ServicePage";
import { ProjectPage } from "../pages/ProjectPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { InfoPage } from "../pages/InfoPage";
import { InformationDetailPage } from "../pages/InformationDetailPage";
import { TrustPage } from "../pages/TrustPage";
import { ContactPage } from "../pages/ContactPage";
import { AIEstimatePage } from "../pages/AIEstimatePage";
import { AdminPage } from "../pages/AdminPage";
import { ProjectCategory, ProjectItem, NavigationMenu } from "../types";

interface AppRoutesProps {
  initialData?: any;
  openContactModal: () => void;
  openContactModalWithData: (data: {
    spaceType: string;
    location: string;
    area: string;
    details: string;
  }) => void;
  selectedCategory: ProjectCategory;
  setSelectedCategory: (cat: ProjectCategory) => void;
  selectedProject: ProjectItem | null;
  onSelectProject: (proj: ProjectItem | null) => void;
  setActiveTab?: (tab: NavigationMenu) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  initialData,
  openContactModal,
  openContactModalWithData,
  selectedCategory,
  setSelectedCategory,
  selectedProject,
  onSelectProject,
  setActiveTab,
}) => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            setActiveTab={setActiveTab || (() => {})}
            openContactModal={openContactModal}
            onSelectProject={(proj) => {
              onSelectProject(proj);
            }}
          />
        }
      />
      <Route
        path="/about"
        element={
          <AboutPage
            setActiveTab={setActiveTab}
            openContactModal={openContactModal}
          />
        }
      />
      <Route
        path="/service"
        element={
          <ServicePage
            setActiveTab={setActiveTab}
            setSelectedCategory={setSelectedCategory}
            openContactModal={openContactModal}
          />
        }
      />
      <Route
        path="/projects"
        element={
          <ProjectPage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            openContactModal={openContactModal}
            selectedProject={selectedProject}
            onSelectProject={onSelectProject}
          />
        }
      />
      <Route
        path="/projects/:slug"
        element={
          <ProjectDetailPage
            initialData={initialData?.type === "project" ? initialData.data : undefined}
            openContactModal={openContactModal}
          />
        }
      />
      <Route
        path="/information"
        element={
          <InfoPage
            setActiveTab={setActiveTab}
            openContactModal={openContactModal}
          />
        }
      />
      <Route
        path="/information/:slug"
        element={
          <InformationDetailPage
            initialData={initialData?.type === "article" ? initialData.data : undefined}
            openContactModal={openContactModal}
          />
        }
      />
      <Route
        path="/trust"
        element={<TrustPage openContactModal={openContactModal} />}
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route
        path="/ai-estimate"
        element={
          <AIEstimatePage
            setActiveTab={setActiveTab}
            openContactModalWithData={openContactModalWithData}
          />
        }
      />
      <Route path="/admin" element={<AdminPage />} />

      {/* Fallback to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
