"use client";

import { useState } from "react";
import PdfBuilder from "./components/PdfBuilder";
import EmailBuilder from "./components/EmailBuilder";

export default function EditorScaffold() {
  const [activeTab, setActiveTab] = useState<"pdf" | "email">("pdf");

  return (
    <div className="container mx-auto py-10 h-[calc(100vh-100px)] flex flex-col">
      <h1 className="text-3xl font-bold mb-6">Template Editor</h1>
      
      {/* Tab Switcher */}
      <div className="flex space-x-4 mb-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "pdf"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          PDF Builder
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "email"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Email Builder
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
        {activeTab === "pdf" && <PdfBuilder />}
        {activeTab === "email" && <EmailBuilder />}
      </div>
    </div>
  );
}
