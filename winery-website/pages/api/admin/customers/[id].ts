import { NextApiRequest, NextApiResponse } from 'next';

// Mock customer data (same as in customers.ts)
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
  // ... other customers
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PATCH':
      return handlePatch(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const customer = mockCustomers.find(c => c.id === id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function handlePatch(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const customerIndex = mockCustomers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { isActive, name, email, phone, address } = req.body;

    // Update customer
    const updatedCustomer = {
      ...mockCustomers[customerIndex],
      ...(typeof isActive === 'boolean' && { isActive }),
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(address && { address }),
    };

    mockCustomers[customerIndex] = updatedCustomer;

    res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}