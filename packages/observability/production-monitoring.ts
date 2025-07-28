/**
 * Production monitoring configuration utilities
 *
 * This module provides utilities for setting up comprehensive monitoring
 * in production environments using Sentry and other observability tools.
 */

import { log } from './log';

export interface MonitoringConfig {
  sentry: {
    dsn: string;
    org: string;
    project: string;
    authToken: string;
    environment: string;
    release?: string;
  };
  betterStack?: {
    apiKey: string;
    url: string;
  };
}

export function validateMonitoringConfig(
  config: Partial<MonitoringConfig>
): MonitoringConfig {
  const errors: string[] = [];

  // Validate Sentry configuration
  if (!config.sentry?.dsn) {
    errors.push('SENTRY_DSN is required');
  } else if (!config.sentry.dsn.startsWith('https://')) {
    errors.push('SENTRY_DSN must be a valid HTTPS URL');
  }

  if (!config.sentry?.org) {
    errors.push('SENTRY_ORG is required');
  }

  if (!config.sentry?.project) {
    errors.push('SENTRY_PROJECT is required');
  }

  if (!config.sentry?.authToken) {
    errors.push('SENTRY_AUTH_TOKEN is required for releases');
  }

  if (!config.sentry?.environment) {
    errors.push('SENTRY_ENVIRONMENT is required');
  }

  if (errors.length > 0) {
    const errorMessage = `Monitoring configuration validation failed:\n${errors.join('\n')}`;
    log.error('Monitoring configuration invalid', { errors });
    throw new Error(errorMessage);
  }

  return {
    sentry: {
      dsn: config.sentry!.dsn,
      org: config.sentry!.org,
      project: config.sentry!.project,
      authToken: config.sentry!.authToken,
      environment: config.sentry!.environment,
      release: config.sentry!.release,
    },
    betterStack: config.betterStack,
  };
}

export function getProductionMonitoringConfig(): MonitoringConfig {
  const config = {
    sentry: {
      dsn: process.env.SENTRY_DSN!,
      org: process.env.SENTRY_ORG!,
      project: process.env.SENTRY_PROJECT!,
      authToken: process.env.SENTRY_AUTH_TOKEN!,
      environment: process.env.SENTRY_ENVIRONMENT || 'production',
      release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
    },
    betterStack: process.env.BETTERSTACK_API_KEY
      ? {
          apiKey: process.env.BETTERSTACK_API_KEY,
          url: process.env.BETTERSTACK_URL!,
        }
      : undefined,
  };

  return validateMonitoringConfig(config);
}

export function generateSentrySetupGuide(config: {
  appName: string;
  domains: string[];
}) {
  return {
    title: 'Sentry Production Setup Guide',
    steps: [
      {
        step: 1,
        title: 'Create Sentry Organization & Project',
        description: 'Set up your Sentry monitoring infrastructure',
        actions: [
          'Go to https://sentry.io and create account',
          'Create organization for your company',
          `Create project named "${config.appName}"`,
          'Select "Next.js" as the platform',
        ],
      },
      {
        step: 2,
        title: 'Get API Keys',
        description: 'Retrieve the required keys from Sentry Dashboard',
        keys: {
          DSN: 'Project Settings > Client Keys (DSN)',
          'Auth Token': 'Settings > Auth Tokens > Create Token',
          Organization: 'Organization slug from URL',
          Project: 'Project slug from URL',
        },
      },
      {
        step: 3,
        title: 'Environment Variables',
        description: 'Set these environment variables in production',
        variables: {
          SENTRY_DSN: 'Server-side DSN from project settings',
          NEXT_PUBLIC_SENTRY_DSN: 'Client-side DSN (same as above)',
          SENTRY_ORG: 'Organization slug',
          SENTRY_PROJECT: 'Project slug',
          SENTRY_AUTH_TOKEN: 'Auth token for releases',
          SENTRY_ENVIRONMENT: 'production',
          NEXT_PUBLIC_SENTRY_ENVIRONMENT: 'production',
        },
      },
      {
        step: 4,
        title: 'Configure Alerts',
        description: 'Set up alerts for critical errors',
        alerts: [
          'Error rate > 5% in 5 minutes',
          'New issue created',
          'Performance degradation > 2x baseline',
          'Database errors',
          'Payment processing errors',
        ],
      },
      {
        step: 5,
        title: 'Set Up Release Tracking',
        description: 'Track deployments and releases',
        actions: [
          'Enable automatic release creation',
          'Connect GitHub repository',
          'Set up deploy hooks',
          'Configure source maps upload',
        ],
      },
    ],
    bestPractices: {
      errorFiltering: [
        'Filter out network errors from user connectivity issues',
        'Exclude cancelled/aborted requests',
        'Filter development-only errors',
        'Set up rate limiting for noisy errors',
      ],
      performance: [
        'Set appropriate sampling rate (10% for production)',
        'Monitor Core Web Vitals',
        'Track database query performance',
        'Monitor API response times',
      ],
      security: [
        'Disable PII collection (sendDefaultPii: false)',
        'Scrub sensitive data from events',
        'Set up IP allowlists if needed',
        'Regularly rotate auth tokens',
      ],
    },
  };
}

