// Shopping cart context provider for global cart state management

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Wine, CartItem } from '../types';

// Cart state interface
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { wine: Wine; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string } // wine id
  | { type: 'UPDATE_QUANTITY'; payload: { wineId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

// Cart context interface
interface CartContextType extends CartState {
  addItem: (wine: Wine, quantity?: number) => void;
  removeItem: (wineId: string) => void;
  updateQuantity: (wineId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (wineId: string) => number;
}

// Initial state
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

// Helper function to calculate totals
function calculateTotals(items: CartItem[]): { total: number; itemCount: number } {
  const total = items.reduce((sum, item) => sum + (item.wine.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { wine, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.wine.id === wine.id);
      
      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { wine, quantity }];
      }
      
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.wine.id !== action.payload);
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }
    
    case 'UPDATE_QUANTITY': {
      const { wineId, quantity } = action.payload;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.wine.id !== wineId);
        const { total, itemCount } = calculateTotals(newItems);
        return { items: newItems, total, itemCount };
      }
      
      const newItems = state.items.map(item =>
        item.wine.id === wineId ? { ...item, quantity } : item
      );
      const { total, itemCount } = calculateTotals(newItems);
      return { items: newItems, total, itemCount };
    }
    
    case 'CLEAR_CART':
      return initialState;
    
    case 'LOAD_CART': {
      const { total, itemCount } = calculateTotals(action.payload);
      return { items: action.payload, total, itemCount };
    }
    
    default:
      return state;
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shopping_cart');
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('shopping_cart');
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shopping_cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Add item to cart
  const addItem = (wine: Wine, quantity: number = 1) => {
    if (quantity <= 0) return;
    dispatch({ type: 'ADD_ITEM', payload: { wine, quantity } });
  };

  // Remove item from cart
  const removeItem = (wineId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: wineId });
  };

  // Update item quantity
  const updateQuantity = (wineId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { wineId, quantity } });
  };

  // Clear entire cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Get quantity of specific item
  const getItemQuantity = (wineId: string): number => {
    const item = state.items.find(item => item.wine.id === wineId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}