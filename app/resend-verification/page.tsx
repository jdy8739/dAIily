"use client";

import { useState } from "react";
import Link from "next/link";
import { resendVerificationEmail } from "../../features/auth/lib/resend-verification";
import Input from "../../components/atoms/input";
import Button from "../../components/atoms/button";

const ResendVerificationPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const result = await resendVerificationEmail(email);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      setEmail("");
    } else {
      setMessage({ type: "error", text: result.error });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Resend Verification Email
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your email address to receive a new verification link
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="bg-card py-8 px-4 shadow-lg rounded-lg sm:px-10 border border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  id="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  description="We'll send you a new verification link"
                />

                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.type === "success"
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-accent/10 text-accent border border-accent/30"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  disabled={loading}
                >
                  Send Verification Email
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:text-primary/80 transition-colors block font-medium"
                >
                  Back to Login
                </Link>
                <Link
                  href="/signup"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block"
                >
                  Need an account? Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
