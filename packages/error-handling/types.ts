export interface ErrorMetadata {
  timestamp: Date;
  requestId?: string;
  userId?: string;
  sessionId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface ErrorStats {
  total: number;
  byStatusCode: Record<number, number>;
  byErrorCode: Record<string, number>;
  recentErrors: Array<{
    message: string;
    timestamp: Date;
    statusCode?: number;
  }>;
}

export interface RetryableError {
  retryAfter?: number;
  attempts?: number;
  maxAttempts?: number;
}

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  lastFailureTime?: Date;
  nextAttemptTime?: Date;
}

export interface ErrorReportingConfig {
  enableSentry?: boolean;
  enableLogging?: boolean;
  enableConsole?: boolean;
  captureUnhandledRejections?: boolean;
  environment?: string;
  release?: string;
  sampleRate?: number;
}

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'fatal';

export interface ErrorHandler {
  handle(error: Error, metadata?: ErrorMetadata): void;
  handleAsync(error: Error, metadata?: ErrorMetadata): Promise<void>;
}