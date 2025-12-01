"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error boundary caught:", error);
    }
  }, [error]);

  return (
    <html>
      <body className="bg-background">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-lg border border-destructive/50 bg-card p-8 shadow-lg">
            {/* Icon Container */}
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle size={32} className="text-destructive" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
              Critical Error
            </h1>

            {/* Error Description */}
            <p className="mb-6 text-center text-muted-foreground">
              A critical error occurred. Please refresh the page.
            </p>

            {/* Development Error Details */}
            {process.env.NODE_ENV === "development" && error.message && (
              <div className="mb-6 rounded-lg border border-border bg-secondary/20 p-4">
                <p className="break-words font-mono text-xs text-destructive">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* Button Container */}
            <div className="flex flex-col gap-3">
              <button
                onClick={reset}
                onMouseEnter={() => setHoveredButton("reset")}
                onMouseLeave={() => setHoveredButton(null)}
                className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                onMouseEnter={() => setHoveredButton("home")}
                onMouseLeave={() => setHoveredButton(null)}
                className="w-full rounded-md border border-border bg-secondary px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
