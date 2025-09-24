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
      <h1 className="text-4xl font-bold mb-4 text-foreground">Daiily</h1>
      <p className="text-lg mb-4 text-muted-foreground">
        Welcome to the professional growth tracking app!
      </p>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-card border-border">
          <p className="font-semibold text-foreground">Theme Test Box</p>
          <p className="text-muted-foreground">
            Current theme: <span className="font-mono text-foreground">{theme}</span>
          </p>
          <p className="text-muted-foreground">Light mode: muted background</p>
          <p className="text-muted-foreground">Dark mode: muted background</p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={testThemeChange}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Test Theme Toggle (Light/Dark)
          </button>
          <button
            onClick={() => setTheme("system")}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Set System Theme
          </button>
        </div>

        <div className="flex space-x-4">
          <a
            href="/login"
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
          >
            Go to Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success/90"
          >
            Go to Signup
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
