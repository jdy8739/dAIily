import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeProvider from "../components/providers/theme-provider";
import SessionProvider from "../components/providers/session-provider";
import { CsrfProvider } from "../components/providers/csrf-provider";
import ThemeToggle from "../components/atoms/theme-toggle";
import ErrorBoundary from "../components/atoms/error-boundary";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "../lib/structured-data";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  title: {
    default: "Daiily - Professional Growth Diary",
    template: "%s | Daiily",
  },
  description:
    "Share daily professional experiences at your firm. Track what you did, learned, and achieved each day. Grow together with professionals in your field.",
  keywords: [
    "professional growth",
    "career development",
    "daily diary",
    "work journal",
    "professional development",
    "career tracking",
    "growth diary",
  ],
  authors: [{ name: "Daiily" }],
  creator: "Daiily",
  publisher: "Daiily",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Daiily",
    title: "Daiily - Professional Growth Diary",
    description:
      "Share daily professional experiences at your firm. Track what you did, learned, and achieved each day.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Daiily - Track Your Professional Growth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daiily - Professional Growth Diary",
    description:
      "Share daily professional experiences at your firm. Track what you did, learned, and achieved each day.",
    images: ["/twitter-image"],
    creator: "@daiily",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  // Generate structured data schemas for SEO
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className={`${inter.className} transition-colors antialiased`}>
        <ErrorBoundary>
          <SessionProvider>
            <CsrfProvider>
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
            </CsrfProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
};

export default RootLayout;
