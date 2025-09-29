import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";

const DashboardPage = async () => {
  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 min-h-screen">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl mb-8">
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">
              Welcome to Daiily!
            </h1>
            <p className="text-primary-foreground/90">
              Track your professional growth journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/write"
              className="group bg-gradient-to-r from-success to-accent p-6 rounded-xl border border-success/30 hover:border-success/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-success-foreground/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">✏️</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-accent-foreground mb-1">
                    Write New Entry
                  </h3>
                  <p className="text-accent-foreground/80">
                    Share your daily professional growth and achievements
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/feed"
              className="group bg-gradient-to-r from-accent to-info p-6 rounded-xl border border-accent/30 hover:border-accent/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent-foreground/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-accent-foreground mb-1">
                    Browse Feed
                  </h3>
                  <p className="text-accent-foreground/80">
                    Discover and get inspired by others' growth stories
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-card rounded-lg shadow px-5 py-6 sm:px-6 border border-primary/20">
            <div className="mt-6">
              <div className="bg-gradient-to-r from-info/20 to-accent/20 border border-accent/30 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-accent">
                      Authentication Setup Complete
                    </h3>
                    <div className="mt-2 text-sm text-accent/90">
                      <p>
                        Your account has been successfully created and you are
                        now logged in. This dashboard will be the starting point
                        for your professional growth tracking.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-gradient-to-br from-success/10 to-primary/10 overflow-hidden shadow rounded-lg border border-primary/30">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📝
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Daily Entries
                          </dt>
                          <dd className="text-lg font-medium text-foreground">
                            0
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-success/10 to-primary/10 overflow-hidden shadow rounded-lg border border-primary/30">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            📈
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Growth Streak
                          </dt>
                          <dd className="text-lg font-medium text-foreground">
                            0 days
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-success/10 to-primary/10 overflow-hidden shadow rounded-lg border border-primary/30">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            🎯
                          </span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Goals Achieved
                          </dt>
                          <dd className="text-lg font-medium text-foreground">
                            0
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default DashboardPage;
