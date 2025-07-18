'use client';

import { cn } from '@repo/design-system/lib/utils';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../skeleton-loader';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingState({ 
  type = 'spinner', 
  size = 'md', 
  className,
  text
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (type === 'skeleton') {
    return <Skeleton className={cn('h-4 w-full', className)} />;
  }

  if (type === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          {text && <p className="text-gray-600">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-gray-600', sizeClasses[size])} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
}

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  className 
}: { 
  value?: number; 
  max?: number; 
  className?: string; 
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function Spinner({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin text-gray-600', sizeClasses[size], className)} />
  );
}