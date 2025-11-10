'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { fetchWines } from '../../lib/api/wines';
import { createTransaction } from '../../lib/api/pos';
import { useAuth } from '../../context/AuthContext';
import type { Wine } from '../../lib/api/wines';
import type { POSItem, CreateTransactionInput } from '../../lib/types/pos';
import PaymentModal from './PaymentModal';
import ReceiptModal from './ReceiptModal';

interface SalesInterfaceProps {
  onSaleComplete?: () => void;
}

export default function SalesInterface({ onSaleComplete }: SalesInterfaceProps) {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [cart, setCart] = useState<POSItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);

  useEffect(() => {
    loadWines();
  }, [search]);

  const loadWines = async () => {
    try {
      setLoading(true);
      const response = await fetchWines({ search, limit: 50 });
      setWines(response.data);
    } catch (error) {
      console.error('Failed to load wines:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (wine: Wine) => {
    const existing = cart.find((item) => item.wineId === wine.id);
    
    if (existing) {
      setCart(
        cart.map((item) =>
          item.wineId === wine.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          wineId: wine.id,
          wineName: wine.name,
          sku: wine.id,
          quantity: 1,
          unitPrice: wine.price,
          discount: 0,
          total: wine.price,
          imageUrl: wine.imageUrl,
        },
      ]);
    }
  };

  const removeFromCart = (wineId: string) => {
    setCart(cart.filter((item) => item.wineId !== wineId));
  };

  const updateQuantity = (wineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(wineId);
      return;
    }

    setCart(
      cart.map((item) =>
        item.wineId === wineId
          ? { ...item, quantity, total: quantity * item.unitPrice }
          : item
      )
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentComplete = async (paymentData: CreateTransactionInput) => {
    try {
      const transaction = await createTransaction(paymentData, {
        token: user?.accessToken || '',
        staff: {
          id: user?.id,
          name: user?.name,
        },
      });
      setCurrentTransaction(transaction.id);
      setShowPayment(false);
      setShowReceipt(true);
      setCart([]);
      onSaleComplete?.();
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Failed to complete transaction. Please try again.');
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      {/* Wine Selection */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search wines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 sm:text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {loading ? (
              <div className="col-span-2 py-12 text-center text-slate-400">Loading wines...</div>
            ) : wines.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-400">No wines found</div>
            ) : (
              wines.map((wine) => (
                <button
                  key={wine.id}
                  onClick={() => addToCart(wine)}
                  className="flex gap-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-left transition-colors hover:border-blue-500 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  {wine.imageUrl && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={wine.imageUrl}
                        alt={wine.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{wine.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {wine.type} • {wine.region}
                    </p>
                    <p className="mt-2 text-lg font-bold text-blue-400">
                      KES {wine.price.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Cart */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6 lg:sticky lg:top-4">
          <h2 className="mb-4 text-lg font-bold text-white sm:text-xl">Current Sale</h2>

          <div className="mb-6 space-y-3">
            {cart.length === 0 ? (
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-8 text-center text-slate-400">
                Cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.wineId}
                  className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3"
                >
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{item.wineName}</h4>
                    <p className="text-xs text-slate-400">KES {item.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.wineId, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded bg-slate-700 text-white transition hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      aria-label={`Decrease ${item.wineName} quantity`}
                    >
                      -
                    </button>
                    <span className="min-w-[2ch] text-center text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.wineId, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded bg-slate-700 text-white transition hover:bg-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      aria-label={`Increase ${item.wineName} quantity`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.wineId)}
                    className="rounded-full border border-red-400/40 p-1 text-red-400 transition hover:border-red-400 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                    aria-label={`Remove ${item.wineName} from cart`}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t border-slate-700 pt-4 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>VAT (16%)</span>
              <span>KES {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Proceed to Payment
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal
          items={cart}
          total={total}
          onComplete={handlePaymentComplete}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {showReceipt && currentTransaction && (
        <ReceiptModal
          transactionId={currentTransaction}
          onClose={() => {
            setShowReceipt(false);
            setCurrentTransaction(null);
          }}
        />
      )}
    </div>
  );
}
