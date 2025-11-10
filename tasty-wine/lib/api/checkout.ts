import { apiRequest } from "./client";
import type { ShippingDetails } from "../orders/types";

export interface CheckoutItemPayload {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  variant?: string;
  imageUrl?: string;
}

export interface CheckoutTotalsPayload {
  subtotal: number;
  shipping: number;
  total: number;
}

export interface CheckoutPaymentPayload {
  method: string;
  transactionId: string;
  phoneNumber: string;
  status: string;
  reference?: string;
}

export interface CheckoutPayload {
  orderNumber: string;
  shipping: ShippingDetails;
  items: CheckoutItemPayload[];
  totals: CheckoutTotalsPayload;
  payment: CheckoutPaymentPayload;
  notes?: string;
}

export interface CheckoutResponse {
  id?: string | number;
  order_number?: string;
  orderNumber?: string;
  status?: string;
  message?: string;
}

export async function submitCheckout(payload: CheckoutPayload, token?: string): Promise<CheckoutResponse> {
  const body = {
    order_number: payload.orderNumber,
    orderNumber: payload.orderNumber,
    customer: payload.shipping,
    shipping: payload.shipping,
    payment_method: payload.payment.method,
    paymentMethod: payload.payment.method,
    payment_details: {
      transaction_id: payload.payment.transactionId,
      phone_number: payload.payment.phoneNumber,
      status: payload.payment.status,
      reference: payload.payment.reference,
    },
    paymentDetails: {
      transactionId: payload.payment.transactionId,
      phoneNumber: payload.payment.phoneNumber,
      status: payload.payment.status,
      reference: payload.payment.reference,
    },
    totals: payload.totals,
    items: payload.items.map((item) => ({
      wine: item.id,
      wine_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      variant: item.variant,
      image_url: item.imageUrl,
    })),
    notes: payload.notes,
  };

  return apiRequest<CheckoutResponse>("/api/checkout/", {
    method: "POST",
    body,
    token,
  });
}
