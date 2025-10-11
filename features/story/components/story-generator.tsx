"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/atoms/button";
import Skeleton from "../../../components/atoms/skeleton";
import {
  getCachedStory,
  generateStory as generateStoryAction,
} from "../lib/actions";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "all";

const StoryGenerator = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [period, setPeriod] = useState<Period>(() => {
    const urlPeriod = searchParams.get("period") as Period;
    return urlPeriod &&
      ["daily", "weekly", "monthly", "yearly", "all"].includes(urlPeriod)
      ? urlPeriod
      : "all";
  });
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [isOutdated, setIsOutdated] = useState(false);

  // Load cached story on mount
  useEffect(() => {
    loadCachedStory(period);
  }, []);

  // Check if story is outdated based on period
  const checkIfOutdated = (
    updatedAt: Date,
    selectedPeriod: Period
  ): boolean => {
    if (selectedPeriod === "all") return false; // Never outdated for "Entire Journey"

    const now = new Date();
    const storyAge = now.getTime() - updatedAt.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    switch (selectedPeriod) {
      case "daily":
        return storyAge > oneDayMs; // > 1 day old
      case "weekly":
        return storyAge > 7 * oneDayMs; // > 7 days old
      case "monthly":
        return storyAge > 30 * oneDayMs; // > 30 days old
      case "yearly":
        return storyAge > 365 * oneDayMs; // > 365 days old
      default:
        return false;
    }
  };

  const loadCachedStory = async (selectedPeriod: Period) => {
    setLoading(true);
    try {
      const cachedResult = await getCachedStory(selectedPeriod);
      if ("story" in cachedResult && cachedResult.story) {
        const updatedAt = new Date(cachedResult.story.updatedAt);
        setStory(cachedResult.story.content);
        setGeneratedAt(updatedAt);
        setIsOutdated(checkIfOutdated(updatedAt, selectedPeriod));
      }
    } catch (err) {
      console.error("Failed to load cached story:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectPeriod = async (selectedPeriod: Period) => {
    setLoading(true);
    setError(null);
    setStory("");
    setPeriod(selectedPeriod);
    setShowGeneratePrompt(false);
    setIsOutdated(false);

    // Update URL with selected period, preserving current pathname and query params
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("period", selectedPeriod);
    const query = current.toString();
    router.push(`${pathname}?${query}`, { scroll: false });

    try {
      // Check for cached story
      const cachedResult = await getCachedStory(selectedPeriod);
      if ("story" in cachedResult && cachedResult.story) {
        const updatedAt = new Date(cachedResult.story.updatedAt);
        setStory(cachedResult.story.content);
        setGeneratedAt(updatedAt);
        setIsOutdated(checkIfOutdated(updatedAt, selectedPeriod));
      } else {
        // No cached story - show generation prompt
        setShowGeneratePrompt(true);
      }
    } catch (err) {
      console.error("Failed to check cached story:", err);
      setShowGeneratePrompt(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmGenerate = async () => {
    setLoading(true);
    setError(null);
    setShowGeneratePrompt(false);

    try {
      // Generate new story
      const result = await generateStoryAction(period);

      if (!result.success) {
        if (result.error === "NO_POSTS") {
          setError("NO_POSTS");
        } else {
          throw new Error(result.error);
        }
        return;
      }

      setStory(result.content);
      setGeneratedAt(new Date(result.updatedAt));
      setIsOutdated(false); // New story is fresh
    } catch (err) {
      console.error("Story generation error:", err);
      setError("Failed to generate your story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const regenerateStory = async () => {
    setLoading(true);
    setError(null);
    setStory("");

    try {
      const result = await generateStoryAction(period);

      if (!result.success) {
        if (result.error === "NO_POSTS") {
          setError("NO_POSTS");
        } else {
          throw new Error(result.error);
        }
        return;
      }

      setStory(result.content);
      setGeneratedAt(new Date(result.updatedAt));
      setIsOutdated(false); // New story is fresh
    } catch (err) {
      console.error("Story generation error:", err);
      setError("Failed to generate your story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const STORY_PERIOD_LABELS: Record<Period, string> = {
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
          {(Object.keys(STORY_PERIOD_LABELS) as Period[]).map(p => (
            <Button
              key={p}
              variant={period === p ? "primary" : "outline"}
              size="sm"
              onClick={() => selectPeriod(p)}
              disabled={loading}
            >
              {STORY_PERIOD_LABELS[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8">
        {!story && !loading && !error && !showGeneratePrompt && (
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

        {showGeneratePrompt && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Generate {STORY_PERIOD_LABELS[period]} Story?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              AI will analyze your posts and goals from{" "}
              {STORY_PERIOD_LABELS[period].toLowerCase()} to create personalized
              insights about your growth.
            </p>
            <Button variant="primary" size="md" onClick={confirmGenerate}>
              Generate Story
            </Button>
          </div>
        )}

        {loading && <Skeleton className="h-96" />}

        {error && error === "NO_POSTS" && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✍️</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No Posts in This Period
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't written any posts in the{" "}
              {STORY_PERIOD_LABELS[period].toLowerCase()}. Start sharing your
              daily experiences to generate your growth story!
            </p>
            <Link href="/feed">
              <Button variant="primary">Write Your First Post</Button>
            </Link>
          </div>
        )}

        {error && error !== "NO_POSTS" && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center">
            <p className="text-warning font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={regenerateStory}
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
                  {STORY_PERIOD_LABELS[period]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Generated on{" "}
                  {generatedAt?.toLocaleDateString() ||
                    new Date().toLocaleDateString()}
                </p>
                {isOutdated && (
                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>
                      This story is outdated. Recent posts and goals aren't
                      included.
                    </span>
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={regenerateStory}>
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
      {!story && !loading && !showGeneratePrompt && (
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
