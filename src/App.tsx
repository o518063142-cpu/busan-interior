import React, { useState, useEffect } from "react";
import { NavigationMenu, ProjectCategory, ProjectItem } from "./types";
import { SITE_CONFIG } from "./config/siteConfig";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingContactBar } from "./components/FloatingContactBar";
import { ContactModal } from "./components/ContactModal";
import { SEOHead } from "./components/SEOHead";

import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { ServicePage } from "./pages/ServicePage";
import { ProjectPage } from "./pages/ProjectPage";
import { InfoPage } from "./pages/InfoPage";
import { AIEstimatePage } from "./pages/AIEstimatePage";
import { ContactPage } from "./pages/ContactPage";
import { AdminPage } from "./pages/AdminPage";

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationMenu>("HOME");
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>("전체");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactModalData, setContactModalData] = useState<{
    spaceType?: string;
    location?: string;
    area?: string;
    details?: string;
  } | undefined>(undefined);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const openContactModalWithData = (data: {
    spaceType?: string;
    location?: string;
    area?: string;
    details?: string;
  }) => {
    // 무료 현장 실측 버튼 클릭 시 바로 핸드폰 번호(직통 010-7231-1470)로 전화 연결
    window.location.href = `tel:${SITE_CONFIG.company.mobilePhone}`;
    setContactModalData(data);
    setContactModalOpen(true);
  };

  const handleSelectProjectFromAnywhere = (project: ProjectItem | null) => {
    setSelectedProject(project);
    if (project) {
      setActiveTab("PROJECT");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-400 selection:text-stone-950">
      {/* Dynamic Title and Meta Management */}
      <SEOHead activeTab={activeTab} />

      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openContactModal={() => openContactModalWithData({})}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === "HOME" && (
          <HomePage
            setActiveTab={setActiveTab}
            openContactModal={() => openContactModalWithData({})}
            onSelectProject={handleSelectProjectFromAnywhere}
          />
        )}

        {activeTab === "ABOUT" && (
          <AboutPage
            setActiveTab={setActiveTab}
            openContactModal={() => openContactModalWithData({})}
          />
        )}

        {activeTab === "SERVICE" && (
          <ServicePage
            setActiveTab={setActiveTab}
            setSelectedCategory={setSelectedCategory}
            openContactModal={() => openContactModalWithData({})}
          />
        )}

        {activeTab === "PROJECT" && (
          <ProjectPage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            openContactModal={() => openContactModalWithData({})}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />
        )}

        {activeTab === "INFORMATION" && (
          <InfoPage
            setActiveTab={setActiveTab}
            openContactModal={() => openContactModalWithData({})}
          />
        )}

        {activeTab === "AI_ESTIMATE" && (
          <AIEstimatePage
            setActiveTab={setActiveTab}
            openContactModalWithData={openContactModalWithData}
          />
        )}

        {activeTab === "CONTACT" && (
          <ContactPage initialData={contactModalData} />
        )}

        {activeTab === "ADMIN" && <AdminPage />}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={setActiveTab}
        openContactModal={() => openContactModalWithData({})}
      />

      {/* Mobile Floating Action Bar */}
      <FloatingContactBar
        setActiveTab={setActiveTab}
        openContactModal={() => openContactModalWithData({})}
      />

      {/* Global Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        prefilledData={contactModalData}
      />
    </div>
  );
}

export default App;
