import "./globals.css";
import ThemeProvider from "../components/providers/theme-provider";
import SessionProvider from "../components/providers/session-provider";
import ThemeToggle from "../components/atoms/theme-toggle";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            <div className="min-h-screen">
              {/* Global Theme Toggle */}
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>

              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
