'use client';

import { useEffect } from 'react';

type WebVitalsMetric = {
  name: string;
  value: number;
  id: string;
  rating?: string;
};

export default function PerformanceMonitor() {
  useEffect(() => {
    let unsubscribed = false;

    async function setupWebVitals() {
      let vitalsModule: typeof import('web-vitals');
      try {
        vitalsModule = await import('web-vitals');
      } catch {
        vitalsModule = await import('next/dist/compiled/web-vitals');
      }

      const { onCLS, onFID, onLCP, onINP, onTTFB, onFCP } = vitalsModule;

      const handleMetric = (metric: WebVitalsMetric) => {
        if (unsubscribed) return;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tasty-wine:web-vital', {
              detail: {
                id: metric.id,
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                timestamp: Date.now(),
              },
            })
          );
        }
        if (process.env.NODE_ENV === 'development') {
          console.info('[web-vitals]', metric.name, metric.value.toFixed(2), metric.rating ?? '');
        }
      };

      onCLS(handleMetric);
      onFID(handleMetric);
      onLCP(handleMetric);
      onINP(handleMetric);
      onTTFB(handleMetric);
      onFCP(handleMetric);
    }

    setupWebVitals().catch((error) => {
      console.warn('[tasty-wine] Failed to load web-vitals', error);
    });

    const errorHandler = (event: ErrorEvent) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tasty-wine:error', {
            detail: {
              message: event.message,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
            },
          })
        );
      }
    };

    window.addEventListener('error', errorHandler);

    return () => {
      unsubscribed = true;
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  return null;
}
