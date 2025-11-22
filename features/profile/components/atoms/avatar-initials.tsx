interface AvatarInitialsProps {
  name: string;
  size?: "sm" | "md" | "lg";
}

const AvatarInitials = ({ name, size = "md" }: AvatarInitialsProps) => {
  const initials = name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold`}
    >
      {initials}
    </div>
  );
};

export default AvatarInitials;
