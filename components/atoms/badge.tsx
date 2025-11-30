interface BadgeProps {
  variant?: "default" | "primary" | "secondary" | "accent" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}

const Badge = ({
  variant = "default",
  children,
  className = "",
}: BadgeProps) => {
  const baseClasses =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors";

  const variantClasses = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary:
      "bg-secondary/10 text-secondary-foreground border border-secondary/20",
    accent: "bg-accent/10 text-accent border border-accent/20",
    success: "bg-success/10 text-success border border-success/20",
    info: "bg-info/10 text-info border border-info/20",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
