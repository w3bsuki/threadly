'use client';

import { CheckCircle2, InfoIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardContent } from '../ui/card';
import { useWizard } from './multi-step-wizard';

interface WizardCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function WizardCard({
  children,
  className,
  noPadding,
}: WizardCardProps) {
  return (
    <Card className={cn('border-0 shadow-lg', className)}>
      {noPadding ? (
        children
      ) : (
        <CardContent className="p-6">{children}</CardContent>
      )}
    </Card>
  );
}

interface WizardSummaryProps {
  title?: string;
  items: Array<{
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function WizardSummary({ title, items, className }: WizardSummaryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && <h4 className="font-medium text-lg">{title}</h4>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div className="flex items-start gap-3" key={index}>
            {item.icon && <div className="mt-0.5">{item.icon}</div>}
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">{item.label}</p>
              <p className="font-medium">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface WizardInfoProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

export function WizardInfo({
  children,
  className,
  variant = 'default',
}: WizardInfoProps) {
  return (
    <Alert className={cn('mb-4', className)} variant={variant}>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

interface WizardSuccessProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function WizardSuccess({
  title = 'Success!',
  description,
  children,
  className,
}: WizardSuccessProps) {
  return (
    <div className={cn('space-y-4 py-8 text-center', className)}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="pt-4">{children}</div>}
    </div>
  );
}

interface WizardErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function WizardError({ error, onRetry, className }: WizardErrorProps) {
  const errorMessage =
    error instanceof Error ? error.message : error || 'An error occurred';

  return (
    <Alert className={cn('mb-4', className)} variant="destructive">
      <AlertDescription className="space-y-2">
        <p>{errorMessage}</p>
        {onRetry && (
          <button
            className="font-medium text-sm underline underline-offset-4"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface WizardFieldGroupProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function WizardFieldGroup({
  children,
  className,
  columns = 1,
}: WizardFieldGroupProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={cn(`grid gap-4 ${gridClass}`, className)}>{children}</div>
  );
}

export function useWizardKeyboardNavigation() {
  const wizard = useWizard();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && e.ctrlKey && wizard.canGoNext) {
        e.preventDefault();
        wizard.nextStep();
      } else if (e.key === 'ArrowLeft' && e.ctrlKey && wizard.canGoPrevious) {
        e.preventDefault();
        wizard.previousStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [wizard]);
}

interface WizardMobileNavigationProps {
  className?: string;
}

export function WizardMobileNavigation({
  className,
}: WizardMobileNavigationProps) {
  const wizard = useWizard();

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 left-0 border-t bg-background p-4 md:hidden',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <button
          className="font-medium text-sm"
          disabled={!wizard.canGoPrevious}
          onClick={wizard.previousStep}
        >
          Back
        </button>
        <span className="text-muted-foreground text-sm">
          Step {wizard.currentStep + 1} of {wizard.totalSteps}
        </span>
        <button
          className="font-medium text-sm"
          disabled={!wizard.canGoNext}
          onClick={wizard.nextStep}
        >
          {wizard.isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
}
