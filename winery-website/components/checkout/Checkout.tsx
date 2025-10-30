// Main checkout component with multi-step flow

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import CheckoutStepper from './CheckoutStepper';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';
import { CheckoutStep, CheckoutData, ShippingAddress, PaymentDetails } from '../../types/checkout';

const CHECKOUT_STEPS: CheckoutStep[] = [
  { id: 'shipping', title: 'Shipping', completed: false, active: true },
  { id: 'payment', title: 'Payment', completed: false, active: false },
  { id: 'confirmation', title: 'Confirmation', completed: false, active: false },
];

export default function Checkout() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(CHECKOUT_STEPS);
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, router]);

  const updateStepStatus = (stepIndex: number, completed: boolean, active: boolean) => {
    setSteps(prevSteps =>
      prevSteps.map((step, index) => ({
        ...step,
        completed: index < stepIndex ? true : index === stepIndex ? completed : false,
        active: index === stepIndex ? active : false,
      }))
    );
  };

  const handleShippingSubmit = async (shippingData: ShippingAddress) => {
    setCheckoutData(prev => ({ ...prev, shippingAddress: shippingData }));
    updateStepStatus(1, false, true);
    setCurrentStep(1);
  };

  const handlePaymentSubmit = async (paymentData: PaymentDetails) => {
    setIsProcessing(true);
    setError(null);

    try {
      const orderData = {
        ...checkoutData,
        paymentDetails: paymentData,
      };

      // Process the order
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          total,
          shippingAddress: orderData.shippingAddress,
          paymentDetails: paymentData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create order');
      }

      const result = await response.json();
      
      if (result.success) {
        // If M-Pesa payment, initiate payment request
        if (paymentData.method === 'mpesa') {
          const paymentResponse = await fetch('/api/payments/mpesa/initiate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: result.data.orderId,
              phoneNumber: paymentData.mpesaPhone,
              amount: total,
            }),
          });

          const paymentResult = await paymentResponse.json();
          
          if (!paymentResult.success) {
            throw new Error(paymentResult.error || 'Payment initiation failed');
          }
        }

        // Update checkout data with order info
        setCheckoutData(prev => ({
          ...prev,
          paymentDetails: paymentData,
          orderId: result.data.orderId,
        }));

        // Move to confirmation step
        updateStepStatus(2, false, true);
        setCurrentStep(2);
        
        // Clear cart after successful order
        clearCart();
      } else {
        throw new Error(result.error || 'Order creation failed');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToShipping = () => {
    updateStepStatus(0, false, true);
    setCurrentStep(0);
  };

  const handleBackToPayment = () => {
    updateStepStatus(1, false, true);
    setCurrentStep(1);
  };

  // Don't render if cart is empty or user not authenticated
  if (items.length === 0 || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wine-black">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your wine purchase</p>
        </div>

        {/* Progress Stepper */}
        <CheckoutStepper steps={steps} currentStep={currentStep} />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 0 && (
            <ShippingForm
              initialData={checkoutData.shippingAddress}
              onSubmit={handleShippingSubmit}
            />
          )}

          {currentStep === 1 && (
            <PaymentForm
              initialData={checkoutData.paymentDetails}
              onSubmit={handlePaymentSubmit}
              onBack={handleBackToShipping}
              total={total}
            />
          )}

          {currentStep === 2 && (
            <OrderSummary
              orderData={checkoutData}
              items={items}
              total={total}
              onBack={handleBackToPayment}
            />
          )}
        </div>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wine-red"></div>
                <p className="ml-3 text-wine-black font-medium">Processing your order...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}