// Core data model interfaces for the wine e-commerce platform

export interface Wine {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  color: string;
  history: string;
  vintage: number;
  region: string;
  alcoholContent: number;
  category: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt: Date;
}

export interface CartItem {
  wine: Wine;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'mpesa' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderStatus: 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'admin';
  permissions: string[];
}

// API Response interfaces
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Authentication interfaces
export interface AuthToken {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Wine creation and update interfaces
export interface CreateWineData {
  name: string;
  description: string;
  price: number;
  image?: string;
  ingredients: string[];
  color: string;
  history: string;
  vintage: number;
  region: string;
  alcoholContent: number;
  category: string;
  stockQuantity: number;
}

export interface UpdateWineData extends Partial<CreateWineData> {
  id: string;
}

// Inventory management interfaces
export interface StockAlert {
  id: string;
  wineId: string;
  wineName: string;
  currentStock: number;
  threshold: number;
  alertType: 'low_stock' | 'out_of_stock';
  createdAt: Date;
}

export interface BulkStockUpdate {
  id: string;
  stockQuantity: number;
}

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// Tasting notes and reviews interfaces
export interface TastingNote {
  id: string;
  wineId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  appearance: string;
  aroma: string;
  taste: string;
  finish: string;
  overallNotes: string;
  createdAt: Date;
  isVerifiedPurchase: boolean;
}

export interface WineReview {
  id: string;
  wineId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  createdAt: Date;
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
}

export interface TastingProfile {
  sweetness: number; // 1-5 scale
  acidity: number; // 1-5 scale
  tannins: number; // 1-5 scale (for reds)
  body: number; // 1-5 scale (light to full)
  intensity: number; // 1-5 scale
}