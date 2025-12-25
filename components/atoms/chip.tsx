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
    "inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300 ease-out cursor-pointer";

  const variantClasses = {
    default:
      "bg-gradient-to-r from-muted to-muted/50 text-muted-foreground hover:from-muted/80 hover:to-muted/40 hover:shadow-sm border border-border/20",
    primary:
      "bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/15 hover:shadow-md border border-primary/30 hover:border-primary/50",
    secondary:
      "bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary hover:from-secondary/30 hover:to-secondary/15 hover:shadow-md border border-secondary/30 hover:border-secondary/50",
    accent:
      "bg-gradient-to-br from-accent/20 to-accent/10 text-accent hover:from-accent/30 hover:to-accent/15 hover:shadow-md border border-accent/30 hover:border-accent/50",
    outline:
      "border border-border bg-background/50 text-foreground hover:bg-muted/60 hover:border-border/80 hover:shadow-sm",
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
