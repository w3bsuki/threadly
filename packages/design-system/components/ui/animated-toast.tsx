'use client';

import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '@repo/design-system/lib/utils';

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
  success: ({ title, description, duration = 4000, action }: AnimatedToastOptions) => {
    toast.success(title, {
      description,
      duration,
      action,
      className: cn(baseToastClass, 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'),
      icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 animate-bounce-in" />,
    });
  },

  error: ({ title, description, duration = 4000, action }: AnimatedToastOptions) => {
    toast.error(title, {
      description,
      duration,
      action,
      className: cn(baseToastClass, 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'),
      icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 animate-shake" />,
    });
  },

  info: ({ title, description, duration = 4000, action }: AnimatedToastOptions) => {
    toast.info(title, {
      description,
      duration,
      action,
      className: cn(baseToastClass, 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'),
      icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-pulse" />,
    });
  },

  warning: ({ title, description, duration = 4000, action }: AnimatedToastOptions) => {
    toast.warning(title, {
      description,
      duration,
      action,
      className: cn(baseToastClass, 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950'),
      icon: <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-bounce" />,
    });
  },

  loading: (title: string, promise: Promise<any>, messages: { loading: string; success: string; error: string }) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      className: baseToastClass,
    });
  },

  custom: (content: React.ReactNode, options?: { duration?: number; position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' }) => {
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
        onClick={() =>
          animatedToast.success({
            title: 'Success!',
            description: 'Your action was completed successfully.',
          })
        }
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Show Success
      </button>
      <button
        onClick={() =>
          animatedToast.error({
            title: 'Error occurred',
            description: 'Something went wrong. Please try again.',
            action: {
              label: 'Retry',
            },
          })
        }
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Show Error
      </button>
    </div>
  );
}