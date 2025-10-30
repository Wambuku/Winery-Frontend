// Performance monitoring component for Core Web Vitals tracking

import React, { useEffect } from 'react';
import { usePerformance } from '../../hooks/usePerformance';

interface PerformanceMonitorProps {
  enableReporting?: boolean;
  enableConsoleLogging?: boolean;
  onMetric?: (metric: any) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enableReporting = false,
  enableConsoleLogging = process.env.NODE_ENV === 'development',
  onMetric
}) => {
  const { metrics, memoryUsage, networkInfo, reportMetrics, getPerformanceScore } = usePerformance(enableConsoleLogging);

  useEffect(() => {
    // Report metrics when they change
    Object.values(metrics).forEach(metric => {
      if (metric && onMetric) {
        onMetric(metric);
      }
    });
  }, [metrics, onMetric]);

  useEffect(() => {
    // Report performance metrics periodically in development
    if (enableReporting && process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const currentMetrics = reportMetrics();
        const score = getPerformanceScore();
        
        console.group('🚀 Performance Report');
        console.log('Performance Score:', score);
        console.log('Memory Usage:', memoryUsage);
        console.log('Network Info:', networkInfo);
        console.groupEnd();
      }, 30000); // Report every 30 seconds

      return () => clearInterval(interval);
    }
  }, [enableReporting, reportMetrics, getPerformanceScore, memoryUsage, networkInfo]);

  // This component doesn't render anything visible
  return null;
};

export default PerformanceMonitor;