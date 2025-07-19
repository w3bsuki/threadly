'use client';

import React, { useState, useEffect, useCallback } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        setLastOnlineTime(new Date());
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineTime
  };
}

interface OfflineQueueItem {
  id: string;
  type: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: OfflineQueueItem[] = [];
  private storage = typeof window !== 'undefined' ? window.localStorage : null;
  private isProcessing = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (!this.storage) return;
    
    try {
      const stored = this.storage.getItem('offline-queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private saveToStorage() {
    if (!this.storage) return;
    
    try {
      this.storage.setItem('offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  add(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
      retryCount: 0
    };

    this.queue.push(queueItem);
    this.saveToStorage();
    
    return queueItem.id;
  }

  remove(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveToStorage();
  }

  getAll() {
    return [...this.queue];
  }

  clear() {
    this.queue = [];
    this.saveToStorage();
  }

  async processQueue() {
    if (this.isProcessing || !navigator.onLine) return;

    this.isProcessing = true;
    const failedItems: OfflineQueueItem[] = [];

    for (const item of this.queue) {
      try {
        const response = await fetch(item.url, {
          method: item.type,
          headers: {
            'Content-Type': 'application/json',
            ...item.headers
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log(`Successfully processed queued request: ${item.type} ${item.url}`);
      } catch (error) {
        console.error(`Failed to process queued request:`, error);
        
        if (item.retryCount < 3) {
          failedItems.push({
            ...item,
            retryCount: item.retryCount + 1
          });
        }
      }
    }

    this.queue = failedItems;
    this.saveToStorage();
    this.isProcessing = false;
  }
}

const offlineQueue = new OfflineQueue();

export function useOfflineQueue() {
  const [queueSize, setQueueSize] = useState(0);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    const updateQueueSize = () => {
      setQueueSize(offlineQueue.getAll().length);
    };

    updateQueueSize();
    
    const interval = setInterval(updateQueueSize, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline) {
      offlineQueue.processQueue();
    }
  }, [isOnline]);

  const addToQueue = useCallback((request: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    return offlineQueue.add(request);
  }, []);

  const clearQueue = useCallback(() => {
    offlineQueue.clear();
    setQueueSize(0);
  }, []);

  return {
    queueSize,
    addToQueue,
    clearQueue,
    processQueue: () => offlineQueue.processQueue()
  };
}

export function offlineCapableFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!navigator.onLine && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE' || options.method === 'PATCH')) {
    offlineQueue.add({
      type: options.method as 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      url,
      data: options.body ? JSON.parse(options.body as string) : undefined,
      headers: options.headers as Record<string, string>
    });

    return Promise.resolve(new Response('{}', {
      status: 200,
      statusText: 'Queued for offline processing'
    }));
  }

  return fetch(url, options);
}

export function OfflineIndicator(): React.ReactElement | null {
  const { isOffline } = useOnlineStatus();
  const { queueSize } = useOfflineQueue();

  if (!isOffline && queueSize === 0) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-[var(--radius-lg)] p-3 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-2 w-2 bg-yellow-400 rounded-[var(--radius-full)]" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              {isOffline ? 'You are offline' : 'Back online'}
              {queueSize > 0 && (
                <span className="ml-1">
                  ({queueSize} pending request{queueSize !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}