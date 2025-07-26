import { z } from 'zod';

/**
 * Feature flag system for Threadly
 * Enables controlled rollout of new features
 */

// Define all feature flags
export const FeatureFlagSchema = z.object({
  // E-commerce features
  enableNewCheckout: z.boolean().default(false),
  enableAIChat: z.boolean().default(false),
  enableAdvancedSearch: z.boolean().default(false),
  enableSocialLogin: z.boolean().default(false),
  
  // Seller features
  enableSellerAnalytics: z.boolean().default(false),
  enableBulkListing: z.boolean().default(false),
  enableInventoryManagement: z.boolean().default(false),
  
  // Payment features
  enableCryptoPay: z.boolean().default(false),
  enablePayPal: z.boolean().default(false),
  enableAfterPay: z.boolean().default(false),
  
  // Communication features
  enableVideoChat: z.boolean().default(false),
  enableVoiceMessages: z.boolean().default(false),
  enableTranslation: z.boolean().default(false),
  
  // Performance features
  enableImageOptimization: z.boolean().default(true),
  enableLazyLoading: z.boolean().default(true),
  enableServiceWorker: z.boolean().default(false),
  
  // Security features
  enable2FA: z.boolean().default(false),
  enableBiometricAuth: z.boolean().default(false),
  enableIPWhitelisting: z.boolean().default(false),
  
  // Beta features
  enableBetaFeatures: z.boolean().default(false),
  enableExperimentalUI: z.boolean().default(false),
});

export type FeatureFlags = z.infer<typeof FeatureFlagSchema>;

/**
 * Feature flag provider class
 */
export class FeatureFlagProvider {
  private flags: FeatureFlags;
  private userOverrides: Partial<FeatureFlags> = {};
  
  constructor(flags?: Partial<FeatureFlags>) {
    // Parse environment-based flags
    const envFlags = this.parseEnvFlags();
    
    // Merge with provided flags
    this.flags = FeatureFlagSchema.parse({
      ...envFlags,
      ...flags,
    });
  }
  
  /**
   * Parse feature flags from environment variables
   */
  private parseEnvFlags(): Partial<FeatureFlags> {
    const flags: Partial<FeatureFlags> = {};
    
    // Map environment variables to feature flags
    if (process.env.ENABLE_NEW_CHECKOUT === 'true') {
      flags.enableNewCheckout = true;
    }
    if (process.env.ENABLE_AI_CHAT === 'true') {
      flags.enableAIChat = true;
    }
    // Add more environment variable mappings as needed
    
    return flags;
  }
  
  /**
   * Check if a feature is enabled
   */
  isEnabled(flagName: keyof FeatureFlags): boolean {
    // Check user overrides first
    if (flagName in this.userOverrides) {
      return this.userOverrides[flagName] ?? false;
    }
    
    return this.flags[flagName];
  }
  
  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlags {
    return {
      ...this.flags,
      ...this.userOverrides,
    };
  }
  
  /**
   * Set user-specific overrides (e.g., for beta testers)
   */
  setUserOverrides(overrides: Partial<FeatureFlags>) {
    this.userOverrides = overrides;
  }
  
  /**
   * Clear user overrides
   */
  clearUserOverrides() {
    this.userOverrides = {};
  }
  
  /**
   * Enable a feature for testing
   */
  enable(flagName: keyof FeatureFlags) {
    this.userOverrides[flagName] = true;
  }
  
  /**
   * Disable a feature for testing
   */
  disable(flagName: keyof FeatureFlags) {
    this.userOverrides[flagName] = false;
  }
  
  /**
   * Check multiple flags at once
   */
  areEnabled(...flagNames: (keyof FeatureFlags)[]): boolean {
    return flagNames.every(flag => this.isEnabled(flag));
  }
  
  /**
   * Check if any of the flags are enabled
   */
  anyEnabled(...flagNames: (keyof FeatureFlags)[]): boolean {
    return flagNames.some(flag => this.isEnabled(flag));
  }
}

/**
 * React hook for feature flags (to be used in client components)
 */
export function useFeatureFlags() {
  // This would typically connect to a context provider
  // For now, return a static instance
  const provider = new FeatureFlagProvider();
  
  return {
    isEnabled: (flag: keyof FeatureFlags) => provider.isEnabled(flag),
    flags: provider.getAllFlags(),
  };
}

/**
 * Server-side feature flag checker
 */
export function checkFeatureFlag(
  flagName: keyof FeatureFlags,
  flags?: Partial<FeatureFlags>
): boolean {
  const provider = new FeatureFlagProvider(flags);
  return provider.isEnabled(flagName);
}

/**
 * Feature flag middleware for API routes
 */
export function requireFeatureFlag(flagName: keyof FeatureFlags) {
  return (req: Request) => {
    const provider = new FeatureFlagProvider();
    
    if (!provider.isEnabled(flagName)) {
      return new Response(
        JSON.stringify({
          error: 'Feature not available',
          message: `The feature "${flagName}" is not currently enabled`,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return null; // Continue to handler
  };
}

/**
 * A/B testing utilities
 */
export class ABTestProvider {
  private tests: Map<string, {
    variants: string[];
    weights?: number[];
  }> = new Map();
  
  /**
   * Define an A/B test
   */
  defineTest(testName: string, variants: string[], weights?: number[]) {
    this.tests.set(testName, { variants, weights });
  }
  
  /**
   * Get variant for a user
   */
  getVariant(testName: string, userId: string): string | null {
    const test = this.tests.get(testName);
    if (!test) return null;
    
    // Simple hash-based assignment
    const hash = this.hashUserId(userId);
    const index = hash % test.variants.length;
    
    return test.variants[index] ?? null;
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Export a singleton instance
export const featureFlags = new FeatureFlagProvider();
export const abTests = new ABTestProvider();