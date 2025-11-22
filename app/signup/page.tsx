import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import { generateCsrfToken } from "../../lib/csrf";
import SignupForm from "../../features/auth/components/organisms/signup-form";

const SignupPage = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/feed");
  }

  const csrfToken = generateCsrfToken();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Join the Daiily Community
          </h1>
          <p className="text-lg text-muted-foreground">
            Start documenting your professional growth journey today
          </p>
        </div>

        <div className="flex justify-center">
          <SignupForm csrfToken={csrfToken} />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
