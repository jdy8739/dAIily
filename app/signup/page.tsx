import SignupForm from "../../features/auth/components/organisms/signup-form";

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-success/20 via-accent/10 to-info/20">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-success to-accent p-6 rounded-xl mb-8 max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-success-foreground mb-2 text-foreground">
              Join the Daiily Community
            </h1>
            <p className="text-success-foreground/90 text-lg">
              Start documenting your professional growth journey today
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 max-w-md mx-auto">
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
