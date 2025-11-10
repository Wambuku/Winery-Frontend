"use client";

import React from "react";
import type { CheckoutStep } from "../../lib/orders/types";

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  activeStep: number;
}

export default function CheckoutStepper({ steps, activeStep }: CheckoutStepperProps) {
  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        return (
          <li
            key={step.id}
            className="flex flex-1 items-start gap-3 rounded-2xl border border-red-500/20 bg-black/60 p-4 shadow shadow-red-900/10"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                isActive
                  ? "border-yellow-300 bg-yellow-300 text-black"
                  : isCompleted
                    ? "border-green-400 bg-green-400/20 text-green-200"
                    : "border-white/20 bg-white/10 text-white/60"
              }`}
            >
              {isCompleted ? (
                <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="m6 12 4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">{step.title}</p>
              {step.description && <p className="text-xs text-white/70">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
