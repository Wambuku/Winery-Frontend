export interface POSTransaction {
  id: string;
  transactionNumber: string;
  staffId: string;
  staffName: string;
  items: POSItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'mpesa' | 'card';
  paymentDetails: CashPayment | MpesaPayment | CardPayment;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface POSItem {
  wineId: string;
  wineName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  imageUrl?: string;
}

export interface CashPayment {
  amountReceived: number;
  change: number;
}

export interface MpesaPayment {
  phoneNumber: string;
  transactionId: string;
  reference: string;
}

export interface CardPayment {
  last4Digits: string;
  cardType: string;
  transactionId: string;
}

export interface Receipt {
  transaction: POSTransaction;
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    taxId: string;
  };
  printedAt: string;
}

export interface SalesReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalTransactions: number;
    totalRevenue: number;
    totalItems: number;
    averageTransaction: number;
  };
  topWines: {
    wineId: string;
    wineName: string;
    quantitySold: number;
    revenue: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    total: number;
  }[];
  staffPerformance: {
    staffId: string;
    staffName: string;
    transactions: number;
    revenue: number;
  }[];
  hourlyBreakdown: {
    hour: number;
    transactions: number;
    revenue: number;
  }[];
}

export interface DailySummary {
  date: string;
  totalTransactions: number;
  totalRevenue: number;
  cashSales: number;
  cardSales: number;
  mpesaSales: number;
  topStaff: string;
  topWine: string;
}
