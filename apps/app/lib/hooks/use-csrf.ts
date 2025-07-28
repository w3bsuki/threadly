import { addCSRFHeader, getCSRFTokenFromCookie } from '@repo/security';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to manage CSRF tokens for API requests
 */
export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    // Get initial CSRF token
    const token = getCSRFTokenFromCookie();
    setCSRFToken(token);

    // Listen for changes (in case token is refreshed)
    const checkToken = () => {
      const newToken = getCSRFTokenFromCookie();
      if (newToken !== csrfToken) {
        setCSRFToken(newToken);
      }
    };

    // Check periodically for token changes
    const interval = setInterval(checkToken, 60_000); // Check every minute

    return () => clearInterval(interval);
  }, [csrfToken]);

  /**
   * Wrapper around fetch that automatically includes CSRF token
   */
  const fetchWithCSRF = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = addCSRFHeader(options.headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If CSRF validation failed, try to refresh the page to get a new token
      if (response.status === 403) {
        const data = await response.json().catch(() => null);
        if (data?.error === 'CSRF validation failed') {
          // Optionally, you could trigger a token refresh here
        }
      }

      return response;
    },
    []
  );

  /**
   * Get headers with CSRF token included
   */
  const getCSRFHeaders = useCallback(
    (additionalHeaders?: HeadersInit): HeadersInit => {
      return addCSRFHeader(additionalHeaders);
    },
    []
  );

  return {
    csrfToken,
    fetchWithCSRF,
    getCSRFHeaders,
  };
}

/**
 * Higher-order function to wrap an API client with CSRF protection
 */
export function withCSRFProtection<
  T extends (...args: unknown[]) => Promise<Response>,
>(apiFunction: T): T {
  return (async (...args: Parameters<T>) => {
    // Extract options from the last argument if it's an object
    const lastArg = args[args.length - 1];
    const hasOptions =
      lastArg && typeof lastArg === 'object' && 'headers' in lastArg;

    if (hasOptions) {
      // Add CSRF headers to existing options
      const options = lastArg as RequestInit;
      options.headers = addCSRFHeader(options.headers);
    } else {
      // Add options with CSRF headers
      const typedArgs = args as unknown[];
      typedArgs.push({
        headers: addCSRFHeader(),
      });
      return apiFunction(...(typedArgs as Parameters<T>));
    }

    return apiFunction(...args);
  }) as T;
}
