import { redirect } from "next/navigation";
import { generateCsrfToken } from "../../lib/csrf";
import ResetPasswordForm from "../../features/auth/components/organisms/reset-password-form";

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams;
  const token = params.token;

  if (!token || typeof token !== "string") {
    redirect("/login?error=Invalid reset link");
  }

  const csrfToken = generateCsrfToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Reset Your Password
          </h1>
          <p className="text-lg text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <div className="flex justify-center">
          <ResetPasswordForm token={token} csrfToken={csrfToken} />
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
