import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import { generateCsrfToken } from "../../lib/csrf";
import PasswordResetForm from "../../features/auth/components/organisms/password-reset-form";

const PasswordResetPage = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/feed");
  }

  const csrfToken = generateCsrfToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/10 via-background to-primary/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Reset Your Password
          </h1>
          <p className="text-lg text-muted-foreground">
            Secure password recovery for your Daiily account
          </p>
        </div>

        <div className="flex justify-center">
          <PasswordResetForm csrfToken={csrfToken} />
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
