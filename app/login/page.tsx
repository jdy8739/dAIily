import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "../../features/auth/components/organisms/login-form";

const LoginPage = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-info/20 via-primary/10 to-accent/20">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-info to-primary p-6 rounded-xl mb-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-info-foreground mb-2 text-foreground">
              Welcome Back to Daiily
            </h1>
            <p className="text-info-foreground/90 text-lg">
              Continue your professional growth journey
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 max-w-md mx-auto">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
