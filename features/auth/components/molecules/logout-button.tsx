"use client";

import { useState } from "react";
import { logoutAction } from "../../lib/actions";

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await logoutAction();
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
};

export default LogoutButton;
