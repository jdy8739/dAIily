import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../features/auth/components/molecules/logout-button";
import ThemeToggle from "../atoms/theme-toggle";
import NavDropdown from "../molecules/nav-dropdown";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-8">
              <Link href="/feed" className="flex items-center">
                <h1 className="text-xl font-semibold text-foreground">Daiily</h1>
              </Link>

              <nav className="flex items-center space-x-6">
                <NavDropdown
                  label="Posts"
                  items={[
                    { label: "Write", href: "/write" },
                    { label: "Feed", href: "/feed" },
                    { label: "Drafts", href: "/drafts" },
                  ]}
                />
                <Link
                  href="/story"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Story
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {user.name}
              </Link>
              <LogoutButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-14">{children}</main>
    </div>
  );
};

export default AuthLayout;
