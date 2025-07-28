'use client';

import { cn } from '@repo/design-system/lib/utils';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AnimatedToastOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const baseToastClass = 'animate-in slide-in-from-top fade-in duration-300';

export const animatedToast = {
  success: ({
    title,
    description,
    duration = 4000,
    action,
  }: AnimatedToastOptions) => {
    toast.success(title, {
      description,
      duration,
      action,
      className: cn(
        baseToastClass,
        'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
      ),
      icon: (
        <CheckCircle className="h-5 w-5 animate-bounce-in text-green-600 dark:text-green-400" />
      ),
    });
  },

  error: ({
    title,
    description,
    duration = 4000,
    action,
  }: AnimatedToastOptions) => {
    toast.error(title, {
      description,
      duration,
      action,
      className: cn(
        baseToastClass,
        'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      ),
      icon: (
        <XCircle className="h-5 w-5 animate-shake text-red-600 dark:text-red-400" />
      ),
    });
  },

  info: ({
    title,
    description,
    duration = 4000,
    action,
  }: AnimatedToastOptions) => {
    toast.info(title, {
      description,
      duration,
      action,
      className: cn(
        baseToastClass,
        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      ),
      icon: (
        <Info className="h-5 w-5 animate-pulse text-blue-600 dark:text-blue-400" />
      ),
    });
  },

  warning: ({
    title,
    description,
    duration = 4000,
    action,
  }: AnimatedToastOptions) => {
    toast.warning(title, {
      description,
      duration,
      action,
      className: cn(
        baseToastClass,
        'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'
      ),
      icon: (
        <AlertCircle className="h-5 w-5 animate-bounce text-yellow-600 dark:text-yellow-400" />
      ),
    });
  },

  loading: (
    title: string,
    promise: Promise<any>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      className: baseToastClass,
    });
  },

  custom: (
    content: React.ReactNode,
    options?: {
      duration?: number;
      position?:
        | 'top-right'
        | 'top-left'
        | 'bottom-right'
        | 'bottom-left'
        | 'top-center'
        | 'bottom-center';
    }
  ) => {
    toast.custom(content, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      className: baseToastClass,
    });
  },
};

// Example usage component
export function AnimatedToastDemo() {
  return (
    <div className="space-y-2">
      <button
        className="rounded bg-green-500 px-4 py-2 text-background transition-colors hover:bg-green-600"
        onClick={() =>
          animatedToast.success({
            title: 'Success!',
            description: 'Your action was completed successfully.',
          })
        }
      >
        Show Success
      </button>
      <button
        className="rounded bg-red-500 px-4 py-2 text-background transition-colors hover:bg-red-600"
        onClick={() =>
          animatedToast.error({
            title: 'Error occurred',
            description: 'Something went wrong. Please try again.',
            action: {
              label: 'Retry',
            },
          })
        }
      >
        Show Error
      </button>
    </div>
  );
}
