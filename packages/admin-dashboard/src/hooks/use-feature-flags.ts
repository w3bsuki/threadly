import { useState, useEffect } from 'react';
import type { FeatureFlag } from '../types';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlags() {
      try {
        // Mock implementation - replace with actual API call
        setFlags([
          {
            id: 'new-checkout-flow',
            name: 'New Checkout Flow',
            description: 'Enable the redesigned checkout experience',
            enabled: true,
            rolloutPercentage: 75,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
          },
          {
            id: 'ai-recommendations',
            name: 'AI Product Recommendations',
            description: 'Show AI-powered product suggestions',
            enabled: false,
            rolloutPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'admin',
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
      } finally {
        setIsLoading(false);
      }
    }

    fetchFlags();
  }, []);

  const toggleFlag = async (id: string) => {
    try {
      // Mock implementation - replace with actual API call
      setFlags(current => 
        current.map(flag => 
          flag.id === id 
            ? { ...flag, enabled: !flag.enabled, updatedAt: new Date() }
            : flag
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle flag');
    }
  };

  return { flags, isLoading, error, toggleFlag };
}