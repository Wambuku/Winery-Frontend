"use client";

import React, { FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../context/CartContext";
import type { CheckoutStep, OrderReceipt, ShippingDetails } from "../../lib/orders/types";
import { saveOrderReceipt } from "../../lib/orders/storage";
import { submitCheckout } from "../../lib/api/checkout";
import CheckoutStepper from "./CheckoutStepper";

interface MultiStepCheckoutProps {
  shippingFee?: number;
}

interface ShippingErrors {
  [key: string]: string | undefined;
}

interface PaymentState {
  status: "idle" | "processing" | "success" | "failed";
  message?: string;
  transactionId?: string;
  reference?: string;
  attempt: number;
}

const steps: CheckoutStep[] = [
  {
    id: "shipping",
    title: "Shipping details",
    description: "Where should we deliver your cellar selection?",
  },
  {
    id: "payment",
    title: "M-Pesa payment",
    description: "Securely complete payment via M-Pesa STK push.",
  },
  {
    id: "review",
    title: "Review & confirm",
    description: "Confirm your order details before completion.",
  },
];

function validateShipping(details: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!details.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }
  if (!details.email.trim() || !/\S+@\S+\.\S+/.test(details.email)) {
    errors.email = "Provide a valid email address.";
  }
  if (!details.phoneNumber.trim() || details.phoneNumber.trim().length < 10) {
    errors.phoneNumber = "Provide a valid phone number.";
  }
  if (!details.county.trim()) {
    errors.county = "County is required.";
  }
  if (!details.addressLine1.trim()) {
    errors.addressLine1 = "Primary address is required.";
  }
  return errors;
}

