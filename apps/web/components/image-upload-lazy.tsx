'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@repo/design-system/components';

const ImageUpload = lazy(() => import('./image-upload').then(module => ({ default: module.ImageUpload })));

interface ImageData {
  id?: string;
  url: string;
  alt?: string;
  order: number;
}

interface ImageUploadLazyProps {
  value: ImageData[];
  onChange: (images: ImageData[]) => void;
  maxFiles?: number;
  className?: string;
}

function ImageUploadSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="flex space-x-2">
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
        <Skeleton className="h-16 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function ImageUploadLazy(props: ImageUploadLazyProps) {
  return (
    <Suspense fallback={<ImageUploadSkeleton />}>
      <ImageUpload {...props} />
    </Suspense>
  );
}