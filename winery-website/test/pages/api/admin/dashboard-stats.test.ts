import { describe, it, expect, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/admin/dashboard-stats';

describe('/api/admin/dashboard-stats', () => {
  it('returns dashboard stats for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('totalSales');
    expect(data).toHaveProperty('totalOrders');
    expect(data).toHaveProperty('totalCustomers');
    expect(data).toHaveProperty('totalStaff');
    expect(data).toHaveProperty('revenueToday');
    expect(data).toHaveProperty('revenueThisMonth');
    expect(data).toHaveProperty('topSellingWines');
    expect(data).toHaveProperty('recentOrders');
    expect(data).toHaveProperty('systemHealth');
    
    expect(Array.isArray(data.topSellingWines)).toBe(true);
    expect(Array.isArray(data.recentOrders)).toBe(true);
    expect(typeof data.totalSales).toBe('number');
    expect(typeof data.totalOrders).toBe('number');
  });

  it('returns 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('includes system health information', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.systemHealth).toHaveProperty('apiStatus');
    expect(data.systemHealth).toHaveProperty('databaseStatus');
    expect(data.systemHealth).toHaveProperty('paymentStatus');
    expect(data.systemHealth).toHaveProperty('errorCount');
    
    expect(['healthy', 'warning', 'error']).toContain(data.systemHealth.apiStatus);
    expect(typeof data.systemHealth.errorCount).toBe('number');
  });

  it('includes top selling wines with required fields', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.topSellingWines.length).toBeGreaterThan(0);
    
    data.topSellingWines.forEach((wine: any) => {
      expect(wine).toHaveProperty('id');
      expect(wine).toHaveProperty('name');
      expect(wine).toHaveProperty('sales');
      expect(wine).toHaveProperty('revenue');
      expect(typeof wine.sales).toBe('number');
      expect(typeof wine.revenue).toBe('number');
    });
  });

  it('includes recent orders with required fields', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.recentOrders.length).toBeGreaterThan(0);
    
    data.recentOrders.forEach((order: any) => {
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('customerName');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('createdAt');
      expect(typeof order.total).toBe('number');
      expect(['completed', 'processing', 'cancelled']).toContain(order.status);
    });
  });
});