"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Global error boundary caught:", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#18181b',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AlertTriangle size={32} color='#ef4444' />
              </div>
            </div>

            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#fafafa',
              marginBottom: '0.5rem',
            }}>
              Critical Error
            </h1>
            <p style={{
              textAlign: 'center',
              color: '#a1a1aa',
              marginBottom: '1.5rem',
            }}>
              A critical error occurred. Please refresh the page.
            </p>

            {process.env.NODE_ENV === "development" && error.message && (
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#27272a',
                borderRadius: '0.5rem',
                border: '1px solid #3f3f46',
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: '#ef4444',
                  wordBreak: 'break-word',
                }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#71717a',
                    marginTop: '0.5rem',
                  }}>
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: '#fafafa',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#27272a',
                  color: '#fafafa',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3f3f46'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
