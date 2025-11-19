"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCsrf } from "../../../../components/providers/csrf-provider";
import { deletePost } from "../../lib/actions";

interface DeletePostButtonProps {
  postId: string;
}

const DeletePostButton = ({ postId }: DeletePostButtonProps) => {
  const { token: csrfToken } = useCsrf();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePost(postId, csrfToken ?? undefined);

      if (result.success) {
        router.push("/feed");
        router.refresh();
      } else {
        console.error("Delete failed:", result.error);
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {isDeleting ? "Deleting..." : "Confirm Delete"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 disabled:opacity-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center space-x-1.5 px-3 py-1 text-sm text-muted-foreground hover:text-accent transition-colors rounded hover:bg-accent/10 cursor-pointer"
      title="Delete post"
    >
      <Trash2 className="w-4 h-4" />
      <span>Delete</span>
    </button>
  );
};

export default DeletePostButton;
