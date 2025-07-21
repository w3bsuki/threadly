// Core error handling exports (no React/Next.js dependencies)
export * from './error-logger';
export * from './retry';
export * from './circuit-breaker';
export * from './types';

// React/Next.js components are excluded from build but available for manual import
// import { ErrorBoundary } from '@repo/error-handling/error-boundary';
// import { ErrorPage } from '@repo/error-handling/error-pages';
// import { handleApiError } from '@repo/error-handling/error-handler';