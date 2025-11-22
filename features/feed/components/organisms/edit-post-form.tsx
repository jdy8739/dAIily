"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RotateCcw } from "lucide-react";
import { editPost, deletePost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";
import StreamingDots from "../../../../components/atoms/streaming-dots";

interface EditPostFormProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
  isDraft?: boolean;
}

const EditPostForm = ({
  postId,
  initialTitle,
  initialContent,
  isDraft = false,
}: EditPostFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hasChanges =
    title.trim() !== initialTitle.trim() ||
    content.trim() !== initialContent.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    if (!hasChanges) {
      router.push(`/feed/${postId}`);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to update your post?"
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await editPost(
        {
          postId,
          title: title.trim(),
          content: content.trim(),
        },
        "PUBLISHED"
      );

      if (result.success) {
        router.push("/feed");
        router.refresh();
      } else {
        setError(result.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Post edit error:", error);
      setError("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required to save draft");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await editPost(
        {
          postId,
          title: title.trim(),
          content: content.trim(),
        },
        "DRAFT"
      );

      if (result.success) {
        router.push("/drafts");
        router.refresh();
      } else {
        setError(result.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Draft save error:", error);
      setError("Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(isDraft ? "/drafts" : `/feed/${postId}`);
  };

  const handleRevert = () => {
    setTitle(initialTitle);
    setContent(initialContent);
    setError(null);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this draft? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const result = await deletePost(postId);

      if (result.success) {
        router.push("/drafts");
        router.refresh();
      } else {
        setError(result.error || "Failed to delete draft");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAiCorrect = async () => {
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
        setTitle(result.result.title);
        setContent(result.result.content);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-3 rounded-md">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full h-14 px-4 py-3 border rounded-lg text-base bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors border-border hover:border-border/80"
            placeholder="What did you accomplish today?"
            maxLength={200}
            disabled={isSubmitting || aiLoading}
            required
          />
          <div className="text-right text-sm text-muted-foreground mt-1">
            {title.length}/200
          </div>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-base bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-colors border-border hover:border-border/80"
            placeholder="Share the details of your professional growth, challenges overcome, skills learned, or achievements gained..."
            rows={12}
            maxLength={5000}
            disabled={isSubmitting || aiLoading}
            required
          />
          <div className="text-right text-sm text-muted-foreground mt-1">
            {content.length}/5000
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-4">
            {isDraft && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || aiLoading}
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
            )}

            <Button
              type="button"
              variant="ai"
              disabled={isSubmitting || aiLoading}
              onClick={handleAiCorrect}
            >
              <Sparkles className="w-4 h-4 mr-1" /> AI Correct
            </Button>

            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || aiLoading}
                onClick={handleRevert}
              >
                <RotateCcw className="w-4 h-4 mr-1" /> Revert
              </Button>
            )}
          </div>

          <div className="flex space-x-4">
            {isDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting || aiLoading}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || aiLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={
                isSubmitting ||
                aiLoading ||
                !title.trim() ||
                !content.trim() ||
                !hasChanges
              }
            >
              {isSubmitting
                ? isDraft
                  ? "Publishing..."
                  : "Updating..."
                : isDraft
                  ? "Publish"
                  : "Update Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPostForm;
