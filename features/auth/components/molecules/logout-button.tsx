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
    // redirect() in server action throws NEXT_REDIRECT which Next.js handles
    // No try-catch needed - redirect will happen automatically
    await logoutAction();
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
