'use client';

import { useEffect } from 'react';

interface ServiceWorkerRegistrationProps {
  swPath?: string;
  onUpdate?: () => void;
  onError?: (error: Error) => void;
}

export function ServiceWorkerRegistration({
  swPath = '/sw.js',
  onUpdate,
  onError,
}: ServiceWorkerRegistrationProps) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  onUpdate?.();
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SYNC_AVAILABLE') {
            }
          });
        })
        .catch((error) => {
          onError?.(error);
        });

      // Handle service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, [swPath, onUpdate, onError]);

  return null; // This component doesn't render anything
}

// Hook for service worker utilities
export function useServiceWorker() {
  const skipWaiting = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const getVersion = (): Promise<string> => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      } else {
        resolve('No service worker');
      }
    });
  };

  const checkOnlineStatus = () => {
    return navigator.onLine;
  };

  return {
    skipWaiting,
    getVersion,
    isOnline: checkOnlineStatus(),
  };
}
