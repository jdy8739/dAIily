"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

export const ProfileLink = () => {
  const pathname = usePathname();
  const isActive = pathname === "/profile";

  return (
    <Link
      href="/profile"
      className={cn(
        "hidden sm:block text-xs sm:text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      Profile
    </Link>
  );
};
