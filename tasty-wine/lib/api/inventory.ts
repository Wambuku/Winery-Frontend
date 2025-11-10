import {
  fetchWines as fetchWineCatalogue,
  getWineById as getWineRecord,
  createWine,
  updateWine,
  deleteWine,
  type Wine,
  type WineInput,
} from "./wines";
import type {
  WineInventory,
  StockAlert,
  StockAdjustment,
  BulkStockUpdate,
  InventoryFilters,
} from "../types/inventory";

export interface InventoryListResponse {
  data: WineInventory[];
  total: number;
  alerts: StockAlert[];
}

const DEFAULT_REORDER_LEVEL = 10;
const DEFAULT_REORDER_QUANTITY = 24;

function normaliseInventory(wine: Wine): WineInventory {
  const reorderLevel =
    typeof wine.reorderLevel === "number" && !Number.isNaN(wine.reorderLevel)
      ? wine.reorderLevel
      : DEFAULT_REORDER_LEVEL;
  const reorderQuantity =
    typeof wine.reorderQuantity === "number" && !Number.isNaN(wine.reorderQuantity)
      ? wine.reorderQuantity
      : DEFAULT_REORDER_QUANTITY;

  return {
    id: wine.id,
    wineId: wine.id,
    wineName: wine.name,
    sku: wine.sku ?? `WINE-${wine.id}`,
    category: wine.category ?? wine.type ?? "General",
    type: wine.type ?? wine.category ?? "Unknown",
    region: wine.region ?? "",
    country: wine.country ?? "",
    vintage: wine.vintage,
    currentStock: wine.stock ?? 0,
    reorderLevel,
    reorderQuantity,
    unitPrice: wine.price,
    costPrice: wine.costPrice ?? 0,
    imageUrl: wine.imageUrl,
    location: wine.location,
    lastRestocked: wine.updatedAt,
    createdAt: wine.createdAt ?? new Date().toISOString(),
    updatedAt: wine.updatedAt ?? new Date().toISOString(),
    description: wine.description,
  };
}

function applyStockLevelFilter(items: WineInventory[], stockLevel?: InventoryFilters["stockLevel"]) {
  if (!stockLevel || stockLevel === "all") {
    return items;
  }

  return items.filter((item) => {
    if (stockLevel === "out") {
      return item.currentStock <= 0;
    }
    if (stockLevel === "low") {
      return item.currentStock > 0 && item.currentStock <= (item.reorderLevel ?? DEFAULT_REORDER_LEVEL);
    }
    if (stockLevel === "sufficient") {
      return item.currentStock > (item.reorderLevel ?? DEFAULT_REORDER_LEVEL);
    }
    return true;
  });
}

function computeAlerts(items: WineInventory[]): StockAlert[] {
  const alerts: StockAlert[] = [];
  const timestamp = new Date().toISOString();

  items.forEach((item) => {
    if (item.currentStock <= 0) {
      alerts.push({
        id: `${item.id}-critical`,
        wineId: item.wineId,
        wineName: item.wineName,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel ?? DEFAULT_REORDER_LEVEL,
        severity: "critical",
        message: "Stock depleted. Reorder immediately.",
        createdAt: timestamp,
      });
      return;
    }

    const threshold = item.reorderLevel ?? DEFAULT_REORDER_LEVEL;
    if (item.currentStock <= threshold) {
      alerts.push({
        id: `${item.id}-warning`,
        wineId: item.wineId,
        wineName: item.wineName,
        currentStock: item.currentStock,
        reorderLevel: threshold,
        severity: "warning",
        message: `Stock below threshold (${threshold}). Consider restocking soon.`,
        createdAt: timestamp,
      });
    }
  });

  return alerts;
}

function resolveOrdering(filters?: InventoryFilters) {
  if (!filters?.sortBy) {
    return undefined;
  }

  const fieldMap: Record<NonNullable<InventoryFilters["sortBy"]>, string> = {
    name: "name",
    stock: "stock",
    lastRestocked: "updated_at",
    price: "price",
  };

  const field = fieldMap[filters.sortBy];
  if (!field) {
    return undefined;
  }

  return filters.sortOrder === "desc" ? `-${field}` : field;
}

