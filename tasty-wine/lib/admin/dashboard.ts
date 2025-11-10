import {
  adminDashboardSnapshot,
  criticalInventoryAlerts,
  revenueTrend,
  salesKeyMetrics,
  staffRoster,
  systemHealthMetrics,
  topCustomers,
} from "../data/admin";
import type {
  AdminDashboardSnapshot,
  CustomerSummary,
  InventoryAlert,
  RevenueTrendPoint,
  SalesMetric,
  StaffMember,
  SystemHealthMetric,
} from "../types/admin";

export function getDashboardSnapshot(): AdminDashboardSnapshot {
  return adminDashboardSnapshot;
}

export function getSalesMetrics(): SalesMetric[] {
  return salesKeyMetrics;
}

export function getRevenueTrend(): RevenueTrendPoint[] {
  return revenueTrend;
}

export function getStaffRoster(): StaffMember[] {
  return staffRoster;
}

export function getTopCustomers(): CustomerSummary[] {
  return topCustomers;
}

export function getInventoryAlerts(): InventoryAlert[] {
  return criticalInventoryAlerts;
}

export function getSystemHealthMetrics(): SystemHealthMetric[] {
  return systemHealthMetrics;
}
