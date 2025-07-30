import { initializeSentry } from '@repo/tooling/observability/instrumentation';
import { captureRequestError } from '@sentry/nextjs';

// Initialize Sentry
export const register = initializeSentry();

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
  await captureRequestError(error, request, context);
}
