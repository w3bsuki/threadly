'use client';

import * as React from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { MultiStepWizard, MultiStepWizardProps, WizardStep } from './multi-step-wizard';
import { WizardFormStep } from './wizard-step';
import { Form } from '../ui/form';

export interface FormWizardStep<T extends FieldValues> extends Omit<WizardStep, 'validate'> {
  fields?: Path<T>[];
  validate?: (form: UseFormReturn<T>) => boolean | Promise<boolean>;
}

export interface FormWizardProps<T extends FieldValues> extends Omit<MultiStepWizardProps, 'steps' | 'children'> {
  form: UseFormReturn<T>;
  steps: FormWizardStep<T>[];
  children: React.ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
}

export function FormWizard<T extends FieldValues>({
  form,
  steps,
  children,
  onSubmit,
  ...wizardProps
}: FormWizardProps<T>) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const enhancedSteps: WizardStep[] = React.useMemo(
    () =>
      steps.map((step) => ({
        ...step,
        validate: async () => {
          if (step.fields && step.fields.length > 0) {
            const isValid = await form.trigger(step.fields);
            if (!isValid) return false;
          }
          
          if (step.validate) {
            return await step.validate(form);
          }
          
          return true;
        },
      })),
    [form, steps]
  );

  const handleComplete = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await form.handleSubmit(onSubmit)();
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MultiStepWizard
          {...wizardProps}
          steps={enhancedSteps}
          onComplete={handleComplete}
        >
          {children}
        </MultiStepWizard>
      </form>
    </Form>
  );
}

interface UseFormWizardOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  steps: FormWizardStep<T>[];
  onStepChange?: (step: number) => void;
}

export function useFormWizard<T extends FieldValues>({
  form,
  steps,
  onStepChange,
}: UseFormWizardOptions<T>) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const validateCurrentStep = React.useCallback(async () => {
    const step = steps[currentStep];
    if (step.fields) {
      return await form.trigger(step.fields);
    }
    if (step.validate) {
      return await step.validate(form);
    }
    return true;
  }, [currentStep, form, steps]);

  const nextStep = React.useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
    return isValid;
  }, [currentStep, onStepChange, steps.length, validateCurrentStep]);

  const previousStep = React.useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step);
      }
    },
    [onStepChange, steps.length]
  );

  return {
    currentStep,
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
  };
}

export interface FormWizardFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  render: (field: any) => React.ReactNode;
}

export function FormWizardField<T extends FieldValues>({
  form,
  name,
  render,
}: FormWizardFieldProps<T>) {
  return (
    <form.control
      name={name}
      render={({ field }) => render(field)}
    />
  );
}