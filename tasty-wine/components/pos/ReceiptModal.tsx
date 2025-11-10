'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getTransaction } from '../../lib/api/pos';
import type { POSTransaction } from '../../lib/types/pos';

interface ReceiptModalProps {
  transactionId: string;
  onClose: () => void;
}

export default function ReceiptModal({ transactionId, onClose }: ReceiptModalProps) {
  const [transaction, setTransaction] = useState<POSTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${transaction?.transactionNumber}</title>
              <style>
                body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
                .receipt { text-align: center; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-weight: bold; font-size: 1.2em; margin-top: 10px; }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
              <script>window.print(); window.close();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-6">
        <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 text-center shadow-2xl sm:p-8">
          <div className="text-white">Loading receipt...</div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-6">
        <div className="max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-6 text-center shadow-2xl sm:p-8">
          <div className="text-red-400">Failed to load receipt</div>
          <button
            onClick={onClose}
            className="mt-4 rounded-full border border-blue-400/40 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-blue-300 transition hover:border-blue-300 hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Receipt</h2>
          <button
            onClick={onClose}
            className="rounded-full border border-white/10 p-1 text-slate-400 transition hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            ✕
          </button>
        </div>

        <div
          ref={receiptRef}
          className="rounded-lg border border-slate-700 bg-white p-6 text-black"
          style={{ fontFamily: 'monospace' }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold">Winery Store</h3>
            <p className="mt-1 text-sm">Premium Wine Collection</p>
            <p className="text-xs">Nairobi, Kenya</p>
            <p className="text-xs">Tel: +254 700 000 000</p>
          </div>

          <div className="my-4 border-t border-dashed border-gray-400" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Transaction:</span>
              <span className="font-bold">{transaction.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{transaction.staffName}</span>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-gray-400" />

          <div className="space-y-2">
            {transaction.items.map((item, index) => (
              <div key={index}>
                <div className="font-semibold">{item.wineName}</div>
                <div className="flex justify-between text-sm">
                  <span>
                    {item.quantity} x KES {item.unitPrice.toLocaleString()}
                  </span>
                  <span>KES {item.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="my-4 border-t border-dashed border-gray-400" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>KES {transaction.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (16%):</span>
              <span>KES {transaction.tax.toLocaleString()}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-KES {transaction.discount.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="my-4 border-t-2 border-gray-800" />

          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>KES {transaction.total.toLocaleString()}</span>
          </div>

          <div className="my-4 border-t border-dashed border-gray-400" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="uppercase">{transaction.paymentMethod}</span>
            </div>
            {transaction.paymentMethod === 'cash' && 'amountReceived' in transaction.paymentDetails && (
              <>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>KES {(transaction.paymentDetails as { amountReceived: number }).amountReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span>KES {(transaction.paymentDetails as { change: number }).change.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <div className="my-4 border-t border-dashed border-gray-400" />

          <div className="text-center text-xs">
            <p>Thank you for your purchase!</p>
            <p className="mt-2">Visit us at winerystore.co.ke</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
