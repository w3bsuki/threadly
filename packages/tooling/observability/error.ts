import * as Sentry from '@sentry/nextjs';
import { log } from './log';

export const parseError = (error: unknown): string => {
  let message = 'An error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = error.message as string;
  } else {
    message = String(error);
  }

  try {
    Sentry.captureException(error);
    log.error(`Parsing error: ${message}`);
  } catch (newError) {
    // biome-ignore lint/suspicious/noConsole: Need console here
  }

  return message;
};

/**
 * Safely logs an error with proper type handling
 * Converts unknown error types to logger-compatible format
 */
export const logError = (message: string, error: unknown): void => {
  try {
    // Convert unknown error to a format the logger expects
    if (error instanceof Error) {
      log.error(message, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else if (error && typeof error === 'object') {
      log.error(message, { error });
    } else {
      log.error(message, { error: String(error) });
    }

    // Also capture for external error tracking
    Sentry.captureException(error);
  } catch (loggingError) {
    // Fallback to console if logging fails
    // biome-ignore lint/suspicious/noConsole: Need console here
  }
};
