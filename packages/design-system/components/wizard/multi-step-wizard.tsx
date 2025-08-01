'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

let motion: any;
let AnimatePresence: any;

try {
  const framerMotion = require('framer-motion');
  motion = framerMotion.motion;
  AnimatePresence = framerMotion.AnimatePresence;
} catch {
  motion = null;
  AnimatePresence = null;
}

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  validate?: () => boolean | Promise<boolean>;
  onBeforeNext?: () => void | Promise<void>;
  onBeforePrevious?: () => void | Promise<void>;
}

export interface MultiStepWizardProps {
  steps: WizardStep[];
  children: React.ReactNode;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void | Promise<void>;
  className?: string;
  showProgress?: boolean;
  showStepIndicator?: boolean;
  progressType?: 'bar' | 'stepper' | 'both';
  allowStepSkipping?: boolean;
  persistState?: boolean;
  navigationPosition?: 'bottom' | 'top' | 'both';
  animateTransitions?: boolean;
  customNavigation?: React.ReactNode;
  labels?: {
    next?: string;
    previous?: string;
    complete?: string;
    skip?: string;
  };
}

interface WizardContextValue {
  currentStep: number;
  totalSteps: number;
  steps: WizardStep[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  goToStep: (step: number) => void;
  nextStep: () => Promise<void>;
  previousStep: () => Promise<void>;
  setCanGoNext: (value: boolean) => void;
  formData: Record<string, any>;
  updateFormData: (data: Record<string, any>) => void;
}

const WizardContext = React.createContext<WizardContextValue | undefined>(
  undefined
);

export function useWizard() {
  const context = React.useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a MultiStepWizard');
  }
  return context;
}

export function MultiStepWizard({
  steps,
  children,
  currentStep: controlledStep,
  onStepChange,
  onComplete,
  className,
  showProgress = true,
  showStepIndicator = true,
  progressType = 'both',
  allowStepSkipping = false,
  persistState = true,
  navigationPosition = 'bottom',
  animateTransitions = true,
  customNavigation,
  labels = {},
}: MultiStepWizardProps) {
  const [internalStep, setInternalStep] = React.useState(0);
  const [canGoNext, setCanGoNext] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [visitedSteps, setVisitedSteps] = React.useState<Set<number>>(
    new Set([0])
  );

  const currentStep = controlledStep ?? internalStep;
  const isControlled = controlledStep !== undefined;

  React.useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      const savedData = localStorage.getItem('wizard-form-data');
      if (savedData) {
        setFormData(JSON.parse(savedData));
      }
    }
  }, [persistState]);

  React.useEffect(() => {
    if (persistState && typeof window !== 'undefined') {
      localStorage.setItem('wizard-form-data', JSON.stringify(formData));
    }
  }, [formData, persistState]);

  const updateFormData = React.useCallback((data: Record<string, any>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  const setStep = React.useCallback(
    (step: number) => {
      if (isControlled) {
        onStepChange?.(step);
      } else {
        setInternalStep(step);
      }
      setVisitedSteps((prev) => new Set([...prev, step]));
    },
    [isControlled, onStepChange]
  );

  const goToStep = React.useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) return;
      if (!(allowStepSkipping || visitedSteps.has(step)) && step > currentStep)
        return;
      setStep(step);
    },
    [allowStepSkipping, currentStep, setStep, steps.length, visitedSteps]
  );

  const nextStep = React.useCallback(async () => {
    if (currentStep >= steps.length - 1) {
      await onComplete?.();
      return;
    }

    setIsLoading(true);
    try {
      const currentStepConfig = steps[currentStep];

      if (!currentStepConfig) {
        setIsLoading(false);
        return;
      }

      if (currentStepConfig.validate) {
        const isValid = await currentStepConfig.validate();
        if (!isValid) {
          setIsLoading(false);
          return;
        }
      }

      await currentStepConfig.onBeforeNext?.();
      setStep(currentStep + 1);
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, onComplete, setStep, steps]);

  const previousStep = React.useCallback(async () => {
    if (currentStep <= 0) return;

    setIsLoading(true);
    try {
      const currentStepConfig = steps[currentStep];
      if (currentStepConfig) {
        await currentStepConfig.onBeforePrevious?.();
      }
      setStep(currentStep - 1);
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, setStep, steps]);

  const contextValue: WizardContextValue = {
    currentStep,
    totalSteps: steps.length,
    steps,
    canGoNext,
    canGoPrevious: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    isLoading,
    goToStep,
    nextStep,
    previousStep,
    setCanGoNext,
    formData,
    updateFormData,
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;

  const renderNavigation = () => {
    if (customNavigation) return customNavigation;

    return (
      <WizardNavigation
        canGoNext={canGoNext && !isLoading}
        canGoPrevious={currentStep > 0 && !isLoading}
        currentStep={steps[currentStep]}
        isLastStep={currentStep === steps.length - 1}
        isLoading={isLoading}
        labels={labels}
        onNext={nextStep}
        onPrevious={previousStep}
      />
    );
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn('space-y-6', className)}>
        {(showProgress || showStepIndicator) &&
          navigationPosition !== 'bottom' && (
            <div className="space-y-4">
              {showStepIndicator &&
                (progressType === 'stepper' || progressType === 'both') && (
                  <WizardStepIndicator
                    currentStep={currentStep}
                    onStepClick={allowStepSkipping ? goToStep : undefined}
                    steps={steps}
                    visitedSteps={visitedSteps}
                  />
                )}
              {showProgress &&
                (progressType === 'bar' || progressType === 'both') && (
                  <WizardProgress value={progressValue} />
                )}
            </div>
          )}

        {navigationPosition === 'top' && renderNavigation()}

        <div className="wizard-content">
          {animateTransitions && motion && AnimatePresence ? (
            <AnimatePresence mode="wait">
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
                key={currentStep}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          ) : (
            children
          )}
        </div>

        {navigationPosition === 'bottom' && renderNavigation()}

        {(showProgress || showStepIndicator) &&
          navigationPosition === 'bottom' && (
            <div className="space-y-4">
              {showProgress &&
                (progressType === 'bar' || progressType === 'both') && (
                  <WizardProgress value={progressValue} />
                )}
              {showStepIndicator &&
                (progressType === 'stepper' || progressType === 'both') && (
                  <WizardStepIndicator
                    currentStep={currentStep}
                    onStepClick={allowStepSkipping ? goToStep : undefined}
                    steps={steps}
                    visitedSteps={visitedSteps}
                  />
                )}
            </div>
          )}
      </div>
    </WizardContext.Provider>
  );
}

interface WizardProgressProps {
  value: number;
  className?: string;
}

export function WizardProgress({ value, className }: WizardProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <Progress className="h-2" value={value} />
      <p className="mt-2 text-muted-foreground text-sm">
        {Math.round(value)}% Complete
      </p>
    </div>
  );
}

