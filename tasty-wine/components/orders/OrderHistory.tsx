"use client";

import React, { useMemo, useState } from "react";
import type { ManagedOrder, OrderStatus } from "../../lib/orders/mockOrders";

interface OrderHistoryProps {
  orders: ManagedOrder[];
}

const statusLabels: Record<OrderStatus, string> = {
  processing: "Processing",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-yellow-300">Order history</h2>
          <p className="text-sm text-white/70">
            Track your previous purchases, check delivery status, and download receipts.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by order # or wine"
            className="w-full rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40 sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "all")}
            className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
          >
            <option value="all">All statuses</option>
            <option value="processing">Processing</option>
            <option value="in_transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </header>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-white/70">
            No orders match your filters. Adjust the search criteria and try again.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <article
              key={order.orderNumber}
              className="space-y-4 rounded-3xl border border-white/10 bg-black/70 p-6 shadow shadow-red-900/20"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">Order number</p>
                  <p className="text-lg font-semibold text-yellow-300">{order.orderNumber}</p>
                  <p className="text-xs text-white/60">Placed {formatDate(order.timestamp)}</p>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                    order.status === "delivered"
                      ? "border border-green-400/60 bg-green-400/20 text-green-200"
                      : order.status === "processing"
                        ? "border border-yellow-300/60 bg-yellow-300/10 text-yellow-200"
                        : order.status === "in_transit"
                          ? "border border-blue-400/60 bg-blue-400/20 text-blue-100"
                          : "border border-red-400/60 bg-red-400/20 text-red-100"
                  }`}
                >
                  {statusLabels[order.status]}
                </span>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white">Items</h3>
                  <ul className="space-y-1 text-sm text-white/70">
                    {order.items.map((item) => (
                      <li key={`${item.id}-${item.variant ?? "default"}`} className="flex justify-between gap-3">
                        <span>
                          {item.name} {item.variant ? `• ${item.variant}` : ""} × {item.quantity}
                        </span>
                        <span>${(item.quantity * item.price).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white">Delivery</h3>
                  <p className="text-sm text-white/80">
                    {order.customer.fullName}
                    <br />
                    {order.customer.addressLine1}
                    <br />
                    {order.customer.county}
                  </p>
                  <p className="text-xs text-white/60">{order.customer.phoneNumber}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white">Tracking</h3>
                <ol className="space-y-2">
                  {order.timeline.map((entry) => (
                    <li key={`${entry.status}-${entry.timestamp}`} className="text-sm text-white/70">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-white">
                          {statusLabels[entry.status]}
                        </span>
                        <span className="text-xs text-white/50">{formatDate(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs text-white/60">{entry.description}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <footer className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                >
                  Print receipt
                </button>
                <button
                  type="button"
                  className="rounded-full bg-yellow-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black shadow-[0_16px_28px_-18px_rgba(250,204,21,0.8)] transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                >
                  Download PDF
                </button>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
