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
    <div className="min-h-screen bg-gradient-to-br from-info/20 via-primary/10 to-accent/20">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-info to-primary p-6 rounded-xl mb-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-info-foreground mb-2 text-foreground">
              Reset Your Password
            </h1>
            <p className="text-info-foreground/90 text-lg">
              Enter your new password below
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 max-w-md mx-auto">
            <ResetPasswordForm token={token} csrfToken={csrfToken} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
