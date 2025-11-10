export interface WineInventory {
  id: string;
  wineId: string;
  wineName: string;
  sku?: string;
  category?: string;
  type?: string;
  region?: string;
  country?: string;
  vintage?: number;
  description?: string;
  currentStock: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitPrice: number;
  costPrice?: number;
  imageUrl?: string;
  location?: string;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAlert {
  id: string;
  wineId: string;
  wineName: string;
  currentStock: number;
  reorderLevel: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  wineId: string;
  adjustmentType: 'restock' | 'sale' | 'damage' | 'transfer' | 'correction';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  performedBy: string;
  createdAt: string;
}

export interface BulkStockUpdate {
  wineId: string;
  quantity: number;
  adjustmentType: 'restock' | 'correction';
  reason?: string;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  type?: string;
  stockLevel?: 'all' | 'low' | 'out' | 'sufficient';
  sortBy?: 'name' | 'stock' | 'lastRestocked' | 'price';
  sortOrder?: 'asc' | 'desc';
}
