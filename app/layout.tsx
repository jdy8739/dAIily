import "./globals.css";
import ThemeProvider from "../components/providers/theme-provider";
import SessionProvider from "../components/providers/session-provider";
import ThemeToggle from "../components/atoms/theme-toggle";
import ThemeBody from "../components/providers/theme-body";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={false}
            storageKey="theme"
          >
            <ThemeBody>
              {/* Global Theme Toggle */}
              <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
              </div>

              {children}
            </ThemeBody>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
