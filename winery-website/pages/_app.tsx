import React from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import PerformanceMonitor from '../components/common/PerformanceMonitor';
import ErrorBoundary from '../components/common/ErrorBoundary';
import ToastProvider from '../components/common/ToastContainer';
import OfflineIndicator from '../components/common/OfflineIndicator';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <PerformanceMonitor enableReporting={process.env.NODE_ENV === 'development'} />
            <OfflineIndicator />
            <Component {...pageProps} />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
