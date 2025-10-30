import { NextApiRequest, NextApiResponse } from 'next';

// Mock customer data
let mockCustomers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+254712345678',
    address: '123 Wine Street, Nairobi',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastOrderDate: '2024-10-25T14:30:00Z',
    totalOrders: 12,
    totalSpent: 2450.00,
    averageOrderValue: 204.17,
    preferredPaymentMethod: 'M-Pesa',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+254723456789',
    address: '456 Grape Avenue, Mombasa',
    isActive: true,
    createdAt: '2024-02-20T14:00:00Z',
    lastOrderDate: '2024-10-28T16:45:00Z',
    totalOrders: 8,
    totalSpent: 1680.00,
    averageOrderValue: 210.00,
    preferredPaymentMethod: 'M-Pesa',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '+254734567890',
    address: '789 Vineyard Road, Kisumu',
    isActive: true,
    createdAt: '2024-03-10T09:00:00Z',
    lastOrderDate: '2024-10-20T11:20:00Z',
    totalOrders: 15,
    totalSpent: 3200.00,
    averageOrderValue: 213.33,
    preferredPaymentMethod: 'Cash',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+254745678901',
    address: '321 Cellar Lane, Eldoret',
    isActive: false,
    createdAt: '2024-01-25T11:00:00Z',
    lastOrderDate: '2024-09-15T13:10:00Z',
    totalOrders: 5,
    totalSpent: 890.00,
    averageOrderValue: 178.00,
    preferredPaymentMethod: 'M-Pesa',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+254756789012',
    address: '654 Bottle Boulevard, Nakuru',
    isActive: true,
    createdAt: '2024-04-05T16:30:00Z',
    lastOrderDate: '2024-10-29T09:15:00Z',
    totalOrders: 20,
    totalSpent: 4500.00,
    averageOrderValue: 225.00,
    preferredPaymentMethod: 'M-Pesa',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+254767890123',
    address: '987 Cork Street, Thika',
    isActive: true,
    createdAt: '2024-05-12T12:45:00Z',
    lastOrderDate: '2024-10-27T15:30:00Z',
    totalOrders: 6,
    totalSpent: 1320.00,
    averageOrderValue: 220.00,
    preferredPaymentMethod: 'Cash',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for customers
    // 3. Apply any filtering, sorting, or pagination

    res.status(200).json(mockCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}