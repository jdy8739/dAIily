import "./globals.css";
import ThemeProvider from "../components/providers/theme-provider";
import SessionProvider from "../components/providers/session-provider";
import ThemeToggle from "../components/atoms/theme-toggle";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors">
        <SessionProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            storageKey="theme"
          >
            {/* Global Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>

            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
