"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-gray-200 bg-gray-100 animate-pulse" />
    );
  }

  const handleThemeChange = () => {
    console.log("Button clicked! Current theme:", theme);

    let newTheme: string;
    if (theme === "light") {
      newTheme = "dark";
    } else if (theme === "dark") {
      newTheme = "system";
    } else {
      newTheme = "light";
    }

    console.log("Setting theme to:", newTheme);
    setTheme(newTheme);
  };

  const getIcon = () => {
    switch (theme) {
      case "light":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case "dark":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        );
      case "system":
      default:
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (theme) {
      case "light":
        return "Switch to dark mode";
      case "dark":
        return "Switch to system mode";
      case "system":
      default:
        return "Switch to light mode";
    }
  };

  const { resolvedTheme } = useTheme();
  const currentTheme = mounted ? resolvedTheme : 'light';

  return (
    <button
      onClick={handleThemeChange}
      onMouseDown={(e) => {
        console.log("Mouse down on theme toggle");
        e.preventDefault();
      }}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
        currentTheme === 'dark'
          ? 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-offset-gray-800'
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-offset-white'
      }`}
      title={getLabel()}
      aria-label={getLabel()}
      type="button"
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;
