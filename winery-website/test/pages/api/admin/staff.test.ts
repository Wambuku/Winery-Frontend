import { describe, it, expect, vi } from 'vitest';
import { createMocks } from 'node-mocks-http';
import handler from '../../../../pages/api/admin/staff';

describe('/api/admin/staff', () => {
  it('returns staff list for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
    
    if (data.length > 0) {
      data.forEach((staff: any) => {
        expect(staff).toHaveProperty('id');
        expect(staff).toHaveProperty('name');
        expect(staff).toHaveProperty('email');
        expect(staff).toHaveProperty('role');
        expect(staff).toHaveProperty('permissions');
        expect(staff).toHaveProperty('isActive');
        expect(staff).toHaveProperty('createdAt');
        
        expect(['staff', 'admin']).toContain(staff.role);
        expect(typeof staff.isActive).toBe('boolean');
        expect(Array.isArray(staff.permissions)).toBe(true);
      });
    }
  });

  it('creates new staff member for POST request', async () => {
    const newStaff = {
      name: 'Test Staff',
      email: 'test@example.com',
      role: 'staff',
      permissions: ['process_sales'],
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: newStaff,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(newStaff.name);
    expect(data.email).toBe(newStaff.email);
    expect(data.role).toBe(newStaff.role);
    expect(data.permissions).toEqual(newStaff.permissions);
    expect(data.isActive).toBe(true);
  });

  it('validates required fields for POST request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Test Staff',
        // Missing email and role
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Name, email, and role are required');
  });

  it('prevents duplicate email addresses', async () => {
    const existingEmail = 'alice@winestore.com'; // This exists in mock data

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'Duplicate Staff',
        email: existingEmail,
        role: 'staff',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Email already exists');
  });

  it('returns 405 for unsupported methods', async () => {
    const { req, res } = createMocks({
      method: 'DELETE',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Method not allowed');
  });

  it('sets default permissions when not provided', async () => {
    const newStaff = {
      name: 'Test Staff',
      email: 'test2@example.com',
      role: 'staff',
      // No permissions provided
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: newStaff,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data.permissions)).toBe(true);
    expect(data.permissions).toEqual([]);
  });

  it('handles server errors gracefully', async () => {
    // Mock console.error to avoid noise in test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { req, res } = createMocks({
      method: 'POST',
      body: null, // This should cause an error
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    
    const data = JSON.parse(res._getData());
    expect(data.error).toBe('Internal server error');

    consoleSpy.mockRestore();
  });
});