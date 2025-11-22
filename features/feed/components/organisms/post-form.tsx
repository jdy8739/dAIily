"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { createPostSchema, type CreatePostData } from "../../schemas/post";
import { createPost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";
import Input from "../../../../components/atoms/input";
import Textarea from "../../../../components/atoms/textarea";
import StreamingDots from "../../../../components/atoms/streaming-dots";

const PostForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
  } = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (data: CreatePostData) => {
    const confirmed = window.confirm(
      "Are you sure you want to share your growth story?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createPost(data, "PUBLISHED");
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        reset();
        router.push("/feed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    const data = {
      title:
        (document.getElementById("title") as HTMLInputElement)?.value || "",
      content:
        (document.getElementById("content") as HTMLTextAreaElement)?.value ||
        "",
    };

    if (!data.title.trim() || !data.content.trim()) {
      setError("Title and content are required to save draft");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createPost(data, "DRAFT");
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        reset();
        router.push("/feed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onAiCorrect = async () => {
    const title = getValues("title");
    const content = getValues("content");

    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content before using AI correct");
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      // Dynamically import to avoid bundling on server
      const { proofreadContent } = await import(
        "../../../../features/ai/lib/actions"
      );
      const result = await proofreadContent(title, content);

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.result.title && result.result.content) {
        setValue("title", result.result.title);
        setValue("content", result.result.content);
      }
    } catch (err) {
      setError("AI correction failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="relative">
      {aiLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <StreamingDots />
            <p className="text-sm text-muted-foreground">
              AI is correcting your post...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 rounded-md bg-accent/10 border border-accent/30">
            <p className="text-sm text-accent font-medium">{error}</p>
          </div>
        )}

        <Input
          {...register("title")}
          id="title"
          type="text"
          label="Title"
          placeholder="What did you accomplish today?"
          error={errors.title?.message}
          disabled={loading || aiLoading}
        />

        <Textarea
          {...register("content")}
          id="content"
          label="Content"
          rows={12}
          placeholder="Share your experiences, learnings, and achievements from today..."
          error={errors.content?.message}
          disabled={loading || aiLoading}
        />

        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={loading || aiLoading}
              onClick={onSaveDraft}
              className="flex-1 sm:flex-none"
            >
              Save Draft
            </Button>

            <Button
              type="button"
              variant="ai"
              size="md"
              disabled={loading || aiLoading}
              onClick={onAiCorrect}
              className="flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Correct
            </Button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading || aiLoading}
            className="w-full sm:w-auto"
          >
            {loading ? "Sharing..." : "Share Growth"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;
