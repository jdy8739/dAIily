"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-accent/50 rounded-lg p-8 shadow-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-accent" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Something went wrong
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
            <p className="text-xs font-mono text-accent break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="block w-full px-4 py-3 bg-muted text-center text-foreground rounded-md hover:bg-muted/80 transition-colors font-medium"
          >
            Go to Home
          </Link>
          <Link
            href="/feed"
            className="block w-full px-4 py-3 text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Error;
