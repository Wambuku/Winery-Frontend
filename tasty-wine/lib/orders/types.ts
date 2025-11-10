import type { CartItem } from "../../context/CartContext";

export interface ShippingDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  county: string;
  addressLine1: string;
  addressLine2?: string;
  deliveryNotes?: string;
}

export interface PaymentDetails {
  phoneNumber: string;
  amount: number;
  transactionId: string;
  status: "pending" | "success" | "failed";
  reference?: string;
}

export interface OrderReceipt {
  orderNumber: string;
  timestamp: string;
  customer: ShippingDetails;
  items: CartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  payment: {
    method: "M-Pesa";
    transactionId: string;
    phoneNumber: string;
    status: PaymentDetails["status"];
    reference?: string;
  };
}

export interface CheckoutStep {
  id: string;
  title: string;
  description?: string;
}
