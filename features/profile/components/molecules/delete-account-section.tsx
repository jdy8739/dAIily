"use client";

import { deleteAccount } from "../../lib/actions";

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
    <div className="mt-12 pt-8 border-t border-destructive/30">
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-destructive mb-2">
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. All your
          posts, replies, and likes will be permanently deleted.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors font-medium"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountSection;