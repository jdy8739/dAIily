import SignupForm from "../../features/auth/components/organisms/signup-form";

const SignupPage = () => {
  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Daiily
          </h1>
          <p className="text-muted-foreground">
            Start tracking your professional growth
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
