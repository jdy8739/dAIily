"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  queryParam?: string; // URL query parameter name (e.g., "tab")
}

const Tabs = ({ items, defaultTab, className = "", queryParam }: TabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial tab from URL or default
  const getInitialTab = () => {
    if (queryParam) {
      const tabFromUrl = searchParams.get(queryParam);
      if (tabFromUrl && items.some(item => item.id === tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return defaultTab || items[0]?.id;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  // Update tab state when URL changes
  useEffect(() => {
    if (queryParam) {
      const tabFromUrl = searchParams.get(queryParam);
      if (tabFromUrl && items.some(item => item.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, queryParam, items]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    if (queryParam) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set(queryParam, tabId);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${window.location.pathname}${query}`);
    }
  };

  const activeContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                transition-colors duration-200
                ${
                  activeTab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
              aria-current={activeTab === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;