"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeBodyProps {
  children: React.ReactNode;
}

const ThemeBody = ({ children }: ThemeBodyProps) => {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to get the actual theme (handles "system" theme)
  const currentTheme = mounted ? resolvedTheme : 'light';

  return (
    <div
      className={`min-h-screen transition-colors ${
        currentTheme === 'dark'
          ? 'bg-gray-900 text-gray-100'
          : 'bg-white text-gray-900'
      }`}
    >
      {children}
    </div>
  );
};

export default ThemeBody;