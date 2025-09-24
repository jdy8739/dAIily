"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { passwordResetSchema, type PasswordResetFormData } from "../../schemas";
import { passwordResetAction } from "../../lib/actions";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

const PasswordResetForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await passwordResetAction(data);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "Password reset instructions sent.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-background py-8 px-4 shadow-lg rounded-lg sm:px-10 border border-border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">
              {success}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            {...register("email")}
            type="email"
            label="Email address"
            autoComplete="email"
            error={errors.email?.message}
            placeholder="Enter your email address"
          />

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading || !!success}
          >
            {success ? "Instructions sent" : "Send reset instructions"}
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Back to sign in
              </Link>
            </div>
            <div>
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordResetForm;
