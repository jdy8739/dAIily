"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getNewCsrfToken } from "@/lib/csrf-client";

interface CsrfContextType {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType>({
  token: null,
  isLoading: true,
  refreshToken: async () => {},
});

const useCsrf = () => {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error("useCsrf must be used within CsrfProvider");
  }
  return context;
};

interface CsrfProviderProps {
  children: React.ReactNode;
}

const CsrfProvider = ({ children }: CsrfProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshToken = async () => {
    try {
      setIsLoading(true);
      const newToken = await getNewCsrfToken();
      setToken(newToken);
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial token fetch
  useEffect(() => {
    refreshToken();
  }, []);

  // Auto-refresh token every 50 minutes (before 1-hour expiry)
  useEffect(() => {
    const interval = setInterval(
      () => {
        refreshToken();
      },
      50 * 60 * 1000
    ); // 50 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <CsrfContext.Provider value={{ token, isLoading, refreshToken }}>
      {children}
    </CsrfContext.Provider>
  );
};

export { CsrfProvider, useCsrf };
