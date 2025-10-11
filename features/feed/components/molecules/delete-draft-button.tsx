"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCsrf } from "../../../../components/providers/csrf-provider";
import { deletePost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";

interface DeleteDraftButtonProps {
  postId: string;
  variant?: "outline";
}

const DeleteDraftButton = ({
  postId,
  variant = "outline",
}: DeleteDraftButtonProps) => {
  const { token: csrfToken } = useCsrf();
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this draft? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const result = await deletePost(postId, csrfToken ?? undefined);

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Failed to delete draft");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete draft");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
};

export default DeleteDraftButton;
