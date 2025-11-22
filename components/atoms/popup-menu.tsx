"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface PopupMenuItem {
  label: string;
  href: string;
  icon?: string | React.ReactNode;
}

interface PopupMenuProps {
  trigger: React.ReactNode;
  items: PopupMenuItem[];
  className?: string;
}

const PopupMenu = ({ trigger, items, className = "" }: PopupMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        type="button"
      >
        {trigger}
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 min-w-[200px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-foreground hover:bg-accent/10 transition-colors"
            >
              {item.icon && (typeof item.icon === "string" ? <span className="text-lg">{item.icon}</span> : item.icon)}
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
