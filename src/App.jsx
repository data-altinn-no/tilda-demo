import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LandingPage, DataModelsPage, TildaPage, ApiPage, GuidesPage, ContactPage, CodePage } from "./pages";

/**
 * Main App component with routing
 * Using HashRouter for GitHub Pages compatibility (URLs will be /#/path)
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tilda" element={<TildaPage />} />
        <Route path="/datamodeller" element={<DataModelsPage />} />
        <Route path="/api" element={<ApiPage />} />
        <Route path="/veiledninger" element={<GuidesPage />} />
        <Route path="/kontakt" element={<ContactPage />} />
        <Route path="/kode" element={<CodePage />} />
        <Route path="/kommende" element={<PlaceholderPage />} />
      </Routes>
    </HashRouter>
  );
}

/**
 * Placeholder page for upcoming service
 */
function PlaceholderPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">
          Kommende tjeneste
        </h1>
        <p className="text-neutral-600 mb-6">
          Denne tjenesten er under utvikling.
        </p>
        <a 
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Tilbake til forsiden
        </a>
      </div>
    </div>
  );
}
