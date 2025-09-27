import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../molecules/logout-button";
import ThemeToggle from "../atoms/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center">
                <h1 className="text-2xl font-bold text-foreground">Daiily</h1>
              </Link>

              <nav className="flex items-center space-x-6">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/write"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Write
                </Link>
                <Link
                  href="/feed"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feed
                </Link>
                <Link
                  href="/story"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Story
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {user.firstName} {user.lastName}
              </span>
              <LogoutButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[73px]">{children}</main>
    </div>
  );
};

export default AuthLayout;