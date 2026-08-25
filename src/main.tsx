import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const initialData = typeof window !== "undefined" ? window.__GENE_INITIAL_DATA__ : undefined;

  const appComponent = (
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter>
          <App initialData={initialData} />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );

  // Client Mounting Architecture (Option B):
  // SSR/Pre-rendered HTML serves SEO crawlers & initial paint immediately.
  // Full React SPA mounts cleanly without mismatched hydration warnings or fake hydration catch blocks.
  createRoot(rootElement).render(appComponent);
}