function toWineInput(data: Partial<WineInventory> & { wineName?: string; description?: string }): WineInput {
  const name = data.wineName ?? data.name;
  if (!name) {
    throw new Error("Wine name is required");
  }

  return {
    name,
    description: data.description ?? "",
    type: data.type,
    category: data.category,
    region: data.region,
    country: data.country,
    vintage: data.vintage,
    price: data.unitPrice ?? 0,
    stock: data.currentStock,
    sku: data.sku,
    imageUrl: data.imageUrl,
    reorderLevel: data.reorderLevel,
    reorderQuantity: data.reorderQuantity,
    costPrice: data.costPrice,
    location: data.location,
  };
}

export async function fetchInventory(
  filters?: InventoryFilters,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<InventoryListResponse> {
  const ordering = resolveOrdering(filters);

  const list = await fetchWineCatalogue({
    search: filters?.search,
    ordering,
    filters: {
      category: filters?.category,
      type: filters?.type,
    },
    token: options.token,
    signal: options.signal,
  });

  let items = list.data.map(normaliseInventory);
  items = applyStockLevelFilter(items, filters?.stockLevel);

  const alerts = computeAlerts(items);

  return {
    data: items,
    total: list.total,
    alerts,
  };
}

export async function getWineInventory(
  wineId: string,
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<WineInventory> {
  const wine = await getWineRecord(wineId, options);
  return normaliseInventory(wine);
}

export async function updateStock(
  wineId: string,
  adjustment: Omit<StockAdjustment, 'id' | 'createdAt' | 'previousStock' | 'newStock'>,
  options: { token: string; signal?: AbortSignal }
): Promise<WineInventory> {
  if (!options.token) {
    throw new Error("Token required for stock updates");
  }

  const current = await getWineInventory(wineId, { token: options.token, signal: options.signal });
  const currentStock = current.currentStock ?? 0;

  let nextStock = currentStock;
  const quantity = adjustment.quantity ?? 0;

  switch (adjustment.adjustmentType) {
    case "restock":
      nextStock = currentStock + quantity;
      break;
    case "sale":
    case "transfer":
    case "damage":
      nextStock = Math.max(currentStock - quantity, 0);
      break;
    case "correction":
      nextStock = quantity;
      break;
    default:
      nextStock = currentStock;
  }

  const updated = await updateWine(
    wineId,
    { stock: nextStock },
    { token: options.token, signal: options.signal }
  );

  return normaliseInventory(updated);
}

export async function bulkUpdateStock(
  updates: BulkStockUpdate[],
  options: { token: string; signal?: AbortSignal }
): Promise<{ success: boolean; updated: number }> {
  if (!options.token) {
    throw new Error("Token required for bulk updates");
  }

  let updatedCount = 0;

  for (const update of updates) {
    if (!update.quantity || update.quantity === 0) {
      continue;
    }
    await updateStock(
      update.wineId,
      {
        wineId: update.wineId,
        adjustmentType: update.adjustmentType,
        quantity: update.quantity,
        reason: update.reason,
        performedBy: "",
      },
      options
    );
    updatedCount += 1;
  }

  return { success: true, updated: updatedCount };
}

export async function getStockAlerts(
  options: { token?: string; signal?: AbortSignal } = {}
): Promise<StockAlert[]> {
  const inventory = await fetchInventory(undefined, options);
  return inventory.alerts;
}

export async function getStockHistory(
  wineId: string,
  options: { token?: string; signal?: AbortSignal; limit?: number } = {}
): Promise<StockAdjustment[]> {
  console.warn("Stock history endpoint is not available in the current API.");
  void options;
  return [];
}

export async function createInventoryItem(
  data: Omit<WineInventory, 'id' | 'createdAt' | 'updatedAt'>,
  options: { token: string; signal?: AbortSignal }
): Promise<WineInventory> {
  if (!options.token) {
    throw new Error("Token required to create inventory");
  }

  const created = await createWine(toWineInput(data), options);
  return normaliseInventory(created);
}

export async function updateInventoryItem(
  wineId: string,
  data: Partial<Omit<WineInventory, 'id' | 'createdAt' | 'updatedAt'>>,
  options: { token: string; signal?: AbortSignal }
): Promise<WineInventory> {
  if (!options.token) {
    throw new Error("Token required to update inventory");
  }

  const updated = await updateWine(wineId, toWineInput(data), options);
  return normaliseInventory(updated);
}

export async function deleteInventoryItem(
  wineId: string,
  options: { token: string; signal?: AbortSignal }
): Promise<{ success: boolean }> {
  if (!options.token) {
    throw new Error("Token required to delete inventory");
  }

  await deleteWine(wineId, options);

  return { success: true };
}
