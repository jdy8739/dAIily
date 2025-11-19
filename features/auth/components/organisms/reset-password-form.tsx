"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { newPasswordSchema, type NewPasswordFormData } from "../../schemas";
import { resetPasswordWithTokenAction } from "../../lib/actions";
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
    <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8">
      <h2 className="text-2xl font-semibold text-foreground mb-6">
        Reset Your Password
      </h2>

      {error && (
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6">
          <p className="text-accent text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("token")} />

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-foreground mb-2"
          >
            New Password
          </label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            placeholder="Enter your new password"
          />
          {errors.password && (
            <p className="text-accent text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register("confirmPassword")}
            className="w-full px-4 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="text-accent text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
