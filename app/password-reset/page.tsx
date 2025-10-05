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
    <div className="min-h-screen bg-gradient-to-br from-warning/20 via-accent/10 to-primary/20">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-warning to-accent p-6 rounded-xl mb-8 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-warning-foreground mb-2 text-foreground">
              Reset Your Password
            </h1>
            <p className="text-warning-foreground/90">
              Secure password recovery for your Daiily account
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          <div className="flex-1 max-w-md">
            <PasswordResetForm csrfToken={csrfToken} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
