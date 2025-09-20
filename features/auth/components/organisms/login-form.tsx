"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginFormData } from "../../schemas";
import { loginAction } from "../../lib/actions";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginAction(data);
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
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            autoComplete="current-password"
            error={errors.password?.message}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/password-reset"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Sign in
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
