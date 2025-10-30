import { NextApiRequest, NextApiResponse } from 'next';

// Mock system health data
function generateSystemHealth() {
  const now = new Date().toISOString();
  
  return {
    api: {
      status: 'healthy' as const,
      responseTime: 45 + Math.random() * 20, // 45-65ms
      uptime: 0.9985, // 99.85% uptime
      lastCheck: now,
    },
    database: {
      status: 'healthy' as const,
      connectionCount: 12 + Math.floor(Math.random() * 8), // 12-20 connections
      queryTime: 15 + Math.random() * 10, // 15-25ms
      lastCheck: now,
    },
    payment: {
      status: 'healthy' as const,
      mpesaStatus: 'online' as const,
      lastTransaction: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
      successRate: 0.985 + Math.random() * 0.01, // 98.5-99.5%
    },
    storage: {
      status: 'healthy' as const,
      usedSpace: 45.2 + Math.random() * 5, // 45-50 GB used
      totalSpace: 100, // 100 GB total
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    },
  };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Check actual system health metrics
    // 3. Query monitoring services and databases
    // 4. Check external service status (M-Pesa API, etc.)

    const systemHealth = generateSystemHealth();

    res.status(200).json(systemHealth);
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}