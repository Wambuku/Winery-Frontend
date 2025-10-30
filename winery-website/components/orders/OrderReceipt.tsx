import React, { useState, useEffect } from 'react';
import { Order } from '../../types';

interface OrderReceiptProps {
  orderId: string;
  onClose?: () => void;
  printable?: boolean;
  className?: string;
}

interface ReceiptData extends Order {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  receiptNumber: string;
}

export const OrderReceipt: React.FC<OrderReceiptProps> = ({ 
  orderId, 
  onClose, 
  printable = false, 
  className = '' 
}) => {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceiptData();
  }, [orderId]);

  const fetchReceiptData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${orderId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch receipt data');
      }

      const data = await response.json();
      if (data.success) {
        setReceiptData(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch receipt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${orderId}/receipt/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `receipt-${receiptData?.orderNumber || orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to download receipt');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const calculateSubtotal = () => {
    if (!receiptData) return 0;
    return receiptData.items.reduce((total, item) => total + (item.wine.price * item.quantity), 0);
  };

  const calculateTax = () => {
    // Assuming 16% VAT
    return calculateSubtotal() * 0.16;
  };

  if (loading) {
    return (
      <div className={`${className} ${printable ? 'print:block' : ''}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">Error Loading Receipt</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchReceiptData}
            className="bg-wine-red text-white px-4 py-2 rounded hover:bg-wine-red-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!receiptData) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">Receipt not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-white ${printable ? 'print:shadow-none' : 'shadow-lg'} max-w-2xl mx-auto`}>
      {/* Header with actions (hidden in print) */}
      {!printable && (
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-bold text-wine-black">Order Receipt</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="bg-wine-red text-white px-4 py-2 rounded hover:bg-wine-red-dark transition-colors"
            >
              Download PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Receipt Content */}
      <div className="p-8">
        {/* Company Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wine-black mb-2">
            {receiptData.companyInfo.name}
          </h1>
          <div className="text-gray-600 text-sm">
            <p>{receiptData.companyInfo.address}</p>
            <p>Phone: {receiptData.companyInfo.phone} | Email: {receiptData.companyInfo.email}</p>
            <p>Website: {receiptData.companyInfo.website}</p>
          </div>
        </div>

        {/* Receipt Info */}
        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-wine-black mb-2">RECEIPT</h2>
              <p><strong>Receipt #:</strong> {receiptData.receiptNumber}</p>
              <p><strong>Order #:</strong> {receiptData.orderNumber}</p>
              <p><strong>Date:</strong> {formatDate(receiptData.createdAt)}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-wine-black mb-2">Bill To:</h3>
              <div className="text-sm">
                <p>{receiptData.customerInfo.name}</p>
                <p>{receiptData.customerInfo.email}</p>
                <p>{receiptData.customerInfo.phone}</p>
                <p>{receiptData.customerInfo.address}</p>
                <p>{receiptData.customerInfo.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 font-semibold">Item</th>
                <th className="text-center py-2 font-semibold">Qty</th>
                <th className="text-right py-2 font-semibold">Unit Price</th>
                <th className="text-right py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {receiptData.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{item.wine.name}</p>
                      <p className="text-sm text-gray-600">{item.wine.vintage} • {item.wine.region}</p>
                    </div>
                  </td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">{formatCurrency(item.wine.price)}</td>
                  <td className="text-right py-3 font-medium">
                    {formatCurrency(item.wine.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>VAT (16%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(receiptData.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p><strong>Payment Method:</strong> {receiptData.paymentMethod.toUpperCase()}</p>
              <p><strong>Payment Status:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  receiptData.paymentStatus === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : receiptData.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {receiptData.paymentStatus.charAt(0).toUpperCase() + receiptData.paymentStatus.slice(1)}
                </span>
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Thank you for your business!</p>
              <p>Questions? Contact us at {receiptData.companyInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>This is a computer-generated receipt. No signature required.</p>
          <p>Please retain this receipt for your records.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;