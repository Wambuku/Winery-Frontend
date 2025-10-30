import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../utils/auth';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  cashSales: number;
  mpesaSales: number;
  topWines: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// Mock data for demonstration - in a real app, this would come from a database
const mockTransactions = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    items: [
      { wine: { id: '1', name: 'Château Margaux 2015', price: 15000 }, quantity: 1 },
      { wine: { id: '2', name: 'Dom Pérignon 2012', price: 25000 }, quantity: 2 }
    ],
    total: 65000,
    paymentMethod: 'cash' as const,
    staffId: 'staff1'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    items: [
      { wine: { id: '3', name: 'Opus One 2018', price: 45000 }, quantity: 1 }
    ],
    total: 45000,
    paymentMethod: 'mpesa' as const,
    staffId: 'staff1'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    items: [
      { wine: { id: '1', name: 'Château Margaux 2015', price: 15000 }, quantity: 2 }
    ],
    total: 30000,
    paymentMethod: 'cash' as const,
    staffId: 'staff2'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify staff authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'staff' && decoded.role !== 'admin')) {
      return res.status(403).json({ error: 'Staff access required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayTransactions = mockTransactions.filter(t => t.date === today);

    // Calculate stats
    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const todayOrders = todayTransactions.length;
    const cashSales = todayTransactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.total, 0);
    const mpesaSales = todayTransactions
      .filter(t => t.paymentMethod === 'mpesa')
      .reduce((sum, t) => sum + t.total, 0);

    // Calculate top wines
    const wineStats = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    todayTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        const existing = wineStats.get(item.wine.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.wine.price * item.quantity;
        } else {
          wineStats.set(item.wine.id, {
            name: item.wine.name,
            quantity: item.quantity,
            revenue: item.wine.price * item.quantity
          });
        }
      });
    });

    const topWines = Array.from(wineStats.entries())
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const stats: DashboardStats = {
      todaySales,
      todayOrders,
      cashSales,
      mpesaSales,
      topWines
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}