// Extend window type for Sentry
declare global {
  interface Window {
    Sentry?: {
      captureUserFeedback: (feedback: {
        event_id: string;
        name: string;
        email: string;
        comments: string;
      }) => void;
      setUser: (user: {
        id: string;
        email?: string;
        username?: string;
      }) => void;
      addBreadcrumb: (breadcrumb: {
        message: string;
        category: string;
        level: string;
        timestamp: number;
      }) => void;
      withScope: (callback: (scope: any) => void) => void;
      captureException: (error: Error) => void;
    };
  }
}

export function createErrorReportingUtils() {
  return {
    // Capture user feedback
    captureUserFeedback: (
      eventId: string,
      feedback: {
        name: string;
        email: string;
        comments: string;
      }
    ) => {
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.captureUserFeedback({
          event_id: eventId,
          name: feedback.name,
          email: feedback.email,
          comments: feedback.comments,
        });
      }
    },

    // Set user context
    setUserContext: (user: {
      id: string;
      email?: string;
      username?: string;
    }) => {
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.setUser(user);
      }
    },

    // Add breadcrumb
    addBreadcrumb: (
      message: string,
      category: string,
      level: 'info' | 'warning' | 'error' = 'info'
    ) => {
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.addBreadcrumb({
          message,
          category,
          level,
          timestamp: Date.now() / 1000,
        });
      }
    },

    // Capture exception with context
    captureExceptionWithContext: (
      error: Error,
      context: Record<string, any>
    ) => {
      if (typeof window !== 'undefined' && window.Sentry) {
        window.Sentry.withScope((scope: any) => {
          Object.entries(context).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
          window.Sentry!.captureException(error);
        });
      }
    },
  };
}

export function validateProductionReadiness(): {
  ready: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const config = getProductionMonitoringConfig();

    // Check environment
    if (config.sentry.environment !== 'production') {
      recommendations.push(
        'Set SENTRY_ENVIRONMENT to "production" for production deployment'
      );
    }

    // Check release tracking
    if (!config.sentry.release) {
      recommendations.push(
        'Set SENTRY_RELEASE for better error tracking and release monitoring'
      );
    }

    // Check auth token
    if (!config.sentry.authToken) {
      issues.push(
        'SENTRY_AUTH_TOKEN is required for automated release creation'
      );
    }

    // Check Better Stack integration
    if (!config.betterStack) {
      recommendations.push(
        'Consider adding Better Stack for uptime monitoring'
      );
    }

    return {
      ready: issues.length === 0,
      issues,
      recommendations,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      ready: false,
      issues: [`Monitoring configuration validation failed: ${errorMessage}`],
      recommendations: [
        'Fix monitoring configuration before deploying to production',
      ],
    };
  }
}
