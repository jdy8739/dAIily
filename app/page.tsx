"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  console.log("Current theme:", theme, "Resolved theme:", resolvedTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const testThemeChange = () => {
    console.log("Test button clicked! Current theme:", theme);
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("Test setting theme to:", newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Daiily</h1>
      <p className="text-lg mb-4">
        Welcome to the professional growth tracking app!
      </p>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-2 ${
          (mounted ? resolvedTheme : 'light') === 'dark'
            ? 'bg-gray-800 border-gray-600'
            : 'bg-gray-100 border-gray-300'
        }`}>
          <p className="font-semibold">Theme Test Box</p>
          <p>
            Current theme: <span className="font-mono">{theme}</span>
          </p>
          <p>Light mode: gray-100 background</p>
          <p>Dark mode: gray-800 background</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={testThemeChange}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Test Theme Toggle (Light/Dark)
          </button>
          <button
            onClick={() => setTheme("system")}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Set System Theme
          </button>
        </div>

        <div className="flex space-x-4">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Go to Signup
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
