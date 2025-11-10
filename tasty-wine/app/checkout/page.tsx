"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import MultiStepCheckout from "../../components/checkout/MultiStepCheckout";
import OrderSummary from "../../components/checkout/OrderSummary";

const SHIPPING_FEE = 0;

export default function CheckoutPage() {
  const { items } = useCart();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#140202] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <header className="space-y-3 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-300">Checkout</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Complete your cellar acquisition</h1>
          <p className="max-w-2xl text-sm text-white/70">
            We&apos;ll secure your payment via M-Pesa and finalize delivery details in three quick steps.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="space-y-6 rounded-3xl border border-yellow-400/30 bg-black/70 p-8 text-center shadow-xl shadow-red-900/20">
            <p className="text-lg font-semibold text-white">Your cart is currently empty.</p>
            <p className="text-sm text-white/70">
              Select wines from the cellar before proceeding to checkout.
            </p>
            <div className="flex justify-center">
              <Link
                href="/wines"
                className="rounded-full bg-yellow-300 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)] transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Explore wines
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <MultiStepCheckout shippingFee={SHIPPING_FEE} />
            <OrderSummary shippingCost={SHIPPING_FEE} />
          </div>
        )}
      </div>
    </main>
  );
}
