"use client";

import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import ServiceWorkerRegister from "../components/system/ServiceWorkerRegister";
import PerformanceMonitor from "../components/system/PerformanceMonitor";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ServiceWorkerRegister />
        <PerformanceMonitor />
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
