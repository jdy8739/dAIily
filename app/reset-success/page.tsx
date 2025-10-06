import Link from "next/link";

const ResetSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-success/20 via-primary/10 to-accent/20">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8 text-center">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
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

            <h1 className="text-2xl font-bold text-foreground mb-3">
              Password Reset Successful!
            </h1>

            <p className="text-muted-foreground mb-6">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccessPage;
