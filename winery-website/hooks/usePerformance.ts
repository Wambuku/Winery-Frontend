// React hook for performance monitoring and Core Web Vitals tracking

import { useEffect, useState, useCallback } from 'react';
import { 
  PerformanceMonitor, 
  PerformanceMetric, 
  WebVitalsMetrics,
  reportPerformanceMetrics,
  getMemoryUsage,
  getNetworkInfo
} from '../utils/performance';

export interface PerformanceState {
  metrics: WebVitalsMetrics;
  isLoading: boolean;
  memoryUsage: ReturnType<typeof getMemoryUsage>;
  networkInfo: ReturnType<typeof getNetworkInfo>;
}

export const usePerformance = (enableReporting = false) => {
  const [state, setState] = useState<PerformanceState>({
    metrics: {},
    isLoading: true,
    memoryUsage: null,
    networkInfo: null,
  });

  const [monitor, setMonitor] = useState<PerformanceMonitor | null>(null);

  const handleMetric = useCallback((metric: PerformanceMetric) => {
    setState(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [metric.name]: metric,
      },
    }));

    if (enableReporting) {
      console.log(`Performance metric: ${metric.name} = ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  }, [enableReporting]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const performanceMonitor = new PerformanceMonitor(handleMetric);
    setMonitor(performanceMonitor);

    // Update system info
    setState(prev => ({
      ...prev,
      isLoading: false,
      memoryUsage: getMemoryUsage(),
      networkInfo: getNetworkInfo(),
    }));

    // Periodic updates for memory usage
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        memoryUsage: getMemoryUsage(),
      }));
    }, 5000);

    return () => {
      performanceMonitor.disconnect();
      clearInterval(interval);
    };
  }, [handleMetric]);

  const reportMetrics = useCallback(() => {
    if (monitor) {
      const metrics = monitor.getMetrics();
      reportPerformanceMetrics(metrics);
      return metrics;
    }
    return {};
  }, [monitor]);

  const getPerformanceScore = useCallback((): number => {
    const metrics = state.metrics;
    let score = 100;
    let metricCount = 0;

    Object.values(metrics).forEach(metric => {
      if (metric) {
        metricCount++;
        switch (metric.rating) {
          case 'good':
            score += 0; // No penalty
            break;
          case 'needs-improvement':
            score -= 10;
            break;
          case 'poor':
            score -= 25;
            break;
        }
      }
    });

    return metricCount > 0 ? Math.max(0, score) : 0;
  }, [state.metrics]);

  return {
    ...state,
    reportMetrics,
    getPerformanceScore,
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [renderCount, setRenderCount] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      setRenderTime(duration);
      setRenderCount(prev => prev + 1);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render took ${duration.toFixed(2)}ms`);
      }
    };
  });

  return { renderTime, renderCount };
};

// Hook for lazy loading with intersection observer
export const useLazyLoading = (threshold = 0.1, rootMargin = '50px') => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!ref || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return { isVisible, ref: setRef };
};

// Hook for preloading resources
export const usePreload = () => {
  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => resolve();
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStylesheet = useCallback((href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => resolve();
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStylesheet,
  };
};