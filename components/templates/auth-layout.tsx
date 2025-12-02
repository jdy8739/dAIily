import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "../../features/auth/components/molecules/logout-button";
import ThemeToggle from "../atoms/theme-toggle";
import NavDropdown from "../molecules/nav-dropdown";
import MobileMenu from "../atoms/mobile-menu";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-2 sm:gap-4">
            {/* Logo */}
            <Link
              href="/feed"
              className="flex items-center space-x-2 flex-shrink-0"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="6" fill="url(#gradient)" />
                <rect x="6" y="22" width="4" height="4" rx="1" fill="white" />
                <rect x="11" y="18" width="4" height="8" rx="1" fill="white" />
                <rect x="16" y="14" width="4" height="12" rx="1" fill="white" />
                <rect x="21" y="10" width="4" height="16" rx="1" fill="white" />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0"
                    y1="0"
                    x2="32"
                    y2="32"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <h1 className="text-lg sm:text-xl font-semibold text-foreground hidden xs:inline">
                Daiily
              </h1>
            </Link>

            {/* Navigation - Hidden on mobile, visible on sm+ */}
            <nav className="hidden sm:flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
              <Link
                href="/write"
                className="text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                Write
              </Link>
              <NavDropdown
                label="Posts"
                items={[
                  { label: "Feed", href: "/feed" },
                  { label: "Drafts", href: "/drafts" },
                ]}
              />
              <Link
                href={`/story/${userId}`}
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                Story
              </Link>
            </nav>

            {/* Right section - Flexible spacing */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">
              <Link
                href="/profile"
                className="hidden sm:block text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Profile
              </Link>
              <MobileMenu userName={user.name || "User"} />
              <LogoutButton className="hidden sm:block" />
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
