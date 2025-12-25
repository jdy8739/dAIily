"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ai";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center";

  const variantClasses = {
    primary:
      "bg-foreground text-background hover:bg-foreground/90 focus:ring-ring border border-transparent",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring border border-border/50",
    outline:
      "border border-border text-foreground bg-transparent hover:bg-accent hover:border-border/80 focus:ring-ring",
    ai: "border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 focus:ring-ring",
  };

  const sizeClasses = {
    sm: "h-9 px-4 py-2 text-sm",
    md: "h-10 px-5 py-2 text-sm",
    lg: "h-14 px-6 py-3 text-base",
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${loading ? "cursor-not-allowed" : ""}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
