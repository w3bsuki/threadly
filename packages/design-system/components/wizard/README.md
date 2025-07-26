# Wizard Components

A flexible, reusable multi-step wizard component system for Next.js applications.

## Features

- 🎯 **Flexible Step Configuration** - Dynamic steps with validation and lifecycle hooks
- 📊 **Multiple Progress Indicators** - Progress bar, stepper, or both
- 💾 **Form State Management** - Seamless integration with react-hook-form
- 🎨 **Animation Support** - Optional smooth transitions between steps
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- ⌨️ **Keyboard Navigation** - Full keyboard support with Ctrl+Arrow keys
- 🔄 **Controlled & Uncontrolled** - Works in both modes
- 💪 **TypeScript Support** - Fully typed for excellent DX

## Basic Usage

```tsx
import { MultiStepWizard, WizardStep } from '@repo/design-system/components';

const steps: WizardStep[] = [
  {
    id: 'step-1',
    title: 'Personal Info',
    description: 'Enter your details',
  },
  {
    id: 'step-2',
    title: 'Preferences',
    description: 'Customize your experience',
    optional: true,
  },
];

function MyWizard() {
  return (
    <MultiStepWizard steps={steps} onComplete={() => console.log('Done!')}>
      <div>Step 1 content</div>
      <div>Step 2 content</div>
    </MultiStepWizard>
  );
}
```

## Form Integration

```tsx
import { FormWizard, FormWizardStep } from '@repo/design-system/components';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

function MyFormWizard() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const steps: FormWizardStep[] = [
    {
      id: 'personal',
      title: 'Personal Info',
      fields: ['name', 'email'],
    },
  ];

  return (
    <FormWizard
      form={form}
      steps={steps}
      onSubmit={(data) => console.log(data)}
    >
      {/* Step content */}
    </FormWizard>
  );
}
```

## Components

### MultiStepWizard

Main wizard container that manages step navigation and state.

**Props:**
- `steps` - Array of step configurations
- `onComplete` - Callback when wizard is completed
- `progressType` - 'bar' | 'stepper' | 'both'
- `allowStepSkipping` - Enable jumping between visited steps
- `persistState` - Save form data to localStorage
- `animateTransitions` - Enable smooth transitions
- `navigationPosition` - 'top' | 'bottom' | 'both'

### WizardStep

Individual step wrapper with lifecycle hooks.

**Props:**
- `onEnter` - Called when step becomes active
- `onExit` - Called when leaving step
- `validate` - Validation function
- `stepIndex` - Step index (optional)

### FormWizard

Form-aware wizard that integrates with react-hook-form.

**Props:**
- `form` - React Hook Form instance
- `steps` - Array of form steps with field validation
- `onSubmit` - Form submission handler

### Helper Components

- `WizardProgress` - Progress bar indicator
- `WizardStepIndicator` - Step dots/numbers indicator
- `WizardNavigation` - Next/Previous buttons
- `WizardCard` - Styled container for step content
- `WizardSummary` - Review step summary display
- `WizardFieldGroup` - Responsive field layout
- `WizardSuccess` - Success state component

## Hooks

### useWizard

Access wizard context and controls.

```tsx
const {
  currentStep,
  totalSteps,
  nextStep,
  previousStep,
  goToStep,
  isFirstStep,
  isLastStep,
  formData,
  updateFormData,
} = useWizard();
```

### useFormWizard

Form-specific wizard hook.

```tsx
const {
  currentStep,
  nextStep,
  previousStep,
  validateCurrentStep,
} = useFormWizard({ form, steps });
```

## Examples

### Product Creation Wizard

```tsx
<FormWizard form={form} steps={productSteps}>
  <WizardFormStep title="Basic Info">
    <FormField name="title" render={...} />
    <FormField name="price" render={...} />
  </WizardFormStep>
  
  <WizardFormStep title="Description">
    <FormField name="description" render={...} />
  </WizardFormStep>
  
  <WizardReviewStep>
    <WizardSummary items={summaryItems} />
  </WizardReviewStep>
</FormWizard>
```

### Mobile Optimized

```tsx
<MultiStepWizard
  steps={steps}
  navigationPosition="bottom"
  showStepIndicator={false}
  progressType="bar"
>
  {/* Mobile-friendly content */}
</MultiStepWizard>
```

## Styling

All components use Tailwind CSS and follow the design system patterns. They automatically adapt to light/dark modes and are fully customizable through className props.

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly