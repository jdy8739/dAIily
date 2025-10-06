"use client";

import { useState } from "react";
import Button from "../../../components/atoms/button";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "all";

const StoryGenerator = () => {
  const [period, setPeriod] = useState<Period>("all");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStory = async (selectedPeriod: Period) => {
    setLoading(true);
    setError(null);
    setStory("");
    setPeriod(selectedPeriod);

    try {
      const response = await fetch("/api/ai/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ period: selectedPeriod }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedStory = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedStory += chunk;

        accumulatedStory;
      }
    } catch (err) {
      console.error("Story generation error:", err);
      setError("Failed to generate your story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const periodLabels: Record<Period, string> = {
    daily: "Past 24 Hours",
    weekly: "Past Week",
    monthly: "Past Month",
    yearly: "Past Year",
    all: "Entire Journey",
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Choose Time Period
        </h2>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(periodLabels) as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? "primary" : "outline"}
              size="sm"
              onClick={() => generateStory(p)}
              disabled={loading}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8">
        {!story && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Generate Your Story
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Select a time period above to see AI-powered insights into your
              professional growth, achievements, and goals.
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Analyzing your journey...</p>
            </div>
            {story && (
              <div className="prose prose-sm max-w-none text-foreground">
                <div className="whitespace-pre-wrap">{story}</div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center">
            <p className="text-warning font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateStory(period)}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        )}

        {story && !loading && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  {periodLabels[period]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generated on {new Date().toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateStory(period)}
              >
                Regenerate
              </Button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <div className="whitespace-pre-wrap leading-relaxed">{story}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      {!story && !loading && (
        <div className="bg-info/10 border border-info/30 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Tips for Better Insights
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • Complete your profile with goals and skills for more
              personalized insights
            </li>
            <li>• Write regular posts about your progress and achievements</li>
            <li>• Try different time periods to see your growth over time</li>
            <li>• Use the insights to identify areas for improvement</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StoryGenerator;
