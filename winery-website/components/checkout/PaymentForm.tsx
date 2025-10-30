// Payment form component with M-Pesa integration

import React, { useState } from 'react';
import { PaymentDetails } from '../../types/checkout';

interface PaymentFormProps {
  initialData?: Partial<PaymentDetails>;
  onSubmit: (data: PaymentDetails) => void;
  onBack: () => void;
  total: number;
}

interface FormErrors {
  [key: string]: string;
}

export default function PaymentForm({ initialData, onSubmit, onBack, total }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentDetails>({
    method: initialData?.method || 'mpesa',
    mpesaPhone: initialData?.mpesaPhone || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.method === 'mpesa') {
      if (!formData.mpesaPhone?.trim()) {
        newErrors.mpesaPhone = 'M-Pesa phone number is required';
      } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.mpesaPhone.replace(/\s/g, ''))) {
        newErrors.mpesaPhone = 'Please enter a valid M-Pesa phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof PaymentDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMethodChange = (method: 'mpesa' | 'cash') => {
    setFormData(prev => ({ ...prev, method }));
    // Clear M-Pesa phone error if switching to cash
    if (method === 'cash' && errors.mpesaPhone) {
      setErrors(prev => ({ ...prev, mpesaPhone: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting payment form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-wine-black mb-6">Payment Method</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-wine-black mb-2">Order Total</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Amount:</span>
            <span className="text-2xl font-bold text-wine-red">
              KSh {total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <h3 className="text-lg font-semibold text-wine-black mb-4">Select Payment Method</h3>
          
          <div className="space-y-4">
            {/* M-Pesa Option */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mpesa"
                  checked={formData.method === 'mpesa'}
                  onChange={() => handleMethodChange('mpesa')}
                  className="w-4 h-4 text-wine-red border-gray-300 focus:ring-wine-red"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-wine-black">M-Pesa</span>
                    <div className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Recommended
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay securely using your M-Pesa mobile money account
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M-PESA</span>
                  </div>
                </div>
              </label>

              {/* M-Pesa Phone Number Input */}
              {formData.method === 'mpesa' && (
                <div className="mt-4 pl-7">
                  <label htmlFor="mpesaPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="mpesaPhone"
                    value={formData.mpesaPhone || ''}
                    onChange={(e) => handleInputChange('mpesaPhone', e.target.value)}
                    className={`
                      w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-wine-red focus:border-wine-red
                      ${errors.mpesaPhone ? 'border-red-500' : 'border-gray-300'}
                    `}
                    placeholder="+254 7XX XXX XXX"
                  />
                  {errors.mpesaPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.mpesaPhone}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    You will receive an M-Pesa prompt on this number to complete the payment
                  </p>
                </div>
              )}
            </div>

            {/* Cash Option (for staff use) */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.method === 'cash'}
                  onChange={() => handleMethodChange('cash')}
                  className="w-4 h-4 text-wine-red border-gray-300 focus:ring-wine-red"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg font-medium text-wine-black">Cash Payment</span>
                    <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      In-Store Only
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Pay with cash at our physical store location
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-12 h-8 bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CASH</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Secure Payment</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 transition-colors"
          >
            Back to Shipping
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-wine-red text-white rounded-md hover:bg-wine-red-dark focus:outline-none focus:ring-2 focus:ring-wine-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </form>
    </div>
  );
}