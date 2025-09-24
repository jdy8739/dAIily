import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold text-primary-foreground mb-2">
            Welcome to Daiily, {user.firstName}!
          </h1>
          <p className="text-primary-foreground/90">
            Track your professional growth journey
          </p>
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
                      Your account has been successfully created and you are now
                      logged in. This dashboard will be the starting point for
                      your professional growth tracking.
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
  );
};

export default DashboardPage;
