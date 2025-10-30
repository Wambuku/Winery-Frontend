// Performance monitoring and Core Web Vitals tracking

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsMetrics {
  CLS?: PerformanceMetric;
  FID?: PerformanceMetric;
  FCP?: PerformanceMetric;
  LCP?: PerformanceMetric;
  TTFB?: PerformanceMetric;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

export const getRating = (
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

export const createMetric = (
  name: string,
  value: number
): PerformanceMetric => ({
  name,
  value,
  rating: getRating(name as keyof typeof THRESHOLDS, value),
  timestamp: Date.now(),
});

// Performance observer for Core Web Vitals
export class PerformanceMonitor {
  private metrics: WebVitalsMetrics = {};
  private observers: PerformanceObserver[] = [];
  private onMetric?: (metric: PerformanceMetric) => void;

  constructor(onMetric?: (metric: PerformanceMetric) => void) {
    this.onMetric = onMetric;
    this.initializeObservers();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      const metric = createMetric('LCP', lastEntry.startTime);
      this.metrics.LCP = metric;
      this.onMetric?.(metric);
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      const firstEntry = entries[0] as any;
      const metric = createMetric('FID', firstEntry.processingStart - firstEntry.startTime);
      this.metrics.FID = metric;
      this.onMetric?.(metric);
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      const metric = createMetric('CLS', clsValue);
      this.metrics.CLS = metric;
      this.onMetric?.(metric);
    });

    // First Contentful Paint (FCP)
    this.observeMetric('paint', (entries) => {
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        const metric = createMetric('FCP', fcpEntry.startTime);
        this.metrics.FCP = metric;
        this.onMetric?.(metric);
      }
    });

    // Time to First Byte (TTFB)
    this.observeNavigation();
  }

  private observeMetric(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  private observeNavigation(): void {
    if ('navigation' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        const metric = createMetric('TTFB', ttfb);
        this.metrics.TTFB = metric;
        this.onMetric?.(metric);
      }
    }
  }

  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Resource loading performance
export const measureResourceLoading = (resourceUrl: string): Promise<number> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const resourceEntry = entries.find(entry => entry.name.includes(resourceUrl));
      
      if (resourceEntry) {
        const loadTime = (resourceEntry as any).responseEnd - resourceEntry.startTime;
        observer.disconnect();
        resolve(loadTime);
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
    
    // Fallback timeout
    setTimeout(() => {
      observer.disconnect();
      resolve(performance.now() - startTime);
    }, 10000);
  });
};

// Bundle size analysis
export const analyzeBundleSize = (): Promise<{
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{ name: string; size: number }>;
}> => {
  return new Promise((resolve) => {
    // This would integrate with webpack-bundle-analyzer in a real implementation
    // For now, return mock data
    resolve({
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
    });
  });
};

// Memory usage monitoring
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
};

// Network information
export const getNetworkInfo = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
} | null => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    };
  }
  return null;
};

// Performance reporting
export const reportPerformanceMetrics = (metrics: WebVitalsMetrics): void => {
  // In a real application, this would send metrics to an analytics service
  console.group('Performance Metrics');
  Object.entries(metrics).forEach(([name, metric]) => {
    if (metric) {
      console.log(`${name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  });
  console.groupEnd();
};

// Lazy loading utilities
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
};

// Code splitting utilities
export const loadComponent = async <T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> => {
  try {
    const module = await importFn();
    return module.default;
  } catch (error) {
    console.error('Failed to load component:', error);
    throw error;
  }
};

// Performance timing utilities
export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T => {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = fn(...args);
    const endTime = performance.now();
    
    console.log(`${name || fn.name} took ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  }) as T;
};

export const measureAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): T => {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    const result = await fn(...args);
    const endTime = performance.now();
    
    console.log(`${name || fn.name} took ${(endTime - startTime).toFixed(2)}ms`);
    
    return result;
  }) as T;
};