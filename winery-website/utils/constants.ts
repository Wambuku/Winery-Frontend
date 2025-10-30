// Application constants

export const WINE_CATEGORIES = [
  'red',
  'white',
  'rosé',
  'sparkling',
  'dessert',
  'fortified'
] as const;

export const USER_ROLES = [
  'customer',
  'staff',
  'admin'
] as const;

export const PAYMENT_METHODS = [
  'mpesa',
  'cash'
] as const;

export const PAYMENT_STATUS = [
  'pending',
  'completed',
  'failed'
] as const;

export const ORDER_STATUS = [
  'processing',
  'completed',
  'cancelled'
] as const;

export const WINE_COLORS = [
  'red',
  'white',
  'rosé',
  'amber',
  'golden'
] as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Wine endpoints
  WINES: '/api/wines',
  WINE_DETAIL: (id: string) => `/api/wines/${id}`,
  WINE_SEARCH: '/api/wines/search',
  
  // User endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/user/profile',
  
  // Order endpoints
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id: string) => `/api/orders/${id}`,
  
  // Cart endpoints
  CART: '/api/cart',
  CART_ADD: '/api/cart/add',
  CART_UPDATE: '/api/cart/update',
  CART_REMOVE: '/api/cart/remove',
  
  // Payment endpoints
  MPESA_PAYMENT: '/api/payment/mpesa',
  PAYMENT_CALLBACK: '/api/payment/callback',
  
  // Staff endpoints
  STAFF_LOGIN: '/api/staff/login',
  STAFF_DASHBOARD: '/api/staff/dashboard',
  INVENTORY: '/api/staff/inventory',
} as const;

// UI Constants
export const COLORS = {
  primary: {
    black: '#1a1a1a',
    red: '#8b0000',
    redLight: '#a52a2a',
    redDark: '#660000',
  },
  accent: {
    gold: '#d4af37',
    cream: '#f5f5dc',
    charcoal: '#36454f',
  },
  neutral: {
    white: '#ffffff',
    lightGray: '#f8f8f8',
    mediumGray: '#666666',
    darkGray: '#333333',
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_WINE_PRICE: 0.01,
  MAX_WINE_PRICE: 10000,
  MAX_CART_QUANTITY: 99,
} as const;