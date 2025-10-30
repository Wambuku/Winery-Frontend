import { NextApiRequest, NextApiResponse } from 'next';

// Mock performance metrics generator
function generatePerformanceMetrics(timeRange: string) {
  const now = Date.now();
  let interval: number;
  let dataPoints: number;

  switch (timeRange) {
    case '1h':
      interval = 2 * 60 * 1000; // 2 minutes
      dataPoints = 30;
      break;
    case '6h':
      interval = 10 * 60 * 1000; // 10 minutes
      dataPoints = 36;
      break;
    case '24h':
      interval = 30 * 60 * 1000; // 30 minutes
      dataPoints = 48;
      break;
    case '7d':
      interval = 4 * 60 * 60 * 1000; // 4 hours
      dataPoints = 42;
      break;
    default:
      interval = 30 * 60 * 1000;
      dataPoints = 48;
  }

  const metrics = [];
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const timestamp = new Date(now - (i * interval)).toISOString();
    
    // Generate realistic performance data with some variation
    const baseResponseTime = 50;
    const responseTimeVariation = Math.sin(i * 0.1) * 20 + Math.random() * 10;
    const responseTime = Math.max(20, baseResponseTime + responseTimeVariation);
    
    const baseMemoryUsage = 65;
    const memoryVariation = Math.sin(i * 0.05) * 15 + Math.random() * 5;
    const memoryUsage = Math.max(40, Math.min(90, baseMemoryUsage + memoryVariation));
    
    const baseCpuUsage = 35;
    const cpuVariation = Math.sin(i * 0.08) * 25 + Math.random() * 10;
    const cpuUsage = Math.max(10, Math.min(80, baseCpuUsage + cpuVariation));
    
    // Active users vary by time of day (more users during business hours)
    const hour = new Date(timestamp).getHours();
    const isBusinessHours = hour >= 8 && hour <= 20;
    const baseUsers = isBusinessHours ? 25 : 8;
    const userVariation = Math.random() * 10;
    const activeUsers = Math.floor(baseUsers + userVariation);

    metrics.push({
      timestamp,
      responseTime: Math.round(responseTime),
      memoryUsage: Math.round(memoryUsage * 10) / 10,
      cpuUsage: Math.round(cpuUsage * 10) / 10,
      activeUsers,
    });
  }

  return metrics;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange = '24h' } = req.query;

    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Query your monitoring system for actual metrics
    // 3. Aggregate data based on the time range
    // 4. Return real performance data

    const metrics = generatePerformanceMetrics(timeRange as string);

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}