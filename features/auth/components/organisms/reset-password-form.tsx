"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { newPasswordSchema, type NewPasswordFormData } from "../../schemas";
import { resetPasswordWithTokenAction } from "../../lib/actions";
import Input from "../../../../components/atoms/input";
import Button from "../../../../components/atoms/button";

const ResetPasswordForm = ({
  token,
  csrfToken,
}: {
  token: string;
  csrfToken: string;
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      token: token,
    },
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    setError(null);
    const result = await resetPasswordWithTokenAction({ ...data, csrfToken });

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      router.push("/reset-success");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card py-8 px-4 shadow-lg rounded-lg sm:px-10 border border-border">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Reset Your Password
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-md">
            <p className="text-sm text-accent font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("token")} />

          <Input
            {...register("password")}
            type="password"
            label="New Password"
            error={errors.password?.message}
            description="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number"
          />

          <Input
            {...register("confirmPassword")}
            type="password"
            label="Confirm Password"
            error={errors.confirmPassword?.message}
          />

          <Button
            type="submit"
            className="w-full"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Reset Password
          </Button>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
