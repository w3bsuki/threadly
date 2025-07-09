import { cn } from '@repo/design-system/lib/utils';
import { Icons } from '@repo/design-system/components/icons';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
              step < currentStep
                ? 'bg-primary text-primary-foreground'
                : step === currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {step < currentStep ? (
              <Icons.check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step}</span>
            )}
          </div>
          
          {step < totalSteps && (
            <div
              className={cn(
                'w-16 h-1 mx-2 transition-colors',
                step < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}