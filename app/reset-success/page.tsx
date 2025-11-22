import Link from "next/link";

const ResetSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10 flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-10 h-10 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Password Reset Successful!
            </h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center h-10 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold text-base"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetSuccessPage;
