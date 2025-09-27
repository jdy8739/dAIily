"use client";

import { useState } from "react";
import { createReply } from "../../lib/actions";

interface ReplyFormProps {
  postId: string;
  onReplyCreated?: () => void;
}

const ReplyForm = ({ postId, onReplyCreated }: ReplyFormProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please enter a reply");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createReply({ content: content.trim(), postId });

      if (result.success) {
        setContent("");
        onReplyCreated?.();
      } else {
        setError(result.error || "Failed to create reply");
      }
    } catch (error) {
      console.error("Reply creation error:", error);
      setError("Failed to create reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1 text-sm text-muted-foreground">
          <span>{content.length}/1000</span>
          {error && <span className="text-destructive">{error}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Posting..." : "Reply"}
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;