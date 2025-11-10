"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variant?: string;
  metadata?: Record<string, unknown>;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartStatus = "idle" | "loading";

interface CartTotals {
  itemCount: number;
  subtotal: number;
}

interface CartContextValue extends CartState {
  status: CartStatus;
  totals: CartTotals;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variant?: string) => void;
  updateQuantity: (id: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setStatus: React.Dispatch<React.SetStateAction<CartStatus>>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "cart.state";

function loadStoredCart(): CartState {
  if (typeof window === "undefined") {
    return { items: [], isOpen: false };
  }

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], isOpen: false };
    }
    const parsed = JSON.parse(stored) as Partial<CartState>;
    if (parsed && Array.isArray(parsed.items)) {
      return {
        items: parsed.items.map((item) => ({
          ...item,
          quantity: Math.max(1, Number(item.quantity) || 1),
        })),
        isOpen: Boolean(parsed.isOpen),
      };
    }
  } catch (error) {
    console.warn("Failed to load stored cart", error);
  }

  return { items: [], isOpen: false };
}

function persistCart(state: CartState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist cart", error);
  }
}

function calculateTotals(items: CartItem[]): CartTotals {
  return items.reduce<CartTotals>(
    (totals, item) => ({
      itemCount: totals.itemCount + item.quantity,
      subtotal: totals.subtotal + item.quantity * item.price,
    }),
    { itemCount: 0, subtotal: 0 }
  );
}

function itemsMatch(a: CartItem, b: CartItem) {
  if (a.id !== b.id) return false;
  if (a.variant || b.variant) {
    return a.variant === b.variant;
  }
  return true;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartState, setCartState] = useState<CartState>(() => loadStoredCart());
  const [status, setStatus] = useState<CartStatus>("idle");

  useEffect(() => {
    persistCart(cartState);
  }, [cartState]);

  const addItem = useCallback((item: CartItem) => {
    setCartState((prev) => {
      const existing = prev.items.find((existingItem) => itemsMatch(existingItem, item));
      if (existing) {
        return {
          ...prev,
          isOpen: true,
          items: prev.items.map((existingItem) =>
            itemsMatch(existingItem, item)
              ? { ...existingItem, quantity: existingItem.quantity + item.quantity }
              : existingItem
          ),
        };
      }
      return {
        ...prev,
        isOpen: true,
        items: [...prev.items, { ...item, quantity: Math.max(1, item.quantity) }],
      };
    });
  }, []);

  const removeItem = useCallback((id: string, variant?: string) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => !(item.id === id && (variant ? item.variant === variant : true))),
    }));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number, variant?: string) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items
        .map((item) => {
          if (!(item.id === id && (variant ? item.variant === variant : true))) {
            return item;
          }
          return { ...item, quantity: Math.max(1, quantity) };
        })
        .filter((item) => item.quantity > 0),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartState({ items: [], isOpen: false });
  }, []);

  const openCart = useCallback(() => {
    setCartState((prev) => ({ ...prev, isOpen: true }));
  }, []);

  const closeCart = useCallback(() => {
    setCartState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const toggleCart = useCallback(() => {
    setCartState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  const totals = useMemo(() => calculateTotals(cartState.items), [cartState.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...cartState,
      status,
      totals,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      setStatus,
    }),
    [
      cartState,
      status,
      totals,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
