"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../../../components/atoms/button";

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
      <div className="flex flex-wrap gap-2 w-fit">
        {items.map(item => (
          <Button
            key={item.id}
            type="button"
            variant={activeTab === item.id ? "primary" : "outline"}
            size="md"
            onClick={() => handleTabChange(item.id)}
            aria-current={activeTab === item.id ? "page" : undefined}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeContent}</div>
    </div>
  );
};

export default ProfileTabs;
