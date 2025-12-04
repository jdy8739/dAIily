"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Sparkles,
  PenTool,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Share2,
  Eye,
  Heart,
  Target,
  Zap,
  Flame,
} from "lucide-react";
import Button from "../../../components/atoms/button";
import Skeleton from "../../../components/atoms/skeleton";
import { useCsrf } from "../../../components/providers/csrf-provider";
import {
  getCachedStory,
  generateStory as generateStoryAction,
  shareStoryToFeed as shareStoryToFeedAction,
} from "../lib/actions";
import ClientDate from "../../../components/atoms/client-date";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "all";
type Harshness = "low" | "medium" | "harsh" | "brutal";

const StoryGenerator = () => {
  const { token: csrfToken } = useCsrf();
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
  const [harshness, setHarshness] = useState<Harshness>("medium");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [showGeneratePrompt, setShowGeneratePrompt] = useState(false);
  const [isOutdated, setIsOutdated] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const [sharedPostId, setSharedPostId] = useState<string | null>(null);

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
      const result = await generateStoryAction(
        period,
        harshness,
        csrfToken ?? undefined
      );

      if (!result.success) {
        if (result.error === "NO_POSTS") {
          setError("NO_POSTS");
        } else if (result.error === "RATE_LIMIT_EXCEEDED") {
          setError(
            "You've reached the daily limit of 10 story generations. Please try again tomorrow."
          );
        } else if (result.error === "Invalid CSRF token") {
          setError(
            "Security token expired. Please refresh the page and try again."
          );
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
    setAlreadyShared(false);
    setSharedPostId(null);

    try {
      const result = await generateStoryAction(
        period,
        harshness,
        csrfToken ?? undefined
      );

      if (!result.success) {
        if (result.error === "NO_POSTS") {
          setError("NO_POSTS");
        } else if (result.error === "RATE_LIMIT_EXCEEDED") {
          setError(
            "You've reached the daily limit of 10 story generations. Please try again tomorrow."
          );
        } else if (result.error === "Invalid CSRF token") {
          setError(
            "Security token expired. Please refresh the page and try again."
          );
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

  const shareToFeed = async () => {
    setIsSharing(true);
    setError(null);

    try {
      const result = await shareStoryToFeedAction(
        period,
        csrfToken ?? undefined
      );

      if (!result.success) {
        if (result.error === "Invalid CSRF token") {
          setError(
            "Security token expired. Please refresh the page and try again."
          );
        } else {
          setError(result.error || "Failed to share story to feed");
        }
        return;
      }

      // Success
      setAlreadyShared(true);
      setSharedPostId(result.postId);

      // Redirect to feed with the new post
      router.push(`/feed#post-${result.postId}`);
    } catch (err) {
      console.error("Share to feed error:", err);
      setError("Failed to share story to feed. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const STORY_PERIOD_LABELS: Record<Period, string> = {
    daily: "Past 24 Hours",
    weekly: "Past Week",
    monthly: "Past Month",
    yearly: "Past Year",
    all: "Entire Journey",
  };

  const harshnessOptions = [
    {
      value: "low" as Harshness,
      icon: Heart,
      label: "Gentle",
      color: "from-success/20 to-success/5",
      iconColor: "text-success",
    },
    {
      value: "medium" as Harshness,
      icon: Target,
      label: "Balanced",
      color: "from-info/20 to-info/5",
      iconColor: "text-info",
    },
    {
      value: "harsh" as Harshness,
      icon: Zap,
      label: "Direct",
      color: "from-warning/20 to-warning/5",
      iconColor: "text-warning",
    },
    {
      value: "brutal" as Harshness,
      icon: Flame,
      label: "Brutal",
      color: "from-destructive/20 to-destructive/5",
      iconColor: "text-destructive",
    },
  ];

  const harshnessDescriptions: Record<Harshness, string> = {
    low: "Gentle encouragement",
    medium: "Balanced feedback",
    harsh: "Direct honesty",
    brutal: "Brutal truth",
  };

  return (
    <div className="space-y-6">
      {/* Feedback Intensity Selector */}
      <div className="bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border/30 p-10 shadow-lg backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary/60" />
            <h3 className="text-base font-medium text-muted-foreground uppercase tracking-wide text-sm">
              Feedback Style
            </h3>
          </div>
          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
            Choose your coaching intensity
          </p>
        </div>

        <div className="relative bg-muted/30 rounded-xl p-1.5 backdrop-blur-sm border border-border/20 max-w-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {harshnessOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setHarshness(option.value)}
                disabled={loading}
                className={`
                  relative px-4 py-3.5 rounded-lg transition-all duration-300 ease-out
                  flex flex-col items-center gap-2 border
                  ${
                    harshness === option.value
                      ? `bg-gradient-to-br ${option.color} shadow-md scale-105 border-border/40`
                      : "border-transparent hover:bg-background/40"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <option.icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    harshness === option.value
                      ? `scale-110 ${option.iconColor}`
                      : "opacity-60"
                  }`}
                />
                <span
                  className={`text-xs font-medium transition-all ${
                    harshness === option.value
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground/60">
            Selected:{" "}
            <span className="text-foreground font-medium">
              {harshnessDescriptions[harshness]}
            </span>
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
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
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        {!story && !loading && !error && !showGeneratePrompt && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-12 h-12 text-primary" />
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
              <Sparkles className="w-12 h-12 text-accent" />
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
              <PenTool className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No Posts in This Period
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven&apos;t written any posts in the{" "}
              {STORY_PERIOD_LABELS[period].toLowerCase()}. Start sharing your
              daily experiences to generate your growth story!
            </p>
            <Link href="/feed">
              <Button variant="primary">Write Your First Post</Button>
            </Link>
          </div>
        )}

        {error && error !== "NO_POSTS" && (
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
            <p className="text-accent font-medium">{error}</p>
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
                  {generatedAt && <ClientDate date={generatedAt} />}
                </p>
                {isOutdated && (
                  <p className="text-xs text-accent mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      This story is outdated. Recent posts and goals aren&apos;t
                      included.
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateStory}
                  disabled={loading || isSharing}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                {alreadyShared ? (
                  <Link href={`/feed#post-${sharedPostId}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Feed Post
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={shareToFeed}
                    disabled={loading || isSharing}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    {isSharing ? "Sharing..." : "Share to Feed"}
                  </Button>
                )}
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-foreground">
              <div className="whitespace-pre-wrap leading-relaxed">{story}</div>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      {!story && !loading && !showGeneratePrompt && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
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
