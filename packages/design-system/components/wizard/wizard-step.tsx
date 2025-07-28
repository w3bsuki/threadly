'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { useWizard } from './multi-step-wizard';

export interface WizardStepProps {
  children: React.ReactNode;
  className?: string;
  onEnter?: () => void | Promise<void>;
  onExit?: () => void | Promise<void>;
  validate?: () => boolean | Promise<boolean>;
  stepIndex?: number;
}

export function WizardStep({
  children,
  className,
  onEnter,
  onExit,
  validate,
  stepIndex,
}: WizardStepProps) {
  const wizard = useWizard();
  const isActive = stepIndex === undefined || stepIndex === wizard.currentStep;

  React.useEffect(() => {
    if (isActive && onEnter) {
      onEnter();
    }
    return () => {
      if (isActive && onExit) {
        onExit();
      }
    };
  }, [isActive, onEnter, onExit]);

  React.useEffect(() => {
    if (isActive && validate) {
      const checkValidity = async () => {
        const isValid = await validate();
        wizard.setCanGoNext(isValid);
      };
      checkValidity();
    }
  }, [isActive, validate, wizard]);

  if (!isActive) return null;

  return <div className={cn('wizard-step', className)}>{children}</div>;
}

interface WizardStepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function WizardStepContainer({
  children,
  className,
}: WizardStepContainerProps) {
  const wizard = useWizard();
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={cn('wizard-steps-container', className)}>
      {childrenArray[wizard.currentStep]}
    </div>
  );
}

interface WizardFormStepProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  stepIndex?: number;
}

export function WizardFormStep({
  children,
  className,
  title,
  description,
  stepIndex,
}: WizardFormStepProps) {
  return (
    <WizardStep className={className} stepIndex={stepIndex}>
      <div className="space-y-6">
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
            )}
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
        )}
        <div className="wizard-form-content">{children}</div>
      </div>
    </WizardStep>
  );
}

interface WizardReviewStepProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  stepIndex?: number;
}

export function WizardReviewStep({
  children,
  className,
  title = 'Review Your Information',
  stepIndex,
}: WizardReviewStepProps) {
  const wizard = useWizard();

  return (
    <WizardStep className={className} stepIndex={stepIndex}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm">
            Please review your information before submitting
          </p>
        </div>

        <div className="wizard-review-content">{children}</div>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-muted-foreground text-sm">
            By clicking complete, you confirm that all information is accurate.
          </p>
        </div>
      </div>
    </WizardStep>
  );
}

interface WizardStepGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function WizardStepGroup({
  children,
  title,
  className,
}: WizardStepGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
          {title}
        </h4>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface ConditionalWizardStepProps {
  children: React.ReactNode;
  condition: boolean | (() => boolean);
  fallback?: React.ReactNode;
  stepIndex?: number;
}

export function ConditionalWizardStep({
  children,
  condition,
  fallback,
  stepIndex,
}: ConditionalWizardStepProps) {
  const shouldRender =
    typeof condition === 'function' ? condition() : condition;

  if (!shouldRender) {
    return fallback ? <>{fallback}</> : null;
  }

  return <WizardStep stepIndex={stepIndex}>{children}</WizardStep>;
}
