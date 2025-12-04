"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";

interface NavItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  items: NavItem[];
}

const NavDropdown = ({ label, items }: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isActive = items.some((item) => item.href === pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <span>{label}</span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-50">
          {items.map((item) => {
            const isItemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg",
                  isItemActive
                    ? "text-foreground bg-accent/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavDropdown;
