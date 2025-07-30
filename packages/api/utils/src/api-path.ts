/**
 * Utility to ensure API paths don't get locale prefixes
 * Use this for all client-side API calls to prevent locale routing issues
 */
export function getApiPath(path: string): string {
  // Ensure path starts with /api/
  if (!path.startsWith('/api/')) {
    throw new Error('API path must start with /api/');
  }

  // In client-side code, we need to strip any locale prefix from the current URL
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const localeMatch = currentPath.match(/^\/([a-z]{2})\//);

    if (localeMatch) {
      // We're on a locale-prefixed page, need to go up one level
      return `..${path}`;
    }
  }

  return path;
}

/**
 * Alternative approach: Use absolute URL
 * This is more reliable but requires knowing the app URL
 */
export function getAbsoluteApiPath(path: string, baseUrl?: string): string {
  if (!path.startsWith('/api/')) {
    throw new Error('API path must start with /api/');
  }

  // Use provided baseUrl or current origin
  const base =
    baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base}${path}`;
}
