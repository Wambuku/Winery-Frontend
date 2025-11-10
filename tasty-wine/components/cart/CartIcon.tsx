"use client";

import React from "react";
import { useCart } from "../../context/CartContext";

interface CartIconProps {
  className?: string;
  variant?: "default" | "compact";
}

export default function CartIcon({ className, variant = "default" }: CartIconProps) {
  const { totals, toggleCart, isOpen } = useCart();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleCart}
        aria-expanded={isOpen}
        aria-label="Toggle shopping cart"
        className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-yellow-400/60 bg-black/70 text-yellow-300 shadow shadow-black/40 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${className ?? ""}`}
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.254 5.25a1 1 0 0 0-.97-.757H3.25a1 1 0 1 0 0 2h1.336l2.1 8.399a1 1 0 0 0 .97.757h9.296a1 1 0 0 0 .97-.757l1.45-5.793a1 1 0 0 0-.97-1.243H7.787l-.486-1.953A1 1 0 0 0 6.254 5.25Z" />
          <path d="M10 20.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm8 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z" />
        </svg>
        <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold text-white shadow shadow-red-900/50">
          {totals.itemCount}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleCart}
      className={`group relative inline-flex items-center gap-2 rounded-full border border-yellow-400/60 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-300 shadow shadow-black/40 transition hover:border-yellow-300 hover:text-black hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${className ?? ""}`}
      aria-expanded={isOpen}
      aria-label="Toggle shopping cart"
    >
      <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-yellow-400/70 bg-black/80 text-yellow-300 transition group-hover:border-black group-hover:bg-black/80 group-hover:text-yellow-300">
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6.254 5.25a1 1 0 0 0-.97-.757H3.25a1 1 0 1 0 0 2h1.336l2.1 8.399a1 1 0 0 0 .97.757h9.296a1 1 0 0 0 .97-.757l1.45-5.793a1 1 0 0 0-.97-1.243H7.787l-.486-1.953A1 1 0 0 0 6.254 5.25Z" />
          <path d="M10 20.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm8 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z" />
        </svg>
        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold text-white shadow shadow-red-900/50">
          {totals.itemCount}
        </span>
      </span>
      <span className="hidden sm:inline">
        Cart · ${totals.subtotal.toFixed(2)}
      </span>
    </button>
  );
}
