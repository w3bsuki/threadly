import { cn } from '@repo/ui/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div className="flex items-center" key={step}>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] transition-colors',
              step < currentStep
                ? 'bg-primary text-primary-foreground'
                : step === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {step < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="font-medium text-sm">{step}</span>
            )}
          </div>

          {step < totalSteps && (
            <div
              className={cn(
                'mx-2 h-1 w-16 transition-colors',
                step < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
