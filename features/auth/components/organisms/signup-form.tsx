"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupSchema, type SignupFormData } from "../../schemas";
import { signupAction } from "../../lib/actions";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

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
      <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            Create your account
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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

          <div className="text-xs text-gray-600">
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
            <span className="text-gray-600">Already have an account? </span>
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
