"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavDropdown from "./nav-dropdown";
import { cn } from "../../lib/utils";

interface HeaderNavProps {
  userId: string;
}

export const HeaderNav = ({ userId }: HeaderNavProps) => {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
      <NavDropdown
        label="Posts"
        items={[
          { label: "Feed", href: "/feed" },
          { label: "Drafts", href: "/drafts" },
        ]}
      />
      <Link
        href="/write"
        className={cn(
          "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
          pathname === "/write"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Write
      </Link>
      <Link
        href={`/story/${userId}`}
        className={cn(
          "text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
          pathname === `/story/${userId}`
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Story
      </Link>
    </nav>
  );
};
