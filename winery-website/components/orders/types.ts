import { Order } from '../../types';

export interface OrderHistoryProps {
  className?: string;
}

export interface OrderTrackingProps {
  orderId: string;
  className?: string;
}

export interface OrderManagementProps {
  className?: string;
}

export interface OrderReceiptProps {
  orderId: string;
  onClose?: () => void;
  printable?: boolean;
  className?: string;
}

export interface OrderSearchProps {
  className?: string;
  onOrderSelect?: (order: OrderWithDetails) => void;
}

export interface OrderWithDetails extends Order {
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
  };
}

export interface TrackingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: Date;
}

export interface SearchFilters {
  searchTerm: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}