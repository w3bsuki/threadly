// Temporarily disabled due to self is not defined error
export const register = () => {};

// Next.js 15 error handling hook for request errors
export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] | undefined };
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
  }
) {
  console.error('Request error:', error);
}
