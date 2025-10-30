import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../utils/auth';

interface SalesData {
  date: string;
  totalSales: number;
  totalOrders: number;
  cashSales: number;
  mpesaSales: number;
  topWines: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

interface SalesReport {
  period: string;
  data: SalesData[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    cashPercentage: number;
    mpesaPercentage: number;
  };
}

// Mock transaction data for demonstration
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
    staffId: 'staff1',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    items: [
      { wine: { id: '3', name: 'Opus One 2018', price: 45000 }, quantity: 1 }
    ],
    total: 45000,
    paymentMethod: 'mpesa' as const,
    staffId: 'staff1',
    timestamp: new Date().toISOString()
  },
  {
    id: '3',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    items: [
      { wine: { id: '1', name: 'Château Margaux 2015', price: 15000 }, quantity: 2 },
      { wine: { id: '4', name: 'Screaming Eagle 2016', price: 85000 }, quantity: 1 }
    ],
    total: 115000,
    paymentMethod: 'mpesa' as const,
    staffId: 'staff2',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    items: [
      { wine: { id: '2', name: 'Dom Pérignon 2012', price: 25000 }, quantity: 1 }
    ],
    total: 25000,
    paymentMethod: 'cash' as const,
    staffId: 'staff1',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

function getDateRange(period: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return { start: weekStart, end: weekEnd };
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      return { start: monthStart, end: monthEnd };
    default:
      if (startDate && endDate) {
        return {
          start: new Date(startDate),
          end: new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
        };
      }
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
  }
}

function generateCSV(report: SalesReport): string {
  let csv = 'Date,Total Sales,Total Orders,Cash Sales,M-Pesa Sales\n';
  
  report.data.forEach(day => {
    csv += `${day.date},${day.totalSales},${day.totalOrders},${day.cashSales},${day.mpesaSales}\n`;
  });

  csv += '\nTop Wines\n';
  csv += 'Wine Name,Quantity Sold,Revenue\n';
  
  if (report.data[0]?.topWines) {
    report.data[0].topWines.forEach(wine => {
      csv += `${wine.name},${wine.quantity},${wine.revenue}\n`;
    });
  }

  return csv;
}

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

    const { period = 'today', startDate, endDate, format } = req.query;
    const dateRange = getDateRange(period as string, startDate as string, endDate as string);

    // Filter transactions by date range
    const filteredTransactions = mockTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= dateRange.start && transactionDate < dateRange.end;
    });

    // Group transactions by date
    const transactionsByDate = new Map<string, typeof filteredTransactions>();
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!transactionsByDate.has(date)) {
        transactionsByDate.set(date, []);
      }
      transactionsByDate.get(date)!.push(transaction);
    });

    // Generate daily data
    const data: SalesData[] = Array.from(transactionsByDate.entries()).map(([date, transactions]) => {
      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
      const totalOrders = transactions.length;
      const cashSales = transactions
        .filter(t => t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + t.total, 0);
      const mpesaSales = transactions
        .filter(t => t.paymentMethod === 'mpesa')
        .reduce((sum, t) => sum + t.total, 0);

      // Calculate top wines for this date
      const wineStats = new Map<string, { name: string; quantity: number; revenue: number }>();
      
      transactions.forEach(transaction => {
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

      return {
        date,
        totalSales,
        totalOrders,
        cashSales,
        mpesaSales,
        topWines
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate summary
    const totalRevenue = data.reduce((sum, day) => sum + day.totalSales, 0);
    const totalOrders = data.reduce((sum, day) => sum + day.totalOrders, 0);
    const totalCash = data.reduce((sum, day) => sum + day.cashSales, 0);
    const totalMpesa = data.reduce((sum, day) => sum + day.mpesaSales, 0);

    const summary = {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      cashPercentage: totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0,
      mpesaPercentage: totalRevenue > 0 ? (totalMpesa / totalRevenue) * 100 : 0
    };

    const report: SalesReport = {
      period: period as string,
      data,
      summary
    };

    // Return CSV format if requested
    if (format === 'csv') {
      const csv = generateCSV(report);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
      return res.status(200).send(csv);
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
}