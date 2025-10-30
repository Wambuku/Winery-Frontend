import { NextApiRequest, NextApiResponse } from 'next';

// Mock data - In a real application, this would come from your database
const mockDashboardStats = {
  totalSales: 125000,
  totalOrders: 450,
  totalCustomers: 320,
  totalStaff: 8,
  revenueToday: 2500,
  revenueThisMonth: 45000,
  topSellingWines: [
    {
      id: '1',
      name: 'Château Margaux 2015',
      sales: 45,
      revenue: 22500,
    },
    {
      id: '2',
      name: 'Dom Pérignon 2012',
      sales: 38,
      revenue: 19000,
    },
    {
      id: '3',
      name: 'Opus One 2018',
      sales: 32,
      revenue: 16000,
    },
    {
      id: '4',
      name: 'Caymus Cabernet 2020',
      sales: 28,
      revenue: 8400,
    },
    {
      id: '5',
      name: 'Silver Oak Alexander Valley 2019',
      sales: 25,
      revenue: 7500,
    },
  ],
  recentOrders: [
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      total: 450,
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      total: 320,
      status: 'processing',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-003',
      customerName: 'Michael Brown',
      total: 180,
      status: 'completed',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-004',
      customerName: 'Emily Davis',
      total: 275,
      status: 'completed',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'ORD-005',
      customerName: 'David Wilson',
      total: 520,
      status: 'processing',
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
  ],
  systemHealth: {
    apiStatus: 'healthy' as const,
    databaseStatus: 'healthy' as const,
    paymentStatus: 'healthy' as const,
    errorCount: 2,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for actual stats
    // 3. Calculate metrics based on real data

    res.status(200).json(mockDashboardStats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}