// Checkout and payment related type definitions

export interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface PaymentDetails {
  method: 'mpesa' | 'cash';
  mpesaPhone?: string;
}

export interface CheckoutData {
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  orderNotes?: string;
}

export interface MPesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  description: string;
}

export interface MPesaPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  responseCode?: string;
  responseDescription?: string;
  customerMessage?: string;
  error?: string;
}

export interface PaymentConfirmation {
  orderId: string;
  transactionId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'cash';
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
}

export interface OrderReceipt {
  orderId: string;
  orderNumber: string;
  customerInfo: ShippingAddress;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
}