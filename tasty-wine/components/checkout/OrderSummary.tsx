"use client";

import Image from "next/image";
import React from "react";
import { useCart } from "../../context/CartContext";

interface OrderSummaryProps {
  shippingCost?: number;
}

export default function OrderSummary({ shippingCost = 0 }: OrderSummaryProps) {
  const { items, totals } = useCart();
  const grandTotal = totals.subtotal + shippingCost;

  return (
    <aside className="space-y-4 rounded-3xl border border-red-500/40 bg-black/70 p-6 shadow-xl shadow-red-900/20">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-yellow-300">Order summary</h2>
        <span className="text-sm uppercase tracking-wide text-white/60">{totals.itemCount} items</span>
      </header>

      <ul className="space-y-4">
        {items.map((item) => (
          <li key={`${item.id}-${item.variant ?? "default"}`} className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.4rem] text-white/50">
                  {item.name.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex flex-1 items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{item.name}</p>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  Qty {item.quantity}
                  {item.variant ? ` • ${item.variant}` : ""}
                </p>
              </div>
              <span className="text-sm font-semibold text-yellow-300">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Your cart is empty. Add cellar selections before checking out.
          </li>
        )}
      </ul>

      <dl className="space-y-2 border-t border-white/10 pt-4 text-sm text-white/70">
        <div className="flex items-center justify-between">
          <dt>Subtotal</dt>
          <dd>${totals.subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>Shipping</dt>
          <dd>{shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : "Complimentary"}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
          <dt>Total</dt>
          <dd>${grandTotal.toFixed(2)}</dd>
        </div>
      </dl>
    </aside>
  );
}
