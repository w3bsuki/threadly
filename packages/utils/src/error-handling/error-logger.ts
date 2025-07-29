import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  request?: {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  componentStack?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
  [key: string]: any;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: Array<{
    error: Error;
    context: ErrorContext;
    timestamp: Date;
  }> = [];
  private isInitialized = false;

  private constructor() {
    this.initialize();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private initialize() {
    if (typeof window !== 'undefined') {
      // Browser error handlers
      window.addEventListener(
        'unhandledrejection',
        this.handleUnhandledRejection
      );
      window.addEventListener('error', this.handleGlobalError);
    }

    if (typeof process !== 'undefined') {
      // Node.js error handlers
      process.on('unhandledRejection', this.handleUnhandledRejection);
      process.on('uncaughtException', this.handleUncaughtException);
    }

    this.isInitialized = true;
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent | any) => {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
    this.logError(error, {
      level: 'error',
      tags: { type: 'unhandled-promise-rejection' },
      extra: { reason: event.reason, promise: event.promise },
    });
  };

  private handleGlobalError = (event: ErrorEvent) => {
    this.logError(event.error || new Error(event.message), {
      level: 'error',
      tags: { type: 'global-error' },
      extra: {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  private handleUncaughtException = (error: Error) => {
    this.logError(error, {
      level: 'fatal',
      tags: { type: 'uncaught-exception' },
    });

    // Exit the process after logging
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  };

  logError(error: Error | string, context: ErrorContext = {}) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const timestamp = new Date();

    // Add to error queue for batch processing
    this.errorQueue.push({ error: errorObj, context, timestamp });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
    }

    // Send to Sentry
    Sentry.withScope((scope) => {
      // Set user context
      if (context.user) {
        scope.setUser({
          id: context.user.id,
          email: context.user.email,
          username: context.user.role,
        });
      }

      // Set tags
      if (context.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }

      // Set extra context
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      // Set level
      scope.setLevel(context.level || 'error');

      // Capture the exception
      Sentry.captureException(errorObj);
    });

    // Process error queue if needed
    this.processErrorQueue();
  }

  private async processErrorQueue() {
    if (this.errorQueue.length > 100) {
      // Send batch to analytics or monitoring service
      const errors = this.errorQueue.splice(0, 50);

      try {
        await this.sendBatchToMonitoring(errors);
      } catch (err) {}
    }
  }

  private async sendBatchToMonitoring(
    errors: Array<{ error: Error; context: ErrorContext; timestamp: Date }>
  ) {
    // This would send to your monitoring service
    // For now, we'll just log
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement actual batch sending
    }
  }

  getErrorStats() {
    const stats = {
      queueSize: this.errorQueue.length,
      recentErrors: this.errorQueue.slice(-10).map(({ error, timestamp }) => ({
        message: error.message,
        timestamp,
      })),
    };

    return stats;
  }

  clearErrorQueue() {
    this.errorQueue = [];
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'unhandledrejection',
        this.handleUnhandledRejection
      );
      window.removeEventListener('error', this.handleGlobalError);
    }

    if (typeof process !== 'undefined') {
      process.removeListener(
        'unhandledRejection',
        this.handleUnhandledRejection
      );
      process.removeListener('uncaughtException', this.handleUncaughtException);
    }

    this.clearErrorQueue();
    this.isInitialized = false;
  }
}

// Export singleton instance methods
export const errorLogger = ErrorLogger.getInstance();
export const logError = (error: Error | string, context?: ErrorContext) =>
  errorLogger.logError(error, context);
export const getErrorStats = () => errorLogger.getErrorStats();
export const clearErrorQueue = () => errorLogger.clearErrorQueue();
