"use client";

import { deleteAccount } from "../../lib/actions";
import Button from "../../../../components/atoms/button";

const DeleteAccountSection = () => {
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your posts, replies, and likes will be permanently deleted."
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteAccount();

      if (result.success) {
        window.location.href = "/";
      } else {
        alert(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      alert("Failed to delete account");
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-accent/30">
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-accent mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. All your posts,
          replies, and likes will be permanently deleted.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleDeleteAccount}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
};

export default DeleteAccountSection;
