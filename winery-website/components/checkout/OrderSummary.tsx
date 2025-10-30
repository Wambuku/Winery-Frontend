// Order summary and confirmation component

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CartItem } from '../../types';
import { CheckoutData } from '../../types/checkout';

interface OrderSummaryProps {
  orderData: Partial<CheckoutData>;
  items: CartItem[];
  total: number;
  onBack?: () => void;
}

export default function OrderSummary({ orderData, items, total, onBack }: OrderSummaryProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    // Generate order number (in real app, this would come from the API)
    const generateOrderNumber = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `WO-${timestamp}-${random}`;
    };

    setOrderNumber(generateOrderNumber());

    // Simulate payment status check for M-Pesa
    if (orderData.paymentDetails?.method === 'mpesa') {
      const checkPaymentStatus = async () => {
        try {
          // In a real app, you would poll the payment status API
          setTimeout(() => {
            setPaymentStatus('success');
          }, 3000);
        } catch (error) {
          setPaymentStatus('failed');
        }
      };

      checkPaymentStatus();
    } else {
      // Cash payments are immediately successful
      setPaymentStatus('success');
    }
  }, [orderData.paymentDetails?.method]);

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/orders');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const subtotal = items.reduce((sum, item) => sum + (item.wine.price * item.quantity), 0);
  const tax = subtotal * 0.16; // 16% VAT
  const shipping = 0; // Free shipping

  return (
    <div className="max-w-2xl mx-auto">
      {/* Order Status Header */}
      <div className="text-center mb-8">
        {paymentStatus === 'pending' && (
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine-red mx-auto"></div>
            <h2 className="text-2xl font-bold text-wine-black mt-4">Processing Payment...</h2>
            <p className="text-gray-600 mt-2">
              {orderData.paymentDetails?.method === 'mpesa' 
                ? 'Please check your phone for the M-Pesa prompt'
                : 'Processing your order...'
              }
            </p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-wine-black mt-4">Order Confirmed!</h2>
            <p className="text-gray-600 mt-2">Thank you for your purchase</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <div className="mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mt-4">Payment Failed</h2>
            <p className="text-gray-600 mt-2">There was an issue processing your payment</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      {paymentStatus === 'success' && (
        <div className="space-y-6">
          {/* Order Number */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-green-700">Order Number</p>
              <p className="text-xl font-bold text-green-800">{orderNumber}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-wine-black mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.wine.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <img
                      src={item.wine.image}
                      alt={item.wine.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-wine-black">{item.wine.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium text-wine-black">
                    KSh {(item.wine.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold text-wine-black mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-wine-black">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (16%):</span>
                <span className="text-wine-black">KSh {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-wine-black">Total:</span>
                  <span className="text-lg font-bold text-wine-red">
                    KSh {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          {orderData.shippingAddress && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-wine-black mb-4">Shipping Address</h3>
              <div className="text-gray-600">
                <p>{orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}</p>
                <p>{orderData.shippingAddress.address}</p>
                <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.postalCode}</p>
                <p>{orderData.shippingAddress.country}</p>
                <p className="mt-2">
                  <span className="font-medium">Email:</span> {orderData.shippingAddress.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {orderData.shippingAddress.phone}
                </p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {orderData.paymentDetails && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-wine-black mb-4">Payment Method</h3>
              <div className="flex items-center">
                {orderData.paymentDetails.method === 'mpesa' ? (
                  <>
                    <div className="w-8 h-6 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <span className="ml-2 text-gray-600">
                      M-Pesa ({orderData.paymentDetails.mpesaPhone})
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-6 bg-gray-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <span className="ml-2 text-gray-600">Cash Payment</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 px-6 py-2 border border-wine-red text-wine-red rounded-md hover:bg-wine-red hover:text-white focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={handleViewOrders}
              className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
            >
              View All Orders
            </button>
            <button
              onClick={handleContinueShopping}
              className="flex-1 px-6 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Failed Payment Actions */}
      {paymentStatus === 'failed' && (
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 px-6 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={handleContinueShopping}
            className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}