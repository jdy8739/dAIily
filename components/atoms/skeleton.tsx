const Skeleton = ({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "text" | "circle";
}) => {
  const baseClasses = "animate-pulse bg-muted";
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circle: "rounded-full",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export default Skeleton;
