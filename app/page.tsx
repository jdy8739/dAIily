"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Home = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const testThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  if (!mounted) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Daiily</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the professional growth tracking app!
          </p>
        </header>

        <div className="space-y-6">
          {/* Theme demonstration card */}
          <div className="p-6 rounded-lg border bg-card text-card-foreground border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Color System Demo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current theme:</p>
                <p className="font-mono text-foreground bg-muted px-2 py-1 rounded">
                  {theme}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Resolved theme:</p>
                <p className="font-mono text-foreground bg-muted px-2 py-1 rounded">
                  {resolvedTheme}
                </p>
              </div>
            </div>

            {/* Color palette showcase */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded bg-primary text-primary-foreground text-center text-sm">
                Primary
              </div>
              <div className="p-3 rounded bg-secondary text-secondary-foreground text-center text-sm">
                Secondary
              </div>
              <div className="p-3 rounded bg-accent text-accent-foreground text-center text-sm">
                Accent
              </div>
              <div className="p-3 rounded bg-muted text-muted-foreground text-center text-sm">
                Muted
              </div>
            </div>

            {/* CSS Class Test */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded bg-primary text-primary-foreground text-center text-sm">
                CSS Class Primary
              </div>
              <div className="p-3 rounded bg-success text-success-foreground text-center text-sm">
                CSS Class Success
              </div>
            </div>

            {/* Status colors */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded bg-success text-success-foreground text-center text-sm">
                Success
              </div>
              <div className="p-3 rounded bg-warning text-warning-foreground text-center text-sm">
                Warning
              </div>
              <div className="p-3 rounded bg-info text-info-foreground text-center text-sm">
                Info
              </div>
              <div className="p-3 rounded bg-destructive text-destructive-foreground text-center text-sm">
                Error
              </div>
            </div>
          </div>

          {/* Theme controls */}
          <div className="p-6 rounded-lg border bg-card text-card-foreground border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Theme Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={testThemeChange}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-primary transition-colors"
              >
                Toggle Light/Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className="px-4 py-2 border border-border bg-background hover-accent text-foreground rounded-md transition-colors"
              >
                Light Theme
              </button>
              <button
                onClick={() => setTheme("dark")}
                className="px-4 py-2 border border-border bg-background hover-accent text-foreground rounded-md transition-colors"
              >
                Dark Theme
              </button>
              <button
                onClick={() => setTheme("system")}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover-secondary transition-colors"
              >
                System Theme
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-6 rounded-lg border bg-card text-card-foreground border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="px-4 py-2 bg-info text-info-foreground rounded-md hover-info transition-colors"
              >
                Login
              </a>
              <a
                href="/signup"
                className="px-4 py-2 bg-success text-success-foreground rounded-md hover-success transition-colors"
              >
                Sign Up
              </a>
              <a
                href="/dashboard"
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover-accent transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/write"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-primary transition-colors"
              >
                Write Entry
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
