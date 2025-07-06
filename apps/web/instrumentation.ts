import { captureRequestError } from '@sentry/nextjs';
import { initializeSentry } from '@repo/observability/instrumentation';

// Initialize Sentry
export const register = initializeSentry();

// Next.js 15 error handling hook for request errors
export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] | undefined };
  }
) {
  await captureRequestError(error, request);
}
