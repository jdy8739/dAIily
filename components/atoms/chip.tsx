"use client";

import { X } from "lucide-react";

interface ChipProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "accent" | "outline";
  size?: "sm" | "md" | "lg";
  removable?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

const Chip = ({
  children,
  variant = "default",
  size = "md",
  removable = false,
  onRemove,
  disabled = false,
  className = "",
}: ChipProps) => {
  const baseClasses =
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors cursor-pointer";

  const variantClasses = {
    default: "bg-muted text-muted-foreground hover:bg-muted/80",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    accent: "bg-accent text-accent-foreground hover:bg-accent/80",
    outline:
      "border border-border bg-background text-foreground hover:bg-muted/50",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${className}
      `}
    >
      <span className="truncate">{children}</span>
      {removable && onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 rounded-full p-0.5 hover:bg-muted transition-colors cursor-pointer"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

export default Chip;
