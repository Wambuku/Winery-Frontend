"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { OrderReceipt } from "../../../lib/orders/types";
import { clearOrderReceipt, loadOrderReceipt } from "../../../lib/orders/storage";

export default function OrderConfirmationPage() {
  const params = useSearchParams();
  const orderNumberParam = params.get("order");
  const [receipt] = useState<OrderReceipt | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = loadOrderReceipt();
    if (stored && (!orderNumberParam || stored.orderNumber === orderNumberParam)) {
      return stored;
    }
    return null;
  });

  useEffect(() => {
    return () => {
      clearOrderReceipt();
    };
  }, []);

  const formattedDate = useMemo(() => {
    if (!receipt) return "";
    return new Date(receipt.timestamp).toLocaleString();
  }, [receipt]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#200202] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-300">Order confirmed</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            {receipt ? "Thank you for your purchase" : "Order not found"}
          </h1>
          <p className="max-w-2xl text-sm text-white/70">
            {receipt
              ? "We’ve received your payment and will begin preparing your cellar delivery."
              : "We couldn’t locate a recent order receipt. Please review your purchases or contact support."}
          </p>
        </header>

        {receipt ? (
          <div className="space-y-6 rounded-3xl border border-yellow-400/30 bg-black/70 p-8 shadow-xl shadow-red-900/20">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">Order number</p>
                <p className="text-lg font-semibold text-yellow-300">{receipt.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">Placed on</p>
                <p className="text-lg font-semibold text-white">{formattedDate}</p>
              </div>
            </div>

            <section className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">Delivery</h2>
                <p className="text-sm text-white/80">
                  {receipt.customer.fullName}
                  <br />
                  {receipt.customer.addressLine1}
                  {receipt.customer.addressLine2 ? (
                    <>
                      <br />
                      {receipt.customer.addressLine2}
                    </>
                  ) : null}
                  <br />
                  {receipt.customer.county}
                </p>
                <p className="text-xs text-white/60">
                  {receipt.customer.email} • {receipt.customer.phoneNumber}
                </p>
                {receipt.customer.deliveryNotes && (
                  <p className="text-xs italic text-white/60">Notes: {receipt.customer.deliveryNotes}</p>
                )}
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="text-sm font-semibold text-white">Payment</h2>
                <p className="text-sm text-white/80">M-Pesa</p>
                <p className="text-xs text-white/60">
                  Transaction ID:{" "}
                  <span className="font-mono text-yellow-300">{receipt.payment.transactionId}</span>
                </p>
                <p className="text-xs text-white/60">{receipt.payment.phoneNumber}</p>
                {receipt.payment.reference && (
                  <p className="text-xs text-white/60">Reference: {receipt.payment.reference}</p>
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h2 className="text-sm font-semibold text-white">Items</h2>
              <ul className="space-y-2 text-sm text-white/80">
                {receipt.items.map((item) => (
                  <li key={`${item.id}-${item.variant ?? "default"}`} className="flex justify-between gap-4">
                    <span>
                      {item.name} {item.variant ? `• ${item.variant}` : ""} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t border-white/10 pt-3 text-sm text-white/70">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>${receipt.totals.subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Shipping</dt>
                  <dd>
                    {receipt.totals.shipping > 0
                      ? `$${receipt.totals.shipping.toFixed(2)}`
                      : "Complimentary delivery"}
                  </dd>
                </div>
                <div className="flex justify-between text-base font-semibold text-white">
                  <dt>Total</dt>
                  <dd>${receipt.totals.total.toFixed(2)}</dd>
                </div>
              </dl>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/wines"
                className="rounded-full bg-yellow-300 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)] transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Continue shopping
              </Link>
              <Link
                href="/checkout"
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                View checkout
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border border-red-500/40 bg-black/70 p-8 text-center shadow-xl shadow-red-900/20">
            <p className="text-lg font-semibold text-white">No recent orders were found.</p>
            <p className="text-sm text-white/70">
              If you completed a purchase recently, refresh this page or check your email for a confirmation.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/checkout"
                className="rounded-full bg-red-700 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_16px_28px_-18px_rgba(185,28,28,0.9)] transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              >
                Return to checkout
              </Link>
              <Link
                href="/wines"
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Browse wines
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
