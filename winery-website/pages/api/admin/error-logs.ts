import { NextApiRequest, NextApiResponse } from 'next';

// Mock error logs data
let mockErrorLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    level: 'error' as const,
    message: 'Payment processing failed for order ORD-123',
    source: 'payment-service',
    stack: 'Error: M-Pesa API timeout\n    at processPayment (/api/payments/mpesa/initiate.ts:45)\n    at handlePayment (/api/orders/create.ts:120)',
    resolved: false,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    level: 'warning' as const,
    message: 'High response time detected on wine search endpoint',
    source: 'api-monitor',
    stack: undefined,
    resolved: true,
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    level: 'error' as const,
    message: 'Database connection pool exhausted',
    source: 'database',
    stack: 'Error: Connection pool exhausted\n    at Pool.connect (/lib/database.ts:25)\n    at fetchWines (/api/wines/index.ts:15)',
    resolved: true,
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    level: 'warning' as const,
    message: 'Low stock alert: Château Margaux 2015 (2 bottles remaining)',
    source: 'inventory-monitor',
    stack: undefined,
    resolved: false,
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    level: 'info' as const,
    message: 'Scheduled backup completed successfully',
    source: 'backup-service',
    stack: undefined,
    resolved: true,
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    level: 'error' as const,
    message: 'Failed to send order confirmation email',
    source: 'email-service',
    stack: 'Error: SMTP connection failed\n    at sendEmail (/lib/email.ts:30)\n    at sendOrderConfirmation (/api/orders/create.ts:150)',
    resolved: true,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange } = req.query;

    // Filter logs based on time range
    let filteredLogs = mockErrorLogs;
    
    if (timeRange) {
      const now = Date.now();
      let cutoffTime: number;

      switch (timeRange) {
        case '1h':
          cutoffTime = now - 60 * 60 * 1000;
          break;
        case '6h':
          cutoffTime = now - 6 * 60 * 60 * 1000;
          break;
        case '24h':
          cutoffTime = now - 24 * 60 * 60 * 1000;
          break;
        case '7d':
          cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        default:
          cutoffTime = now - 24 * 60 * 60 * 1000;
      }

      filteredLogs = mockErrorLogs.filter(log => 
        new Date(log.timestamp).getTime() >= cutoffTime
      );
    }

    // Sort by timestamp (newest first)
    const sortedLogs = filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    res.status(200).json(sortedLogs);
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}