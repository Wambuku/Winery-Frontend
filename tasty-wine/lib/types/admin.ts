export interface StaffMember {
  id: string;
  name: string;
  role: "sommelier" | "cashier" | "inventory" | "manager";
  email: string;
  phone: string;
  avatarUrl?: string;
  activeShifts: number;
  performanceScore: number;
  specialties: string[];
  lastLogin: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  lifetimeValue: number;
  recentPurchaseDate?: string;
  preferredWines: string[];
  status: "vip" | "active" | "new";
}

export interface SalesMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "flat";
  currency?: boolean;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  transactions: number;
  averageOrderValue: number;
}

export interface InventoryAlert {
  id: string;
  wineName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  severity: "critical" | "warning";
}

export interface SystemHealthMetric {
  id: string;
  label: string;
  status: "operational" | "degraded" | "issue";
  description: string;
  lastChecked: string;
}

export interface AdminDashboardSnapshot {
  generatedAt: string;
  metrics: SalesMetric[];
  revenueTrend: RevenueTrendPoint[];
  topStaff: StaffMember[];
  topCustomers: CustomerSummary[];
  inventoryAlerts: InventoryAlert[];
  systemHealth: SystemHealthMetric[];
}
