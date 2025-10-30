import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import StaffManagement from '../../../components/admin/StaffManagement';
import { useAuth } from '../../../context/AuthContext';

// Mock the useAuth hook
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

const mockUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin' as const,
};

const mockStaff = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@winestore.com',
    role: 'admin' as const,
    permissions: ['manage_inventory', 'process_sales', 'view_reports'],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-10-29T08:30:00Z',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@winestore.com',
    role: 'staff' as const,
    permissions: ['process_sales'],
    isActive: false,
    createdAt: '2024-02-20T14:00:00Z',
    lastLogin: '2024-10-28T16:45:00Z',
  },
];

describe('StaffManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockStaff),
    });
  });

  it('renders access denied for non-admin users', () => {
    (useAuth as any).mockReturnValue({
      user: { ...mockUser, role: 'staff' },
    });

    render(<StaffManagement />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('renders staff management interface for admin users', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Staff Management')).toBeInTheDocument();
      expect(screen.getByText('Manage staff members and their permissions')).toBeInTheDocument();
    });
  });

  it('displays staff members in table', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('alice@winestore.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('bob@winestore.com')).toBeInTheDocument();
    });
  });

  it('shows add staff member button', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
    });
  });

  it('opens add staff form when button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Staff Member'));
    });

    expect(screen.getByText('Add New Staff Member')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('displays staff status correctly', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      const activeStatuses = screen.getAllByText('Active');
      const inactiveStatuses = screen.getAllByText('Inactive');
      
      expect(activeStatuses.length).toBeGreaterThan(0);
      expect(inactiveStatuses.length).toBeGreaterThan(0);
    });
  });

  it('allows toggling staff active status', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStaff),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStaff),
      });

    render(<StaffManagement />);
    
    await waitFor(() => {
      const deactivateButton = screen.getByText('Deactivate');
      fireEvent.click(deactivateButton);
    });

    expect(fetch).toHaveBeenCalledWith('/api/admin/staff/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false }),
    });
  });

  it('opens edit form when edit button is clicked', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByText('Edit Staff Member')).toBeInTheDocument();
  });

  it('submits new staff member form', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStaff),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '3', name: 'New Staff' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockStaff, { id: '3', name: 'New Staff' }]),
      });

    render(<StaffManagement />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Add Staff Member'));
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Staff' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'newstaff@test.com' },
    });

    // Submit form
    fireEvent.click(screen.getByText('Add Staff'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Staff',
          email: 'newstaff@test.com',
          role: 'staff',
          permissions: [],
        }),
      });
    });
  });

  it('handles API errors gracefully', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    (fetch as any).mockRejectedValue(new Error('API Error'));

    render(<StaffManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('fetches staff data on mount', async () => {
    (useAuth as any).mockReturnValue({
      user: mockUser,
    });

    render(<StaffManagement />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/admin/staff');
    });
  });
});