import type {
  AdminDashboardSnapshot,
  CustomerSummary,
  InventoryAlert,
  RevenueTrendPoint,
  SalesMetric,
  StaffMember,
  SystemHealthMetric,
} from "../types/admin";

export const staffRoster: StaffMember[] = [
  {
    id: "staff-001",
    name: "Amina Kariuki",
    role: "sommelier",
    email: "amina@tastywine.co",
    phone: "+254 712 555 210",
    avatarUrl: "https://i.pravatar.cc/128?img=11",
    activeShifts: 4,
    performanceScore: 94,
    specialties: ["Pinot Noir", "Food pairing"],
    lastLogin: "2024-04-09T07:45:00.000Z",
  },
  {
    id: "staff-002",
    name: "Diego Chen",
    role: "manager",
    email: "diego@tastywine.co",
    phone: "+254 713 222 884",
    avatarUrl: "https://i.pravatar.cc/128?img=12",
    activeShifts: 5,
    performanceScore: 91,
    specialties: ["Sales analytics", "VIP service"],
    lastLogin: "2024-04-10T06:30:00.000Z",
  },
  {
    id: "staff-003",
    name: "Lucia Bianchi",
    role: "inventory",
    email: "lucia@tastywine.co",
    phone: "+254 701 998 302",
    avatarUrl: "https://i.pravatar.cc/128?img=32",
    activeShifts: 3,
    performanceScore: 88,
    specialties: ["Old World reds", "Cellar curation"],
    lastLogin: "2024-04-09T18:15:00.000Z",
  },
  {
    id: "staff-004",
    name: "Simon Okello",
    role: "cashier",
    email: "simon@tastywine.co",
    phone: "+254 700 441 982",
    avatarUrl: "https://i.pravatar.cc/128?img=54",
    activeShifts: 6,
    performanceScore: 86,
    specialties: ["POS checkout", "Membership onboarding"],
    lastLogin: "2024-04-10T09:05:00.000Z",
  },
];

export const salesKeyMetrics: SalesMetric[] = [
  {
    label: "Monthly Revenue",
    value: 328400,
    change: 12.4,
    trend: "up",
    currency: true,
  },
  {
    label: "Average Order Value",
    value: 12800,
    change: 3.1,
    trend: "up",
    currency: true,
  },
  {
    label: "Bottles Sold",
    value: 1842,
    change: -1.8,
    trend: "down",
  },
  {
    label: "Returning Customers",
    value: 68,
    change: 6.9,
    trend: "up",
  },
];

export const revenueTrend: RevenueTrendPoint[] = [
  { date: "2024-03-15", revenue: 9800, transactions: 42, averageOrderValue: 11700 },
  { date: "2024-03-22", revenue: 12200, transactions: 48, averageOrderValue: 12700 },
  { date: "2024-03-29", revenue: 13850, transactions: 51, averageOrderValue: 13600 },
  { date: "2024-04-05", revenue: 15230, transactions: 55, averageOrderValue: 13900 },
  { date: "2024-04-12", revenue: 16820, transactions: 59, averageOrderValue: 14300 },
];

export const topCustomers: CustomerSummary[] = [
  {
    id: "customer-001",
    name: "Harriet Waweru",
    email: "harriet@example.com",
    lifetimeValue: 460000,
    recentPurchaseDate: "2024-04-09T12:30:00.000Z",
    preferredWines: ["Pinot Noir", "Champagne"],
    status: "vip",
  },
  {
    id: "customer-002",
    name: "Arjun Patel",
    email: "arjun@example.com",
    lifetimeValue: 254000,
    recentPurchaseDate: "2024-04-06T09:50:00.000Z",
    preferredWines: ["Syrah", "Rioja"],
    status: "active",
  },
  {
    id: "customer-003",
    name: "Rebecca Kamau",
    email: "rebecca@example.com",
    lifetimeValue: 198500,
    recentPurchaseDate: "2024-03-29T17:20:00.000Z",
    preferredWines: ["Chardonnay", "Sauvignon Blanc"],
    status: "active",
  },
];

export const criticalInventoryAlerts: InventoryAlert[] = [
  {
    id: "alert-pinot",
    wineName: "Luminous Ridge Pinot Noir",
    sku: "PN-4481",
    currentStock: 12,
    reorderLevel: 24,
    severity: "warning",
  },
  {
    id: "alert-barolo",
    wineName: "Alba Ridge Barolo",
    sku: "NEB-9920",
    currentStock: 6,
    reorderLevel: 18,
    severity: "critical",
  },
  {
    id: "alert-riesling",
    wineName: "Suntrail Vineyard Riesling",
    sku: "RS-3340",
    currentStock: 14,
    reorderLevel: 20,
    severity: "warning",
  },
];

export const systemHealthMetrics: SystemHealthMetric[] = [
  {
    id: "api-latency",
    label: "API Latency",
    status: "operational",
    description: "Average response time is 320ms over the past 15 minutes.",
    lastChecked: "2024-04-10T09:45:00.000Z",
  },
  {
    id: "transaction-processor",
    label: "Transaction Processor",
    status: "degraded",
    description: "M-Pesa callback retries increased by 8% this morning.",
    lastChecked: "2024-04-10T09:40:00.000Z",
  },
  {
    id: "inventory-sync",
    label: "Inventory Sync",
    status: "operational",
    description: "Scheduled sync to ERP completed successfully at 09:15.",
    lastChecked: "2024-04-10T09:15:00.000Z",
  },
  {
    id: "error-rate",
    label: "Error Rate",
    status: "issue",
    description: "Elevated 500 errors detected on reporting endpoint—investigating.",
    lastChecked: "2024-04-10T09:47:00.000Z",
  },
];

export const adminDashboardSnapshot: AdminDashboardSnapshot = {
  generatedAt: "2024-04-10T09:50:00.000Z",
  metrics: salesKeyMetrics,
  revenueTrend,
  topStaff: staffRoster.slice(0, 3),
  topCustomers,
  inventoryAlerts: criticalInventoryAlerts,
  systemHealth: systemHealthMetrics,
};
