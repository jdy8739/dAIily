"use client";

import { useState, useEffect } from "react";
import { getUserGoals, getUserStory } from "../lib/actions";

type Goal = {
  id: string;
  title: string;
  period: string;
  startDate: string;
  deadline: string;
  status: string;
};

type UserStoryViewerProps = {
  userId: string;
};

const periodOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "all", label: "All Time" },
];

const periodLabels: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const UserStoryViewer = ({ userId }: UserStoryViewerProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedTab, setSelectedTab] = useState<"active" | "achieved">(
    "active"
  );
  const [story, setStory] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoals();
  }, [userId]);

  useEffect(() => {
    loadStory();
  }, [selectedPeriod, userId]);

  const loadGoals = async () => {
    try {
      const result = await getUserGoals(userId);
      if ("goals" in result) {
        setGoals(result.goals);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setGoalsLoading(false);
    }
  };

  const loadStory = async () => {
    setLoading(true);
    setError(null);
    setStory(null);

    try {
      const result = await getUserStory(userId, selectedPeriod);

      if ("error" in result) {
        setError(result.error);
      } else if (result.story) {
        setStory(result.story.content);
      } else {
        setStory(null);
      }
    } catch (err) {
      setError("Failed to load story");
    } finally {
      setLoading(false);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (selectedTab === "active") {
      return goal.status === "ACTIVE" || goal.status === "IN_PROGRESS";
    } else {
      return goal.status === "ACHIEVED";
    }
  });

  return (
    <div className="space-y-6">
      {/* Goals Section */}
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
        {/* Tab Switcher */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setSelectedTab("active")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                selectedTab === "active"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎯 Active Goals
              {selectedTab === "active" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setSelectedTab("achieved")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                selectedTab === "achieved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏆 Achieved Goals
              {selectedTab === "achieved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
        </div>

        {goalsLoading ? (
          <p className="text-muted-foreground">Loading goals...</p>
        ) : filteredGoals.length > 0 ? (
          <div className="space-y-3">
            {filteredGoals.map(goal => (
              <div
                key={goal.id}
                className="border border-border rounded-lg p-4 bg-background"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {periodLabels[goal.period]}
                  </span>
                </div>
                <h4 className="text-foreground font-medium mb-2 whitespace-pre-wrap break-words">
                  {goal.title}
                </h4>
                <div className="text-xs text-muted-foreground">
                  <span>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {selectedTab === "active"
              ? "No active goals yet"
              : "No achieved goals yet"}
          </p>
        )}
      </div>

      {/* Story Section */}
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
        {/* Period Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Period
          </label>
          <div className="flex gap-2 flex-wrap">
            {periodOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Story Display */}
        <div className="border-t border-border pt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-warning">{error}</p>
            </div>
          )}

          {!loading && !error && !story && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-muted-foreground">
                No story available for this period yet
              </p>
            </div>
          )}

          {!loading && !error && story && (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {story}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserStoryViewer;