interface WizardNavigationProps {
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  labels?: {
    next?: string;
    previous?: string;
    complete?: string;
    skip?: string;
  };
  currentStep?: WizardStep;
  className?: string;
}

export function WizardNavigation({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLastStep,
  isLoading,
  labels = {},
  currentStep,
  className,
}: WizardNavigationProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <Button
        className="gap-2"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        type="button"
        variant="outline"
      >
        <ChevronLeft className="h-4 w-4" />
        {labels.previous || 'Previous'}
      </Button>

      <div className="flex gap-2">
        {currentStep?.optional && !isLastStep && (
          <Button
            disabled={isLoading}
            onClick={onNext}
            type="button"
            variant="ghost"
          >
            {labels.skip || 'Skip'}
          </Button>
        )}

        <Button
          className="gap-2"
          disabled={!canGoNext}
          onClick={onNext}
          type="button"
        >
          {isLoading ? (
            'Loading...'
          ) : isLastStep ? (
            <>
              {labels.complete || 'Complete'}
              <Check className="h-4 w-4" />
            </>
          ) : (
            <>
              {labels.next || 'Next'}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface WizardStepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  visitedSteps: Set<number>;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function WizardStepIndicator({
  steps,
  currentStep,
  visitedSteps,
  onStepClick,
  className,
}: WizardStepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep || visitedSteps.has(index);
        const isClickable =
          onStepClick && (visitedSteps.has(index) || index <= currentStep);

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center">
              <button
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  isActive &&
                    'border-primary bg-primary text-primary-foreground',
                  isCompleted &&
                    !isActive &&
                    'border-primary bg-primary/10 text-primary',
                  !(isActive || isCompleted) &&
                    'border-muted-foreground/30 text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-110',
                  !isClickable && 'cursor-not-allowed'
                )}
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(index)}
                type="button"
              >
                {isCompleted && !isActive ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-medium text-sm">{index + 1}</span>
                )}
              </button>
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    'font-medium text-sm',
                    isActive && 'text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-muted-foreground text-xs">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-4 h-0.5 flex-1',
                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
