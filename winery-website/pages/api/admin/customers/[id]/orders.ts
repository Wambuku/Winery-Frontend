import { NextApiRequest, NextApiResponse } from 'next';

// Mock customer orders data
const mockCustomerOrders: { [customerId: string]: any[] } = {
  '1': [
    {
      id: 'ORD-001',
      total: 450.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-25T14:30:00Z',
      items: [
        { wineName: 'Château Margaux 2015', quantity: 1, price: 450.00 },
      ],
    },
    {
      id: 'ORD-015',
      total: 320.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-20T11:15:00Z',
      items: [
        { wineName: 'Caymus Cabernet 2020', quantity: 2, price: 160.00 },
      ],
    },
    {
      id: 'ORD-028',
      total: 180.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-15T16:45:00Z',
      items: [
        { wineName: 'Silver Oak Alexander Valley 2019', quantity: 1, price: 180.00 },
      ],
    },
  ],
  '2': [
    {
      id: 'ORD-002',
      total: 320.00,
      status: 'processing',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-28T16:45:00Z',
      items: [
        { wineName: 'Dom Pérignon 2012', quantity: 1, price: 320.00 },
      ],
    },
    {
      id: 'ORD-018',
      total: 240.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-22T09:30:00Z',
      items: [
        { wineName: 'Opus One 2018', quantity: 1, price: 240.00 },
      ],
    },
  ],
  '3': [
    {
      id: 'ORD-003',
      total: 180.00,
      status: 'completed',
      paymentMethod: 'Cash',
      createdAt: '2024-10-20T11:20:00Z',
      items: [
        { wineName: 'Silver Oak Alexander Valley 2019', quantity: 1, price: 180.00 },
      ],
    },
    {
      id: 'ORD-012',
      total: 450.00,
      status: 'completed',
      paymentMethod: 'Cash',
      createdAt: '2024-10-18T14:10:00Z',
      items: [
        { wineName: 'Château Margaux 2015', quantity: 1, price: 450.00 },
      ],
    },
    {
      id: 'ORD-025',
      total: 320.00,
      status: 'completed',
      paymentMethod: 'Cash',
      createdAt: '2024-10-16T10:45:00Z',
      items: [
        { wineName: 'Caymus Cabernet 2020', quantity: 2, price: 160.00 },
      ],
    },
  ],
  '4': [
    {
      id: 'ORD-008',
      total: 240.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-09-15T13:10:00Z',
      items: [
        { wineName: 'Opus One 2018', quantity: 1, price: 240.00 },
      ],
    },
  ],
  '5': [
    {
      id: 'ORD-005',
      total: 520.00,
      status: 'processing',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-29T09:15:00Z',
      items: [
        { wineName: 'Dom Pérignon 2012', quantity: 1, price: 320.00 },
        { wineName: 'Caymus Cabernet 2020', quantity: 1, price: 200.00 },
      ],
    },
    {
      id: 'ORD-022',
      total: 450.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-26T15:20:00Z',
      items: [
        { wineName: 'Château Margaux 2015', quantity: 1, price: 450.00 },
      ],
    },
    {
      id: 'ORD-035',
      total: 360.00,
      status: 'completed',
      paymentMethod: 'M-Pesa',
      createdAt: '2024-10-24T12:30:00Z',
      items: [
        { wineName: 'Silver Oak Alexander Valley 2019', quantity: 2, price: 180.00 },
      ],
    },
  ],
  '6': [
    {
      id: 'ORD-030',
      total: 320.00,
      status: 'completed',
      paymentMethod: 'Cash',
      createdAt: '2024-10-27T15:30:00Z',
      items: [
        { wineName: 'Dom Pérignon 2012', quantity: 1, price: 320.00 },
      ],
    },
    {
      id: 'ORD-040',
      total: 240.00,
      status: 'completed',
      paymentMethod: 'Cash',
      createdAt: '2024-10-23T11:45:00Z',
      items: [
        { wineName: 'Opus One 2018', quantity: 1, price: 240.00 },
      ],
    },
  ],
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for customer orders
    // 3. Apply any filtering or sorting

    const orders = mockCustomerOrders[id] || [];
    
    // Sort orders by creation date (newest first)
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json(sortedOrders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}