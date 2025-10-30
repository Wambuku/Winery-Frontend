import React, { useState, useEffect } from 'react';
import { Order } from '../../types';

interface OrderTrackingProps {
  orderId: string;
  className?: string;
}

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  timestamp?: Date;
}

interface OrderTrackingData extends Order {
  orderNumber: string;
  trackingSteps: TrackingStep[];
  estimatedDelivery?: Date;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, className = '' }) => {
  const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order tracking');
      }

      const data = await response.json();
      if (data.success) {
        setOrderData(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'processing':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
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
            <p className="text-lg font-medium">Error Loading Tracking</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchOrderTracking}
            className="bg-wine-red text-white px-4 py-2 rounded hover:bg-wine-red-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <p className="text-gray-600">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Order Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-wine-black">
              Order #{orderData.orderNumber}
            </h2>
            <p className="text-gray-600">
              Placed on {formatDate(orderData.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-wine-black">
              {formatCurrency(orderData.total)}
            </div>
            <div className={`text-sm font-medium ${getStatusColor(orderData.orderStatus)}`}>
              {orderData.orderStatus.charAt(0).toUpperCase() + orderData.orderStatus.slice(1)}
            </div>
          </div>
        </div>

        {orderData.estimatedDelivery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                <p className="text-sm text-blue-700">{formatDate(orderData.estimatedDelivery)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Steps */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-wine-black mb-6">Order Progress</h3>
        
        <div className="space-y-6">
          {orderData.trackingSteps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              {/* Step Icon */}
              <div className="flex-shrink-0 mr-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : step.current 
                      ? 'bg-wine-red text-white' 
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {step.completed ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* Connecting Line */}
                {index < orderData.trackingSteps.length - 1 && (
                  <div className={`w-0.5 h-12 mx-auto mt-2 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`text-sm font-medium ${
                      step.completed || step.current ? 'text-wine-black' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      step.completed || step.current ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  
                  {step.timestamp && (
                    <div className="text-xs text-gray-500 ml-4">
                      {formatDate(step.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-wine-black mb-4">Order Items</h3>
        
        <div className="space-y-4">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center">
                <img
                  src={item.wine.image}
                  alt={item.wine.name}
                  className="w-12 h-12 object-cover rounded mr-4"
                />
                <div>
                  <h4 className="font-medium text-wine-black">{item.wine.name}</h4>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-wine-black">
                  {formatCurrency(item.wine.price * item.quantity)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(item.wine.price)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;