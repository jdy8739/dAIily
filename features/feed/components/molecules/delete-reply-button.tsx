"use client";

import { useState } from "react";
import { deleteReply } from "../../lib/actions";

interface DeleteReplyButtonProps {
  replyId: string;
  onDeleted?: () => void;
}

const DeleteReplyButton = ({ replyId, onDeleted }: DeleteReplyButtonProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);

    try {
      const result = await deleteReply(replyId);

      if (result.success) {
        onDeleted?.();
      } else {
        console.error("Delete failed:", result.error);
        alert(result.error || "Failed to delete reply");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete reply");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  const handleShowConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleShowConfirm}
      className="px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors rounded hover:bg-destructive/10 cursor-pointer"
      title="Delete reply"
    >
      🗑️
    </button>
  );
};

export default DeleteReplyButton;
