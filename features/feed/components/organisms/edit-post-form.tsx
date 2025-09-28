"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editPost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";

interface EditPostFormProps {
  postId: string;
  initialTitle: string;
  initialContent: string;
}

const EditPostForm = ({ postId, initialTitle, initialContent }: EditPostFormProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hasChanges = title.trim() !== initialTitle.trim() || content.trim() !== initialContent.trim();

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

    const confirmed = window.confirm("Are you sure you want to update your post?");
    if (!confirmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await editPost({
        postId,
        title: title.trim(),
        content: content.trim(),
      });

      if (result.success) {
        router.push(`/feed/${postId}`);
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

  const handleCancel = () => {
    router.push(`/feed/${postId}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-warning/10 border border-warning/30 text-warning px-4 py-3 rounded-md">
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="What did you accomplish today?"
          maxLength={200}
          disabled={isSubmitting}
          required
        />
        <div className="text-right text-sm text-muted-foreground mt-1">
          {title.length}/200
        </div>
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          placeholder="Share the details of your professional growth, challenges overcome, skills learned, or achievements gained..."
          rows={12}
          maxLength={5000}
          disabled={isSubmitting}
          required
        />
        <div className="text-right text-sm text-muted-foreground mt-1">
          {content.length}/5000
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-4">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Save Draft
          </Button>

          <Button type="button" variant="ai" disabled={isSubmitting}>
            ✨ AI Correct
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !title.trim() || !content.trim() || !hasChanges}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EditPostForm;