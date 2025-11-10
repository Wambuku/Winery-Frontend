"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { getTransactions } from "../../lib/api/pos";
import { useAuth } from "../../context/AuthContext";
import OrderHistory from "../../components/orders/OrderHistory";
import OrderManagementDashboard from "../../components/orders/OrderManagementDashboard";
import type { POSTransaction } from "../../lib/types/pos";

// Convert POSTransaction to ManagedOrder format for compatibility
type OrderStatus = "processing" | "in_transit" | "delivered" | "cancelled";
interface ManagedOrder {
  orderNumber: string;
  status: OrderStatus;
  timestamp: string;
  customer: any;
  items: any[];
  totals: any;
  payment: any;
  timeline: any[];
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ManagedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"customer" | "staff">("customer");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getTransactions({}, { token: user?.accessToken });
      // Convert transactions to order format
      const converted = response.data.map((tx: POSTransaction) => ({
        orderNumber: tx.transactionNumber,
        status: tx.status === 'completed' ? 'delivered' as OrderStatus : 'processing' as OrderStatus,
        timestamp: tx.createdAt,
        customer: {
          fullName: tx.staffName,
          email: '',
          phoneNumber: '',
          county: '',
          addressLine1: '',
        },
        items: tx.items,
        totals: {
          subtotal: tx.subtotal,
          shipping: 0,
          total: tx.total,
        },
        payment: {
          method: tx.paymentMethod,
          transactionId: tx.id,
          phoneNumber: '',
          status: tx.status,
          reference: tx.id,
        },
        timeline: [{
          status: tx.status === 'completed' ? 'delivered' as OrderStatus : 'processing' as OrderStatus,
          timestamp: tx.createdAt,
          description: `Order ${tx.status}`,
        }],
      }));
      setOrders(converted);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDelivered = useMemo(
    () => orders.filter((order) => order.status === "delivered").length,
    [orders]
  );

  const totalProcessing = useMemo(
    () => orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length,
    [orders]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-white">Loading orders...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#140202] to-red-950 px-4 py-16 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4rem] text-yellow-300">Orders</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">Manage and track orders</h1>
          <p className="max-w-3xl text-sm text-white/70">
            Switch between customer order history and staff fulfillment tools. Update statuses, print receipts, and keep
            your cellar operations running smoothly.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-yellow-400/30 bg-black/70 p-6 shadow shadow-red-900/20">
            <p className="text-xs uppercase tracking-wide text-white/60">Delivered</p>
            <p className="text-3xl font-semibold text-yellow-300">{totalDelivered}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow shadow-red-900/20">
            <p className="text-xs uppercase tracking-wide text-white/60">In progress</p>
            <p className="text-3xl font-semibold text-white">{totalProcessing}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/70 p-6 shadow shadow-red-900/20">
            <p className="text-xs uppercase tracking-wide text-white/60">Latest order</p>
            <p className="text-base text-white/80">{orders[0]?.orderNumber}</p>
            <Link
              href={`/order/confirmation?order=${orders[0]?.orderNumber}`}
              className="mt-2 inline-flex rounded-full border border-yellow-300/60 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-300 transition hover:border-yellow-300 hover:bg-yellow-300 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
            >
              View receipt
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setView("customer")}
            className={`rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${
              view === "customer"
                ? "bg-yellow-300 text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)]"
                : "border border-white/20 bg-black/60 text-white/80 hover:border-white/40 hover:bg-white/10"
            }`}
          >
            Customer view
          </button>
          <button
            type="button"
            onClick={() => setView("staff")}
            className={`rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300 ${
              view === "staff"
                ? "bg-yellow-300 text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)]"
                : "border border-white/20 bg-black/60 text-white/80 hover:border-white/40 hover:bg-white/10"
            }`}
          >
            Staff view
          </button>
        </div>

        {view === "customer" ? (
          <OrderHistory orders={orders} />
        ) : (
          <OrderManagementDashboard
            orders={orders}
            onUpdateStatus={(orderNumber, status) => {
              setOrders((prev) =>
                prev.map((order) =>
                  order.orderNumber === orderNumber
                    ? {
                        ...order,
                        status,
                        timeline: [
                          ...order.timeline,
                          {
                            status,
                            timestamp: new Date().toISOString(),
                            description: `Status updated to ${status.replace("_", " ")} by staff.`,
                          },
                        ],
                      }
                    : order
                )
              );
            }}
          />
        )}
      </div>
    </main>
  );
}
