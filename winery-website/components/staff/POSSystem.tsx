import React, { useState, useEffect } from 'react';
import { Wine, CartItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface POSCartItem extends CartItem {
  subtotal: number;
}

interface POSTransaction {
  items: POSCartItem[];
  total: number;
  paymentMethod: 'cash' | 'mpesa';
  customerName?: string;
  customerPhone?: string;
}

export default function POSSystem() {
  const { user } = useAuth();
  const [wines, setWines] = useState<Wine[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<POSTransaction | null>(null);

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    try {
      const response = await fetch('/api/wines');
      if (response.ok) {
        const data = await response.json();
        setWines(data.wines || []);
      }
    } catch (error) {
      console.error('Failed to fetch wines:', error);
    }
  };

  const filteredWines = wines.filter(wine => {
    const matchesSearch = wine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || wine.category === selectedCategory;
    return matchesSearch && matchesCategory && wine.inStock;
  });

  const addToCart = (wine: Wine) => {
    const existingItem = cart.find(item => item.wine.id === wine.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.wine.id === wine.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * wine.price }
          : item
      ));
    } else {
      setCart([...cart, {
        wine,
        quantity: 1,
        subtotal: wine.price
      }]);
    }
  };

  const updateQuantity = (wineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(wineId);
      return;
    }

    setCart(cart.map(item =>
      item.wine.id === wineId
        ? { ...item, quantity, subtotal: quantity * item.wine.price }
        : item
    ));
  };

  const removeFromCart = (wineId: string) => {
    setCart(cart.filter(item => item.wine.id !== wineId));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getChange = () => {
    if (paymentMethod === 'cash' && cashReceived) {
      return parseFloat(cashReceived) - getTotal();
    }
    return 0;
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash' && (!cashReceived || parseFloat(cashReceived) < getTotal())) {
      alert('Insufficient cash received');
      return;
    }

    setLoading(true);

    try {
      const transaction: POSTransaction = {
        items: cart,
        total: getTotal(),
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined
      };

      const response = await fetch('/api/staff/pos-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transaction,
          staffId: user?.id,
          staffName: user?.name
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastTransaction(transaction);
        setShowReceipt(true);
        clearCart();
      } else {
        alert('Transaction failed. Please try again.');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCashReceived('');
  };

  const printReceipt = () => {
    window.print();
  };

  if (showReceipt && lastTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-wine-red text-white text-center">
            <h2 className="text-xl font-bold">Transaction Complete</h2>
          </div>
          
          <div className="p-6" id="receipt">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">Wine Store Receipt</h3>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Staff: {user?.name}
              </p>
            </div>

            {lastTransaction.customerName && (
              <div className="mb-4">
                <p className="text-sm">Customer: {lastTransaction.customerName}</p>
                {lastTransaction.customerPhone && (
                  <p className="text-sm">Phone: {lastTransaction.customerPhone}</p>
                )}
              </div>
            )}

            <div className="border-t border-b py-4 mb-4">
              {lastTransaction.items.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium">{item.wine.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x KSh {item.wine.price}
                    </p>
                  </div>
                  <p className="font-medium">
                    KSh {item.subtotal.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>KSh {lastTransaction.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="capitalize">{lastTransaction.paymentMethod}</span>
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Received:</span>
                    <span>KSh {parseFloat(cashReceived).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>KSh {getChange().toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex space-x-3">
            <button
              onClick={printReceipt}
              className="flex-1 bg-wine-red text-white py-2 px-4 rounded-md hover:bg-wine-red-dark transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={() => setShowReceipt(false)}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              New Transaction
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale System</h1>
          <p className="text-gray-600">Process in-store wine sales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wine Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-lg font-medium text-gray-900">Wine Selection</h2>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Search wines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
                    >
                      <option value="all">All Categories</option>
                      <option value="red">Red Wine</option>
                      <option value="white">White Wine</option>
                      <option value="rosé">Rosé Wine</option>
                      <option value="sparkling">Sparkling Wine</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredWines.map((wine) => (
                    <div
                      key={wine.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToCart(wine)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={wine.image}
                          alt={wine.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{wine.name}</h3>
                          <p className="text-sm text-gray-600">{wine.category}</p>
                          <p className="text-lg font-bold text-wine-red">
                            KSh {wine.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cart and Checkout */}
          <div className="space-y-6">
            {/* Cart */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Cart</h2>
              </div>
              
              <div className="p-6">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Cart is empty</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.wine.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.wine.name}</h4>
                          <p className="text-xs text-gray-600">
                            KSh {item.wine.price} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.wine.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.wine.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.wine.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>KSh {getTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Customer Info (Optional)</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
                />
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Payment</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                      className="mr-2"
                    />
                    Cash
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'mpesa')}
                      className="mr-2"
                    />
                    M-Pesa
                  </label>
                </div>

                {paymentMethod === 'cash' && (
                  <div>
                    <input
                      type="number"
                      placeholder="Cash Received"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wine-red"
                    />
                    {cashReceived && (
                      <p className="mt-2 text-sm">
                        Change: KSh {getChange().toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={processTransaction}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-wine-red text-white py-3 px-4 rounded-md hover:bg-wine-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Complete Transaction'}
                </button>

                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}