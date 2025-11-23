"use client";

import { useState } from "react";
import { logoutAction } from "../../lib/actions";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className = "" }: LogoutButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await logoutAction();
    } catch (error) {
      // NEXT_REDIRECT throws an error that Next.js handles for navigation
      // Only log if it's NOT a redirect error
      if (
        error instanceof Error &&
        error.message.includes("NEXT_REDIRECT")
      ) {
        // Expected - redirect is happening, ignore
        return;
      }
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer ${className}`}
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
};

export default LogoutButton;
