import { NextApiRequest, NextApiResponse } from 'next';

// Mock sales data generator
function generateMockSalesData(startDate: string, endDate: string, reportType: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const dailySales = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    
    // Generate random but realistic sales data
    const baseSales = 1000 + Math.random() * 2000;
    const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1;
    const sales = Math.round(baseSales * weekendMultiplier);
    const orders = Math.round(sales / (50 + Math.random() * 100));

    dailySales.push({
      date: date.toISOString().split('T')[0],
      sales,
      orders,
    });
  }

  const monthlySales = [
    { month: '2024-01', sales: 45000, orders: 450 },
    { month: '2024-02', sales: 52000, orders: 520 },
    { month: '2024-03', sales: 48000, orders: 480 },
    { month: '2024-04', sales: 55000, orders: 550 },
    { month: '2024-05', sales: 62000, orders: 620 },
    { month: '2024-06', sales: 58000, orders: 580 },
    { month: '2024-07', sales: 65000, orders: 650 },
    { month: '2024-08', sales: 70000, orders: 700 },
    { month: '2024-09', sales: 68000, orders: 680 },
    { month: '2024-10', sales: 72000, orders: 720 },
  ];

  const topProducts = [
    {
      id: '1',
      name: 'Château Margaux 2015',
      sales: 45,
      revenue: 22500,
      category: 'Red Wine',
    },
    {
      id: '2',
      name: 'Dom Pérignon 2012',
      sales: 38,
      revenue: 19000,
      category: 'Champagne',
    },
    {
      id: '3',
      name: 'Opus One 2018',
      sales: 32,
      revenue: 16000,
      category: 'Red Wine',
    },
    {
      id: '4',
      name: 'Caymus Cabernet 2020',
      sales: 28,
      revenue: 8400,
      category: 'Red Wine',
    },
    {
      id: '5',
      name: 'Silver Oak Alexander Valley 2019',
      sales: 25,
      revenue: 7500,
      category: 'Red Wine',
    },
  ];

  const salesByCategory = [
    { category: 'Red Wine', sales: 45000, percentage: 45 },
    { category: 'White Wine', sales: 25000, percentage: 25 },
    { category: 'Champagne', sales: 20000, percentage: 20 },
    { category: 'Rosé', sales: 7000, percentage: 7 },
    { category: 'Dessert Wine', sales: 3000, percentage: 3 },
  ];

  const customerMetrics = {
    totalCustomers: 1250,
    newCustomers: 85,
    returningCustomers: 165,
    averageOrderValue: 185.50,
  };

  const paymentMethods = [
    { method: 'mpesa', count: 450, percentage: 65 },
    { method: 'cash', count: 240, percentage: 35 },
  ];

  return {
    dailySales,
    monthlySales,
    topProducts,
    salesByCategory,
    customerMetrics,
    paymentMethods,
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, reportType } = req.query;

    // Validate parameters
    if (!startDate || !endDate || !reportType) {
      return res.status(400).json({ 
        error: 'startDate, endDate, and reportType are required' 
      });
    }

    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your database for actual sales data
    // 3. Apply date filtering and aggregation based on reportType
    // 4. Calculate metrics and analytics

    const salesData = generateMockSalesData(
      startDate as string,
      endDate as string,
      reportType as string
    );

    res.status(200).json(salesData);
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}