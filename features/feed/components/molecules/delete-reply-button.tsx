"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
          className="h-9 px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
        >
          {isDeleting ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={handleCancel}
          disabled={isDeleting}
          className="h-9 px-4 py-2 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 cursor-pointer transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleShowConfirm}
      className="p-1.5 text-muted-foreground hover:text-accent transition-colors rounded hover:bg-accent/10 cursor-pointer"
      title="Delete reply"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
};

export default DeleteReplyButton;
