"use client";

import type { OrderReceipt } from "./types";

const LAST_ORDER_KEY = "checkout.lastOrder";

export function saveOrderReceipt(receipt: OrderReceipt) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(receipt));
  } catch (error) {
    console.warn("Failed to persist order receipt", error);
  }
}

export function loadOrderReceipt(): OrderReceipt | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LAST_ORDER_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as OrderReceipt;
  } catch (error) {
    console.warn("Failed to load order receipt", error);
    return null;
  }
}

export function clearOrderReceipt() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LAST_ORDER_KEY);
  } catch (error) {
    console.warn("Failed to clear order receipt", error);
  }
}
