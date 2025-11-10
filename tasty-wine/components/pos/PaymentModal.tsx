'use client';

import React, { useState } from 'react';
import type { POSItem, CreateTransactionInput } from '../../lib/types/pos';

interface PaymentModalProps {
  items: POSItem[];
  total: number;
  onComplete: (data: CreateTransactionInput) => void;
  onCancel: () => void;
}

export default function PaymentModal({ items, total, onComplete, onCancel }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'card'>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaRef, setMpesaRef] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      let paymentDetails: Record<string, unknown>;

      if (paymentMethod === 'cash') {
        const received = parseFloat(cashReceived);
        if (received < total) {
          alert('Insufficient cash received');
          setProcessing(false);
          return;
        }
        paymentDetails = {
          amountReceived: received,
          change: received - total,
        };
      } else if (paymentMethod === 'mpesa') {
        if (!mpesaPhone || !mpesaRef) {
          alert('Please provide M-Pesa phone number and reference');
          setProcessing(false);
          return;
        }
        paymentDetails = {
          phoneNumber: mpesaPhone,
          transactionId: `MPESA-${Date.now()}`,
          reference: mpesaRef,
        };
      } else {
        if (!cardLast4) {
          alert('Please provide card last 4 digits');
          setProcessing(false);
          return;
        }
        paymentDetails = {
          last4Digits: cardLast4,
          cardType,
          transactionId: `CARD-${Date.now()}`,
        };
      }

      onComplete({
        items,
        paymentMethod,
        paymentDetails,
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      setProcessing(false);
    }
  };

  const change = paymentMethod === 'cash' ? parseFloat(cashReceived || '0') - total : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-2xl sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Process Payment</h2>
          <button
            onClick={onCancel}
            className="rounded-full border border-white/10 p-1 text-slate-400 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 rounded-lg bg-slate-900/50 p-4">
          <div className="text-sm text-slate-400">Total Amount</div>
          <div className="text-2xl font-bold text-white sm:text-3xl">KES {total.toLocaleString()}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Payment Method</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {(['cash', 'mpesa', 'card'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                    paymentMethod === method
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {method === 'mpesa' ? 'M-Pesa' : method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Payment */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Cash Received</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="0.00"
                />
              </div>
              {cashReceived && (
                <div className="rounded-lg bg-green-500/10 p-4 text-center">
                  <div className="text-sm text-slate-400">Change Due</div>
                  <div className="text-2xl font-bold text-green-400">
                    KES {change >= 0 ? change.toLocaleString() : '0'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* M-Pesa Payment */}
          {paymentMethod === 'mpesa' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="254712345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">M-Pesa Reference</label>
                <input
                  type="text"
                  required
                  value={mpesaRef}
                  onChange={(e) => setMpesaRef(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="ABC123XYZ"
                />
              </div>
            </div>
          )}

          {/* Card Payment */}
          {paymentMethod === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Card Type</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option>Visa</option>
                  <option>Mastercard</option>
                  <option>American Express</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Last 4 Digits</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={cardLast4}
                  onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="1234"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-400 transition-colors hover:bg-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Complete Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
