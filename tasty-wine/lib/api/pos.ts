import { apiRequest } from "./client";
import type { POSTransaction, SalesReport, DailySummary, POSItem } from "../types/pos";

export interface CreateTransactionInput {
  items: Omit<POSItem, "total">[];
  paymentMethod: "cash" | "mpesa" | "card";
  paymentDetails: Record<string, unknown>;
  discount?: number;
  notes?: string;
}

interface GetTransactionsParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  staffId?: string;
  status?: string;
}

interface CreateTransactionOptions {
  token: string;
  signal?: AbortSignal;
  staff?: {
    id?: string;
    name?: string;
  };
}

interface RequestOptions {
  token?: string;
  signal?: AbortSignal;
}

const TAX_RATE = 0.16;
const transactionCache = new Map<string, POSTransaction>();

function cloneTransaction(transaction: POSTransaction): POSTransaction {
  return JSON.parse(JSON.stringify(transaction)) as POSTransaction;
}

function buildLineItems(data: CreateTransactionInput): POSItem[] {
  return data.items.map((item) => {
    const total = item.quantity * item.unitPrice;
    return {
      ...item,
      total,
    };
  });
}

function computeTotals(items: POSItem[], discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = subtotal + tax - discount;
  return {
    subtotal,
    tax,
    total,
  };
}

function cacheTransaction(transaction: POSTransaction) {
  transactionCache.set(transaction.id, cloneTransaction(transaction));
}

