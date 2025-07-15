'use client';

import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
};

interface WebVitalsData {
  metric: Metric;
  pathname: string;
  userAgent: string;
  timestamp: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

async function sendToAnalytics(data: WebVitalsData) {
  try {
    // Send to your analytics endpoint
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('Failed to send web vitals data:', error);
  }
}

function reportMetric(metric: Metric) {
  const data: WebVitalsData = {
    metric,
    pathname: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    rating: getMetricRating(metric.name, metric.value)
  };

  // Send to analytics
  sendToAnalytics(data);

  // Console log for development
  if (process.env.NODE_ENV === 'development') {
    const color = data.rating === 'good' ? 'green' : data.rating === 'needs-improvement' ? 'orange' : 'red';
    console.log(
      `%c${metric.name}: ${metric.value.toFixed(2)}ms (${data.rating})`,
      `color: ${color}; font-weight: bold;`
    );
  }
}

export function initWebVitals() {
  try {
    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  } catch (error) {
    console.warn('Web Vitals initialization failed:', error);
  }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    // Observe long tasks (potential for poor user experience)
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          
          // Send to analytics if duration is concerning
          if (entry.duration > 100) {
            fetch('/api/analytics/web-vitals', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                metric: {
                  name: 'LongTask',
                  value: entry.duration,
                  id: Math.random().toString(36).substr(2, 9),
                  delta: 0
                },
                pathname: window.location.pathname,
                userAgent: navigator.userAgent,
                timestamp: Date.now(),
                rating: entry.duration > 300 ? 'poor' : 'needs-improvement'
              })
            }).catch(() => {});
          }
        }
      }
    });

    longTaskObserver.observe({ entryTypes: ['longtask'] });

    // Observe navigation timing
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navigation = entry as PerformanceNavigationTiming;
        
        // Calculate custom metrics
        const timeToInteractive = navigation.domInteractive - navigation.fetchStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Navigation Timing:', {
            timeToInteractive: `${timeToInteractive.toFixed(2)}ms`,
            domContentLoaded: `${domContentLoaded.toFixed(2)}ms`,
            loadComplete: `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`
          });
        }
      }
    });

    navigationObserver.observe({ entryTypes: ['navigation'] });

  } catch (error) {
    console.warn('Performance Observer initialization failed:', error);
  }
}

// Resource loading performance
export function trackResourcePerformance() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Get all resource timings
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Find slow resources
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('Slow resources detected:', slowResources.map(r => ({
        name: r.name,
        duration: `${r.duration.toFixed(2)}ms`,
        size: r.transferSize || 'unknown'
      })));
    }

    // Calculate total page weight
    const totalSize = resources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);

    if (process.env.NODE_ENV === 'development') {
      console.log(`Total page weight: ${(totalSize / 1024).toFixed(2)} KB`);
    }
  });
}

// Export a combined initialization function
export function initPerformanceMonitoring() {
  initWebVitals();
  initPerformanceObserver();
  trackResourcePerformance();
}