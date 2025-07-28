'use client';

import { Button, toast } from '@repo/design-system/components';
import { Zap } from 'lucide-react';
import { useState } from 'react';

interface QuickSetupButtonProps {
  returnTo: string;
}

export function QuickSetupButton({ returnTo }: QuickSetupButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickSetup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seller/quick-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo }),
      });

      const data = await response.json();

      if (data.success && data.redirectTo) {
        toast.success('Quick setup complete! Redirecting...');
        window.location.href = data.redirectTo;
      } else {
        throw new Error(data.error || 'Failed to complete quick setup');
      }
    } catch (error) {
      toast.error('Failed to complete quick setup');
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border bg-muted/50 p-6">
      <h3 className="mb-2 font-semibold">Want to start selling immediately?</h3>
      <p className="mb-4 text-muted-foreground text-sm">
        Skip the full setup and start with basic settings. You can complete your
        profile later.
      </p>
      <Button
        className="w-full sm:w-auto"
        disabled={isLoading}
        onClick={handleQuickSetup}
      >
        <Zap className="mr-2 h-4 w-4" />
        {isLoading ? 'Setting up...' : 'Quick Setup - Start Selling Now'}
      </Button>
    </div>
  );
}
