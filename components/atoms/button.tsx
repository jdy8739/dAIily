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
    "font-medium rounded-lg transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center outline-none";

  const variantClasses = {
    primary:
      "border border-primary/40 bg-gradient-to-br from-primary/15 to-primary/5 text-primary hover:scale-105 hover:shadow-md hover:from-primary/25 hover:to-primary/10 hover:border-primary/60 disabled:hover:scale-100",
    secondary:
      "border border-secondary/40 bg-gradient-to-br from-secondary/15 to-secondary/5 text-secondary hover:scale-105 hover:shadow-md hover:from-secondary/25 hover:to-secondary/10 hover:border-secondary/60 disabled:hover:scale-100",
    outline:
      "border border-border text-foreground bg-transparent hover:bg-muted/30 hover:border-foreground",
    ai: "border border-primary/40 bg-gradient-to-br from-primary/20 to-primary/10 text-primary hover:scale-105 hover:shadow-md hover:from-primary/30 hover:to-primary/15 hover:border-primary/60 disabled:hover:scale-100",
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
