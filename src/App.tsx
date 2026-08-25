import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NavigationMenu, ProjectCategory, ProjectItem } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { FloatingContactBar } from "./components/FloatingContactBar";
import { ContactModal } from "./components/ContactModal";
import { AppRoutes } from "./routes/AppRoutes";

interface AppProps {
  initialData?: any;
}

export function App({ initialData }: AppProps) {
  const location = useLocation();
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const openContactModalWithData = (data: {
    spaceType?: string;
    location?: string;
    area?: string;
    details?: string;
  }) => {
    setContactModalData(data);
    setContactModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-400 selection:text-stone-950">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openContactModal={() => openContactModalWithData({})}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        <AppRoutes
          initialData={initialData}
          openContactModal={() => openContactModalWithData({})}
          openContactModalWithData={openContactModalWithData}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          setActiveTab={setActiveTab}
        />
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
