"use client";

import React, { useMemo, useState } from "react";
import type { ManagedOrder, OrderStatus } from "../../lib/orders/mockOrders";

interface OrderManagementDashboardProps {
  orders: ManagedOrder[];
  onUpdateStatus?: (orderNumber: string, status: OrderStatus) => void;
}

const managerStatusOptions: OrderStatus[] = ["processing", "in_transit", "delivered", "cancelled"];

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleString();
}

export default function OrderManagementDashboard({
  orders,
  onUpdateStatus,
}: OrderManagementDashboardProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<ManagedOrder | null>(orders[0] ?? null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.fullName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
      <aside className="space-y-4 rounded-3xl border border-white/10 bg-black/70 p-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-yellow-300">Manage orders</h2>
          <p className="text-sm text-white/70">Staff view for updating statuses and reviewing receipts.</p>
        </header>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by order # or customer"
          className="w-full rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "all")}
          className="w-full rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm text-white focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
        >
          <option value="all">All statuses</option>
          <option value="processing">Processing</option>
          <option value="in_transit">In transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <ul className="space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-2 max-h-[26rem]">
          {filteredOrders.length === 0 ? (
            <li className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/60">
              No orders match your filters.
            </li>
          ) : (
            filteredOrders.map((order) => {
              const isActive = selectedOrder?.orderNumber === order.orderNumber;
              return (
                <li key={order.orderNumber}>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      isActive
                        ? "border-yellow-300 bg-yellow-300/10 text-yellow-200"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-white/60">{order.customer.fullName}</p>
                    <p className="text-xs text-white/40">{formatDate(order.timestamp)}</p>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </aside>

      <div className="space-y-4 rounded-3xl border border-white/10 bg-black/70 p-6">
        {selectedOrder ? (
          <>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Order number</p>
                <p className="text-lg font-semibold text-yellow-300">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-white/60">Placed {formatDate(selectedOrder.timestamp)}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedOrder.status}
                  onChange={(event) => {
                    const newStatus = event.target.value as OrderStatus;
                    onUpdateStatus?.(selectedOrder.orderNumber, newStatus);
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, status: newStatus } : prev
                    );
                  }}
                  className="rounded-full border border-yellow-300/60 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-yellow-300 focus:border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
                >
                  {managerStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
                >
                  Print picking slip
                </button>
              </div>
            </header>

            <section className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white">Customer</h3>
                  <p className="text-sm text-white/80">
                    {selectedOrder.customer.fullName}
                    <br />
                    {selectedOrder.customer.email}
                    <br />
                    {selectedOrder.customer.phoneNumber}
                  </p>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold text-white">Totals</h3>
                  <p className="text-sm text-white/80">
                    Subtotal: ${selectedOrder.totals.subtotal.toFixed(2)}
                    <br />
                    Shipping: ${selectedOrder.totals.shipping.toFixed(2)}
                    <br />
                    <span className="font-semibold text-yellow-300">
                      Total: ${selectedOrder.totals.total.toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white">Items</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  {selectedOrder.items.map((item) => (
                    <li key={`${item.id}-${item.variant ?? "default"}`} className="flex justify-between gap-3">
                      <span>
                        {item.name} {item.variant ? `• ${item.variant}` : ""} × {item.quantity}
                      </span>
                      <span>${(item.quantity * item.price).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-white">Timeline</h3>
                <ol className="space-y-2 text-sm text-white/70">
                  {selectedOrder.timeline.map((entry) => (
                    <li key={`${entry.status}-${entry.timestamp}`}>
                      <div className="flex justify-between gap-3">
                        <span className="font-semibold text-white">
                          {entry.status.replace("_", " ")}
                        </span>
                        <span className="text-xs text-white/50">{formatDate(entry.timestamp)}</span>
                      </div>
                      <p className="text-xs text-white/60">{entry.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-white/60">
            Select an order to view details.
          </div>
        )}
      </div>
    </section>
  );
}
