import { validateEnv, safeValidateEnv, type ServerEnv, type ClientEnv } from '../schemas/env';
import type { ZodError } from 'zod';

/**
 * Environment validation utility for Threadly applications
 * Validates environment variables at application startup
 */

interface EnvValidationOptions {
  /**
   * Whether to skip validation (NOT recommended for production)
   */
  skipValidation?: boolean;
  /**
   * Whether this is a server-side environment
   */
  isServer?: boolean;
  /**
   * Whether to exit the process on validation failure
   */
  exitOnFailure?: boolean;
  /**
   * Custom error handler
   */
  onError?: (error: ZodError) => void;
}

/**
 * Formats Zod validation errors for better readability
 */
function formatValidationErrors(error: ZodError): string {
  const errors = error.errors.map(err => {
    const path = err.path.join('.');
    return `  - ${path}: ${err.message}`;
  });
  
  return `Environment validation failed:\n${errors.join('\n')}`;
}

/**
 * Validates environment variables and returns typed environment object
 * @param options - Validation options
 * @returns Validated environment variables
 */
export function validateEnvironment(options: EnvValidationOptions = {}): ServerEnv | ClientEnv {
  const {
    skipValidation = process.env.SKIP_ENV_VALIDATION === 'true',
    isServer = typeof window === 'undefined',
    exitOnFailure = true,
    onError,
  } = options;

  // Skip validation if explicitly disabled
  if (skipValidation) {
    console.warn('⚠️  Environment validation is disabled. This is not recommended for production.');
    return process.env as any;
  }

  try {
    // Validate environment variables
    const validated = validateEnv(process.env, isServer);
    
    // Log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
    }
    
    return validated;
  } catch (error) {
    if (error instanceof Error && 'errors' in error) {
      const zodError = error as ZodError;
      const formattedError = formatValidationErrors(zodError);
      
      // Call custom error handler if provided
      if (onError) {
        onError(zodError);
      }
      
      // Log the error
      console.error(formattedError);
      
      // Exit process if configured
      if (exitOnFailure && process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
      
      // Re-throw in development
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    }
    
    // Return unvalidated env as fallback
    return process.env as any;
  }
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeValidateEnvironment(options: EnvValidationOptions = {}) {
  const {
    skipValidation = process.env.SKIP_ENV_VALIDATION === 'true',
    isServer = typeof window === 'undefined',
  } = options;

  if (skipValidation) {
    return {
      success: true,
      data: process.env,
      error: null,
    };
  }

  const result = safeValidateEnv(process.env, isServer);
  
  if (!result.success) {
    const formattedError = formatValidationErrors(result.error);
    console.error(formattedError);
  }
  
  return result;
}

/**
 * Type-safe environment variable getter
 */
export function getEnvVar<K extends keyof ServerEnv>(
  key: K,
  env: ServerEnv | ClientEnv = process.env as any
): ServerEnv[K] {
  return env[key as keyof typeof env] as ServerEnv[K];
}

/**
 * Check if all required environment variables are present
 */
export function checkRequiredEnvVars(required: string[]): {
  missing: string[];
  present: string[];
} {
  const missing: string[] = [];
  const present: string[] = [];
  
  for (const key of required) {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }
  
  return { missing, present };
}

/**
 * Environment-specific configuration helper
 */
export function getEnvConfig<T extends Record<string, any>>(configs: {
  development?: T;
  staging?: T;
  production?: T;
  test?: T;
}): T {
  const env = process.env.NODE_ENV || 'development';
  const vercelEnv = process.env.VERCEL_ENV;
  
  // Map Vercel environments to our config keys
  const environment = vercelEnv === 'preview' ? 'staging' : env;
  
  return configs[environment as keyof typeof configs] || configs.development || {} as T;
}