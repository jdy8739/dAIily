"use client";

import { useState } from "react";
import { createReply } from "../../lib/actions";
import Button from "../../../../components/atoms/button";

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your reply..."
          className="w-full px-4 py-3 border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition-colors text-base border-border hover:border-border/80"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1.5 text-xs text-muted-foreground">
          <span>{content.length}/1000</span>
          {error && <span className="text-accent">{error}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? "Posting..." : "Reply"}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
