'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMonitorProps {
  debug?: boolean;
}

export function PerformanceMonitor({ debug = false }: PerformanceMonitorProps) {
  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      if (debug) {
      }

      // Send to analytics in production
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_label: metric.id,
          non_interaction: true,
        });
      }

      // Also send to Sentry for monitoring
      if (typeof window !== 'undefined' && 'Sentry' in window) {
        (window as any).Sentry?.addBreadcrumb({
          message: `Web Vitals: ${metric.name}`,
          level: 'info',
          data: {
            value: metric.value,
            id: metric.id,
            rating: metric.rating,
          },
        });
      }
    };

    // Register all Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onINP(handleMetric); // Interaction to Next Paint (replaces FID)
    onLCP(handleMetric);
    onTTFB(handleMetric);
  }, [debug]);

  // Component doesn't render anything visible
  return null;
}

// Hook for manual performance measurements
export function usePerformance() {
  const measureTime = (name: string, fn: () => void | Promise<void>) => {
    const start = performance.now();
    
    const finish = () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
      }
    };

    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(finish);
    } else {
      finish();
      return result;
    }
  };

  const markAndMeasure = (name: string, startMark?: string) => {
    const markName = `${name}-start`;
    const measureName = name;
    
    if (startMark) {
      performance.measure(measureName, startMark, markName);
    } else {
      performance.mark(markName);
      return () => {
        const endMark = `${name}-end`;
        performance.mark(endMark);
        performance.measure(measureName, markName, endMark);
      };
    }
  };

  return { measureTime, markAndMeasure };
}

// Component to track page load performance
export function PageLoadPerformance({ pageName }: { pageName: string }) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
      }
      
      // Track in analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'page_load_time', {
          event_category: 'Performance',
          value: Math.round(loadTime),
          custom_parameter: pageName,
        });
      }
    };
  }, [pageName]);

  return null;
}