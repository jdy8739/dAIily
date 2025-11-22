"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCsrf } from "../../../../components/providers/csrf-provider";
import { deletePost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";

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
        <Button
          variant="primary"
          size="sm"
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? "Deleting..." : "Confirm Delete"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isDeleting}
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </Button>
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
