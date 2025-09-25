"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupFormData } from "../../schemas";
import { signupAction } from "../../lib/actions";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";
import GoogleSignIn from "../../../../components/atoms/google-sign-in";
import GitHubSignIn from "../../../../components/atoms/github-sign-in";

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signupAction(data);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card py-8 px-4 shadow-lg rounded-lg sm:px-10 border border-primary/30">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Create your account
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <GoogleSignIn callbackUrl="/dashboard" text="Sign up with Google" />
            <GitHubSignIn callbackUrl="/dashboard" text="Sign up with GitHub" />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                Or create account with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              {...register("firstName")}
              type="text"
              label="First name"
              autoComplete="given-name"
              error={errors.firstName?.message}
            />

            <Input
              {...register("lastName")}
              type="text"
              label="Last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
            />
          </div>

          <Input
            {...register("email")}
            type="email"
            label="Email address"
            autoComplete="email"
            error={errors.email?.message}
          />

          <Input
            {...register("password")}
            type="password"
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
          />

          <Input
            {...register("confirmPassword")}
            type="password"
            label="Confirm password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
          />

          <div className="text-xs text-muted-foreground">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create account
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="font-medium text-primary hover-primary transition-colors"
            >
              Sign in
            </Link>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
