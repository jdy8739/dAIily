"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut } from "lucide-react";
import LogoutButton from "../../features/auth/components/molecules/logout-button";

interface MobileMenuProps {
  userName: string;
}

const MobileMenu = ({ userName }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Feed", href: "/feed" },
    { label: "Write", href: "/write" },
    { label: "Drafts", href: "/drafts" },
    { label: "Story", href: "/story" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <div className="sm:hidden">
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle menu"
        type="button"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border shadow-lg z-40">
          <nav className="flex flex-col divide-y divide-border/50">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors first:pt-3"
              >
                {item.label}
              </Link>
            ))}
            {/* Logout button - bottom of menu */}
            <div className="px-4 py-3 border-t border-border/50">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
