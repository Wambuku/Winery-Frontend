"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect } from "react";
import { useCart } from "../../context/CartContext";

export default function CartDrawer() {
  const { items, totals, isOpen, closeCart, clearCart, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [isOpen]);

  const handleIncrease = useCallback(
    (id: string, quantity: number, variant?: string) => {
      updateQuantity(id, quantity + 1, variant);
    },
    [updateQuantity]
  );

  const handleDecrease = useCallback(
    (id: string, quantity: number, variant?: string) => {
      updateQuantity(id, Math.max(quantity - 1, 0), variant);
    },
    [updateQuantity]
  );

  const handleCheckout = useCallback(() => {
    if (items.length === 0) return;
    closeCart();
    router.push("/checkout");
  }, [closeCart, router, items.length]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-full transform flex-col bg-gradient-to-b from-black via-[#180303] to-red-950 text-white shadow-2xl shadow-red-900/40 transition-transform duration-300 sm:max-w-md ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4rem] text-yellow-400">Your Cart</p>
            <h2 className="text-xl font-semibold text-white">Cellar Selection</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:border-white/30 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 active:scale-95"
            aria-label="Close cart"
          >
            <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6 18 18M6 18 18 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white/70">
              <svg aria-hidden className="h-12 w-12 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.254 5.25a1 1 0 0 0-.97-.757H3.25a1 1 0 1 0 0 2h1.336l2.1 8.399a1 1 0 0 0 .97.757h9.296a1 1 0 0 0 .97-.757l1.45-5.793a1 1 0 0 0-.97-1.243H7.787l-.486-1.953A1 1 0 0 0 6.254 5.25Z" />
                <path d="M10 20.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Zm8 0a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0Z" />
              </svg>
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-sm text-white/60">Explore the cellar and add bottles to curate your collection.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.id}-${item.variant ?? "default"}`}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow shadow-red-900/10"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-black/50">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.4rem] text-white/50">
                        {item.name.slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs uppercase tracking-wide text-yellow-300">{item.variant}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.variant)}
                        className="rounded-full border border-white/10 p-1 text-white/60 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 active:scale-95"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M6 6 18 18M6 18 18 6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-yellow-300">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item.id, item.quantity, item.variant)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-white/30 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 active:scale-95"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          –
                        </button>
                        <span className="min-w-[2ch] text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item.id, item.quantity, item.variant)}
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-400/60 bg-yellow-300/80 text-black transition hover:bg-yellow-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 active:scale-95"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="space-y-4 border-t border-white/10 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/80">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-yellow-300">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={clearCart}
              className="flex-1 rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 active:scale-[0.98]"
            >
              Clear cart
            </button>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="flex-1 rounded-full bg-red-700 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_16px_28px_-18px_rgba(185,28,28,0.9)] transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