export default function MultiStepCheckout({ shippingFee = 0 }: MultiStepCheckoutProps) {
  const router = useRouter();
  const { items, totals, clearCart, closeCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingDetails>({
    fullName: "",
    email: "",
    phoneNumber: "",
    county: "",
    addressLine1: "",
    addressLine2: "",
    deliveryNotes: "",
  });
  const [shippingErrors, setShippingErrors] = useState<ShippingErrors>({});
  const [paymentPhone, setPaymentPhone] = useState("");
  const [orderNumber] = useState(() => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return `TW-${(crypto as Crypto).randomUUID().split("-")[0].toUpperCase()}`;
    }
    return `TW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  });
  const orderNumberRef = useRef(orderNumber);
  const [payment, setPayment] = useState<PaymentState>({
    status: "idle",
    attempt: 1,
  });
  const [confirmationError, setConfirmationError] = useState<string | null>(null);

  const grandTotal = useMemo(() => totals.subtotal + shippingFee, [totals.subtotal, shippingFee]);

  const handleShippingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateShipping(shipping);
    setShippingErrors(validation);
    if (Object.values(validation).some(Boolean)) {
      return;
    }
    setActiveStep(1);
  };

  const triggerPayment = async () => {
    setPayment({ status: "processing", attempt: payment.attempt, message: undefined });
    try {
      const response = await fetch("/api/payments/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: paymentPhone || shipping.phoneNumber,
          amount: grandTotal,
          orderNumber: orderNumberRef.current,
          attempt: payment.attempt,
        }),
      });

      const data = (await response.json()) as {
        status: string;
        message?: string;
        transactionId?: string;
        reference?: string;
        retryable?: boolean;
      };

      if (!response.ok || data.status !== "success") {
        setPayment({
          status: "failed",
          attempt: payment.attempt + 1,
          message: data.message ?? "Payment failed. Please try again.",
        });
        return;
      }

      setPayment({
        status: "success",
        attempt: payment.attempt,
        message: "Payment successful! Review your order before confirming.",
        transactionId: data.transactionId,
        reference: data.reference,
      });
      setActiveStep(2);
    } catch (error) {
      console.error("Payment error", error);
      setPayment({
        status: "failed",
        attempt: payment.attempt + 1,
        message: "Network error during payment. Please retry.",
      });
    }
  };

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paymentPhone.trim() && !shipping.phoneNumber.trim()) {
      setPayment({
        status: "failed",
        attempt: payment.attempt,
        message: "Enter a valid phone number to continue.",
      });
      return;
    }
    await triggerPayment();
  };

  const handleConfirmOrder = async () => {
    setConfirmationError(null);
    if (items.length === 0) {
      setConfirmationError("Your cart is empty. Add wines before completing checkout.");
      return;
    }
    if (payment.status !== "success" || !payment.transactionId) {
      setConfirmationError("Complete payment before confirming the order.");
      return;
    }

    const receipt: OrderReceipt = {
      orderNumber: orderNumberRef.current,
      timestamp: new Date().toISOString(),
      customer: shipping,
      items,
      totals: {
        subtotal: totals.subtotal,
        shipping: shippingFee,
        total: grandTotal,
      },
      payment: {
        method: "M-Pesa",
        transactionId: payment.transactionId,
        phoneNumber: paymentPhone || shipping.phoneNumber,
        status: "success",
        reference: payment.reference,
      },
    };

    try {
      const response = await submitCheckout(
        {
          orderNumber: orderNumberRef.current,
          shipping,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
            variant: item.variant,
            imageUrl: item.imageUrl,
          })),
          totals: {
            subtotal: totals.subtotal,
            shipping: shippingFee,
            total: grandTotal,
          },
          payment: {
            method: "mpesa",
            transactionId: payment.transactionId,
            phoneNumber: paymentPhone || shipping.phoneNumber,
            status: "success",
            reference: payment.reference,
          },
        },
        undefined
      );

      if (response?.order_number || response?.orderNumber) {
        orderNumberRef.current = (response.order_number ?? response.orderNumber) as string;
        receipt.orderNumber = orderNumberRef.current;
      }
    } catch (apiError) {
      console.error("Checkout API error", apiError);
      setConfirmationError(
        apiError instanceof Error
          ? apiError.message
          : "Failed to submit checkout. Please try again."
      );
      return;
    }

    try {
      saveOrderReceipt(receipt);
      clearCart();
      closeCart();
      router.push(`/order/confirmation?order=${receipt.orderNumber}`);
    } catch (error) {
      console.error("Failed to finalize order", error);
      setConfirmationError("Could not finalize the order. Please try again.");
    }
  };

  return (
    <section className="space-y-8">
      <CheckoutStepper steps={steps} activeStep={activeStep} />

      <div className="space-y-10 rounded-3xl border border-white/10 bg-black/70 p-6 shadow-xl shadow-red-900/20">
        {activeStep === 0 && (
          <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleShippingSubmit} noValidate>
            <div className="sm:col-span-2">
              <h2 className="text-lg font-semibold text-yellow-300">Recipient details</h2>
              <p className="text-sm text-white/70">
                Provide delivery information so our courier can reach you on time.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-semibold text-white">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                value={shipping.fullName}
                onChange={(event) => setShipping((prev) => ({ ...prev, fullName: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                required
              />
              {shippingErrors.fullName && <p className="text-xs text-red-300">{shippingErrors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={shipping.email}
                onChange={(event) => setShipping((prev) => ({ ...prev, email: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                required
              />
              {shippingErrors.email && <p className="text-xs text-red-300">{shippingErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-sm font-semibold text-white">
                Phone number
              </label>
              <input
                id="phoneNumber"
                value={shipping.phoneNumber}
                onChange={(event) => setShipping((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                required
              />
              {shippingErrors.phoneNumber && <p className="text-xs text-red-300">{shippingErrors.phoneNumber}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="county" className="text-sm font-semibold text-white">
                County
              </label>
              <input
                id="county"
                value={shipping.county}
                onChange={(event) => setShipping((prev) => ({ ...prev, county: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                required
              />
              {shippingErrors.county && <p className="text-xs text-red-300">{shippingErrors.county}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="addressLine1" className="text-sm font-semibold text-white">
                Address
              </label>
              <input
                id="addressLine1"
                value={shipping.addressLine1}
                onChange={(event) => setShipping((prev) => ({ ...prev, addressLine1: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                required
              />
              {shippingErrors.addressLine1 && <p className="text-xs text-red-300">{shippingErrors.addressLine1}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="addressLine2" className="text-sm font-semibold text-white">
                Apartment, suite, etc. (optional)
              </label>
              <input
                id="addressLine2"
                value={shipping.addressLine2 ?? ""}
                onChange={(event) => setShipping((prev) => ({ ...prev, addressLine2: event.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="deliveryNotes" className="text-sm font-semibold text-white">
                Delivery notes (optional)
              </label>
              <textarea
                id="deliveryNotes"
                value={shipping.deliveryNotes ?? ""}
                onChange={(event) => setShipping((prev) => ({ ...prev, deliveryNotes: event.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-yellow-300 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)] transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Continue to payment
              </button>
            </div>
          </form>
        )}

        {activeStep === 1 && (
          <form className="space-y-6" onSubmit={handlePaymentSubmit}>
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Complete payment with M-Pesa</h2>
              <p className="text-sm text-white/70">
                We will trigger an STK push to the phone number provided. Confirm the prompt on your device to proceed.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="paymentPhone" className="text-sm font-semibold text-white">
                M-Pesa phone number
              </label>
              <input
                id="paymentPhone"
                value={paymentPhone}
                onChange={(event) => setPaymentPhone(event.target.value)}
                placeholder={shipping.phoneNumber || "07XX XXX XXX"}
                className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white shadow-inner focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
              />
              <p className="text-xs text-white/60">
                Ensure the number is registered for M-Pesa. Amount payable: ${grandTotal.toFixed(2)}
              </p>
            </div>

            {payment.message && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  payment.status === "success"
                    ? "border-green-400/60 bg-green-900/40 text-green-100"
                    : "border-red-400/60 bg-red-900/40 text-red-100"
                }`}
              >
                {payment.message}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={payment.status === "processing"}
                className="rounded-full bg-red-700 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white shadow-[0_16px_28px_-18px_rgba(185,28,28,0.9)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              >
                {payment.status === "processing" ? "Processing…" : "Trigger M-Pesa"}
              </button>
            </div>

            {payment.status === "failed" && (
              <button
                type="button"
                onClick={triggerPayment}
                className="w-full rounded-full border border-yellow-300/60 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Retry payment (attempt {payment.attempt})
              </button>
            )}
          </form>
        )}

        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-yellow-300">Review and confirm</h2>
              <p className="text-sm text-white/70">
                Verify your delivery details and payment information before placing the order.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white">Delivery to</h3>
                <p className="text-sm text-white/80">
                  {shipping.fullName}
                  <br />
                  {shipping.addressLine1}
                  {shipping.addressLine2 ? (
                    <>
                      <br />
                      {shipping.addressLine2}
                    </>
                  ) : null}
                  <br />
                  {shipping.county}
                </p>
                <p className="text-xs text-white/60">
                  {shipping.email} • {shipping.phoneNumber}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white">Payment</h3>
                <p className="text-sm text-white/80">
                  M-Pesa • {paymentPhone || shipping.phoneNumber}
                  <br />
                  Transaction ID:{" "}
                  <span className="font-mono text-yellow-300">{payment.transactionId ?? "N/A"}</span>
                </p>
                {payment.reference && (
                  <p className="text-xs text-white/60">Reference: {payment.reference}</p>
                )}
              </div>
            </div>

            {confirmationError && (
              <div className="rounded-2xl border border-red-400/60 bg-red-900/40 px-4 py-3 text-sm text-red-100">
                {confirmationError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="rounded-full bg-yellow-300 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)] transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
              >
                Confirm order
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
