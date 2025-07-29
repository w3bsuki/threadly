'use client';

import { Skeleton } from '@repo/ui/components';
import { lazy, Suspense } from 'react';

const MultiStepWizard = lazy(() =>
  import('./multi-step-wizard').then((module) => ({
    default: module.MultiStepWizard,
  }))
);

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MultiStepWizardLazyProps {
  categories: Category[];
  locale: string;
  userId: string;
}

function MultiStepWizardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function MultiStepWizardLazy(props: MultiStepWizardLazyProps) {
  return (
    <Suspense fallback={<MultiStepWizardSkeleton />}>
      <MultiStepWizard {...props} />
    </Suspense>
  );
}