function listCachedTransactions(): POSTransaction[] {
  return Array.from(transactionCache.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function withinRange(dateIso: string, start?: string, end?: string): boolean {
  if (!start && !end) return true;
  const target = new Date(dateIso).getTime();
  if (Number.isNaN(target)) return false;
  if (start) {
    const startTime = new Date(start).getTime();
    if (target < startTime) return false;
  }
  if (end) {
    const endTime = new Date(end).getTime() + 86_399_000; // include entire end day
    if (target > endTime) return false;
  }
  return true;
}

function filterTransactions(params: GetTransactionsParams = {}) {
  const filtered = listCachedTransactions().filter((transaction) => {
    if (params.status && transaction.status !== params.status) {
      return false;
    }
    if (params.staffId && transaction.staffId !== params.staffId) {
      return false;
    }
    if (!withinRange(transaction.createdAt, params.startDate, params.endDate)) {
      return false;
    }
    return true;
  });

  const total = filtered.length;

  if (params.page && params.pageSize && params.pageSize > 0) {
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    return {
      data: filtered.slice(startIndex, endIndex),
      total,
    };
  }

  return { data: filtered, total };
}

function buildTransaction(
  data: CreateTransactionInput,
  options: CreateTransactionOptions
): POSTransaction {
  const lineItems = buildLineItems(data);
  const { subtotal, tax, total } = computeTotals(lineItems, data.discount ?? 0);
  const timestamp = new Date().toISOString();
  const identifier = `TX-${Date.now()}`;

  return {
    id: identifier,
    transactionNumber: identifier,
    staffId: options.staff?.id ?? "unknown",
    staffName: options.staff?.name ?? "Staff",
    items: lineItems,
    subtotal,
    tax,
    discount: data.discount ?? 0,
    total,
    paymentMethod: data.paymentMethod,
    paymentDetails: data.paymentDetails as POSTransaction["paymentDetails"],
    status: "completed",
    notes: data.notes,
    createdAt: timestamp,
    completedAt: timestamp,
  };
}

function aggregateReport(transactions: POSTransaction[]): SalesReport {
  const summary = transactions.reduce(
    (acc, transaction) => {
      acc.totalTransactions += 1;
      acc.totalRevenue += transaction.total;
      acc.totalItems += transaction.items.reduce((sum, item) => sum + item.quantity, 0);
      return acc;
    },
    {
      totalTransactions: 0,
      totalRevenue: 0,
      totalItems: 0,
    }
  );

  const averageTransaction =
    summary.totalTransactions > 0 ? summary.totalRevenue / summary.totalTransactions : 0;

  const topWinesMap = new Map<
    string,
    { wineId: string; wineName: string; quantitySold: number; revenue: number }
  >();
  const paymentMethodsMap = new Map<string, { method: string; count: number; total: number }>();
  const staffPerformanceMap = new Map<
    string,
    { staffId: string; staffName: string; transactions: number; revenue: number }
  >();
  const hourlyBreakdownMap = new Map<number, { hour: number; transactions: number; revenue: number }>();

  transactions.forEach((transaction) => {
    transaction.items.forEach((item) => {
      const entry = topWinesMap.get(item.wineId) ?? {
        wineId: item.wineId,
        wineName: item.wineName,
        quantitySold: 0,
        revenue: 0,
      };
      entry.quantitySold += item.quantity;
      entry.revenue += item.total;
      topWinesMap.set(item.wineId, entry);
    });

    const paymentEntry = paymentMethodsMap.get(transaction.paymentMethod) ?? {
      method: transaction.paymentMethod,
      count: 0,
      total: 0,
    };
    paymentEntry.count += 1;
    paymentEntry.total += transaction.total;
    paymentMethodsMap.set(transaction.paymentMethod, paymentEntry);

    const staffEntry = staffPerformanceMap.get(transaction.staffId) ?? {
      staffId: transaction.staffId,
      staffName: transaction.staffName,
      transactions: 0,
      revenue: 0,
    };
    staffEntry.transactions += 1;
    staffEntry.revenue += transaction.total;
    staffPerformanceMap.set(transaction.staffId, staffEntry);

    const hour = new Date(transaction.createdAt).getHours();
    const hourlyEntry = hourlyBreakdownMap.get(hour) ?? {
      hour,
      transactions: 0,
      revenue: 0,
    };
    hourlyEntry.transactions += 1;
    hourlyEntry.revenue += transaction.total;
    hourlyBreakdownMap.set(hour, hourlyEntry);
  });

  return {
    period: {
      startDate: transactions.at(-1)?.createdAt ?? new Date().toISOString(),
      endDate: transactions.at(0)?.createdAt ?? new Date().toISOString(),
    },
    summary: {
      totalTransactions: summary.totalTransactions,
      totalRevenue: summary.totalRevenue,
      totalItems: summary.totalItems,
      averageTransaction,
    },
    topWines: Array.from(topWinesMap.values()).sort((a, b) => b.quantitySold - a.quantitySold),
    paymentMethods: Array.from(paymentMethodsMap.values()).sort((a, b) => b.total - a.total),
    staffPerformance: Array.from(staffPerformanceMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    ),
    hourlyBreakdown: Array.from(hourlyBreakdownMap.values()).sort((a, b) => a.hour - b.hour),
  };
}

export async function createTransaction(
  data: CreateTransactionInput,
  options: CreateTransactionOptions
): Promise<POSTransaction> {
  if (!options.token) {
    throw new Error("Token required for POS transactions");
  }

  const transaction = buildTransaction(data, options);

  try {
    await apiRequest<unknown>("/api/checkout/", {
      method: "POST",
      token: options.token,
      signal: options.signal,
      body: {
        items: data.items.map((item) => ({
          wine: item.wineId,
          quantity: item.quantity,
        })),
        payment_method: data.paymentMethod,
        payment_details: data.paymentDetails,
        discount: data.discount ?? 0,
        notes: data.notes,
        total: transaction.total,
      },
    });
  } catch (error) {
    console.warn("Checkout request failed or is unavailable, using local transaction cache.", error);
  }

  cacheTransaction(transaction);
  return cloneTransaction(transaction);
}

export async function getTransaction(
  transactionId: string,
  _options: RequestOptions = {}
): Promise<POSTransaction> {
  void _options;
  const cached = transactionCache.get(transactionId);
  if (!cached) {
    throw new Error("Transaction not found");
  }
  return cloneTransaction(cached);
}

export async function getTransactions(
  params: GetTransactionsParams = {},
  _options: RequestOptions = {}
): Promise<{ data: POSTransaction[]; total: number }> {
  void _options;
  const result = filterTransactions(params);
  return {
    data: result.data.map(cloneTransaction),
    total: result.total,
  };
}

export async function cancelTransaction(
  transactionId: string,
  reason: string,
  _options: CreateTransactionOptions
): Promise<POSTransaction> {
  void _options;
  const cached = transactionCache.get(transactionId);
  if (!cached) {
    throw new Error("Transaction not found");
  }
  const updated: POSTransaction = {
    ...cached,
    status: "cancelled",
    notes: reason,
  };
  cacheTransaction(updated);
  return cloneTransaction(updated);
}

export async function refundTransaction(
  transactionId: string,
  items: { wineId: string; quantity: number }[],
  reason: string,
  _options: CreateTransactionOptions
): Promise<POSTransaction> {
  void _options;
  const cached = transactionCache.get(transactionId);
  if (!cached) {
    throw new Error("Transaction not found");
  }

  const refundTotal = items.reduce((sum, item) => {
    const line = cached.items.find((existing) => existing.wineId === item.wineId);
    if (!line) return sum;
    const unitTotal = line.unitPrice * Math.min(item.quantity, line.quantity);
    return sum + unitTotal;
  }, 0);

  const updated: POSTransaction = {
    ...cached,
    status: "refunded",
    notes: reason,
    total: Math.max(cached.total - refundTotal, 0),
  };

  cacheTransaction(updated);
  return cloneTransaction(updated);
}

export async function getSalesReport(
  startDate: string,
  endDate: string,
  _options: { token?: string; signal?: AbortSignal; staffId?: string } = {}
): Promise<SalesReport> {
  void _options;
  const { data } = filterTransactions({ startDate, endDate });
  if (data.length === 0) {
    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalTransactions: 0,
        totalRevenue: 0,
        totalItems: 0,
        averageTransaction: 0,
      },
      topWines: [],
      paymentMethods: [],
      staffPerformance: [],
      hourlyBreakdown: [],
    };
  }

  const report = aggregateReport(data);
  return {
    ...report,
    period: {
      startDate,
      endDate,
    },
  };
}

export async function getDailySummary(
  date: string,
  _options: RequestOptions = {}
): Promise<DailySummary> {
  void _options;
  const { data } = filterTransactions({
    startDate: date,
    endDate: date,
  });

  const totalRevenue = data.reduce((sum, transaction) => sum + transaction.total, 0);
  const cashSales = data
    .filter((transaction) => transaction.paymentMethod === "cash")
    .reduce((sum, transaction) => sum + transaction.total, 0);
  const cardSales = data
    .filter((transaction) => transaction.paymentMethod === "card")
    .reduce((sum, transaction) => sum + transaction.total, 0);
  const mpesaSales = data
    .filter((transaction) => transaction.paymentMethod === "mpesa")
    .reduce((sum, transaction) => sum + transaction.total, 0);

  const topStaff =
    data
      .sort((a, b) => b.total - a.total)
      .map((transaction) => transaction.staffName)
      .find(Boolean) ?? "N/A";

  const topWineEntry = data
    .flatMap((transaction) => transaction.items)
    .sort((a, b) => b.quantity - a.quantity)
    .at(0);

  return {
    date,
    totalTransactions: data.length,
    totalRevenue,
    cashSales,
    cardSales,
    mpesaSales,
    topStaff,
    topWine: topWineEntry?.wineName ?? "N/A",
  };
}
