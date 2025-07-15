'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface PerformanceMonitorProps {
  debug?: boolean;
}

export function PerformanceMonitor({ debug = false }: PerformanceMonitorProps) {
  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      // Get rating based on thresholds
      const getMetricRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
        const thresholds = {
          LCP: { good: 2500, poor: 4000 },
          FCP: { good: 1800, poor: 3000 },
          CLS: { good: 0.1, poor: 0.25 },
          INP: { good: 200, poor: 500 },
          TTFB: { good: 800, poor: 1800 }
        };
        
        const threshold = thresholds[name as keyof typeof thresholds];
        if (!threshold) return 'good';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
      };

      const rating = getMetricRating(metric.name, metric.value);

      if (debug) {
        const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red';
        console.log(
          `%c${metric.name}: ${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'} (${rating})`,
          `color: ${color}; font-weight: bold;`
        );
      }

      // Send to our custom analytics endpoint
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: {
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta
          },
          pathname: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          rating
        })
      }).catch(() => {}); // Silent fail for analytics

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
            rating: rating,
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