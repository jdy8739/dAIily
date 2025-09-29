"use client";

import { useState } from "react";
import { editReply } from "../../lib/actions";

interface EditReplyFormProps {
  replyId: string;
  initialContent: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditReplyForm = ({
  replyId,
  initialContent,
  onCancel,
  onSuccess,
}: EditReplyFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!content.trim()) {
      setError("Please enter a reply");
      return;
    }

    if (content.trim() === initialContent.trim()) {
      onCancel();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await editReply({ content: content.trim(), replyId });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Failed to edit reply");
      }
    } catch (error) {
      console.error("Reply edit error:", error);
      setError("Failed to edit reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-sm"
          rows={3}
          maxLength={1000}
          disabled={isSubmitting}
          autoFocus
        />
        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
          <span>{content.length}/1000</span>
          {error && <span className="text-destructive">{error}</span>}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !content.trim() ||
            content.trim() === initialContent.trim()
          }
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
};

export default EditReplyForm;
