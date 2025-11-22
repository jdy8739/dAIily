"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProfileTabsProps {
  items: TabItem[];
  defaultTab?: string;
  queryParam?: string;
}

const ProfileTabs = ({ items, defaultTab, queryParam }: ProfileTabsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    if (queryParam) {
      const tabFromUrl = searchParams.get(queryParam);
      if (tabFromUrl && items.some(item => item.id === tabFromUrl)) {
        setActiveTab(tabFromUrl);
      }
    }
  }, [searchParams, queryParam, items]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);

    if (queryParam) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set(queryParam, tabId);
      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.replace(`${window.location.pathname}${query}`);
    }
  };

  const activeContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Pill-style Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-lg w-fit">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`
              px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap
              transition-all duration-200 cursor-pointer
              ${
                activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
            aria-current={activeTab === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeContent}</div>
    </div>
  );
};

export default ProfileTabs;
