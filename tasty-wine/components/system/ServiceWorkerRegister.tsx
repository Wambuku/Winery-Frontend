'use client';

import { useEffect } from 'react';

const SW_PATH = '/sw.js';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    let isMounted = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(SW_PATH, {
          scope: '/',
        });

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[tasty-wine] New content available; reload to update.');
            }
          });
        });
      } catch (error) {
        if (isMounted) {
          console.warn('[tasty-wine] Service worker registration failed:', error);
        }
      }
    };

    register();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
