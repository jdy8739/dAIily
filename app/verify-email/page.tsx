"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided.");
        return;
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            data.message || "Email verified successfully! You can now log in."
          );
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?message=Email verified! Please log in.");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(
            data.error || "Verification failed. The link may have expired."
          );
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verifying Your Email
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Email Verified!
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verification Failed
              </h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full h-10 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Go to Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center w-full h-10 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium"
                >
                  Sign Up Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;
