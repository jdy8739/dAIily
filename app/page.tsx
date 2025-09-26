import { getCurrentUser } from "../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ThemeDemo from "../components/molecules/theme-demo";

const Home = async () => {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Daiily</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the professional growth tracking app!
          </p>
        </header>

        <div className="space-y-6">
          <ThemeDemo />

          {/* Navigation */}
          <div className="p-6 rounded-lg border bg-card text-card-foreground border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Quick Navigation</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="px-4 py-2 bg-info text-info-foreground rounded-md hover-info transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-success text-success-foreground rounded-md hover-success transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover-accent transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/write"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover-primary transition-colors"
              >
                Write Entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
