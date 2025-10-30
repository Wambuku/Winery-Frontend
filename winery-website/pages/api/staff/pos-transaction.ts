import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../utils/auth';

interface POSTransactionRequest {
  items: Array<{
    wine: {
      id: string;
      name: string;
      price: number;
    };
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  paymentMethod: 'cash' | 'mpesa';
  customerName?: string;
  customerPhone?: string;
  staffId: string;
  staffName: string;
}

interface POSTransactionResponse {
  success: boolean;
  transactionId: string;
  receiptNumber: string;
  timestamp: string;
}

// Mock storage - in a real app, this would be a database
const transactions: Array<POSTransactionRequest & { 
  id: string; 
  receiptNumber: string; 
  timestamp: string; 
}> = [];

function generateReceiptNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = date.getTime().toString().slice(-4);
  return `RCP-${dateStr}-${timeStr}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const transactionData: POSTransactionRequest = req.body;

    // Validate transaction data
    if (!transactionData.items || transactionData.items.length === 0) {
      return res.status(400).json({ error: 'No items in transaction' });
    }

    if (!transactionData.total || transactionData.total <= 0) {
      return res.status(400).json({ error: 'Invalid transaction total' });
    }

    if (!['cash', 'mpesa'].includes(transactionData.paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Verify total calculation
    const calculatedTotal = transactionData.items.reduce((sum, item) => sum + item.subtotal, 0);
    if (Math.abs(calculatedTotal - transactionData.total) > 0.01) {
      return res.status(400).json({ error: 'Total calculation mismatch' });
    }

    // Generate transaction ID and receipt number
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const receiptNumber = generateReceiptNumber();
    const timestamp = new Date().toISOString();

    // Store transaction (in a real app, this would be saved to database)
    const transaction = {
      ...transactionData,
      id: transactionId,
      receiptNumber,
      timestamp
    };
    transactions.push(transaction);

    // For M-Pesa transactions, you would typically:
    // 1. Initiate M-Pesa payment request
    // 2. Wait for confirmation
    // 3. Update transaction status
    // For this demo, we'll assume immediate success

    // Update inventory (in a real app)
    // This would decrease stock quantities for purchased items

    // Log the transaction for audit purposes
    console.log('POS Transaction processed:', {
      transactionId,
      receiptNumber,
      staffId: transactionData.staffId,
      total: transactionData.total,
      paymentMethod: transactionData.paymentMethod,
      itemCount: transactionData.items.length
    });

    const response: POSTransactionResponse = {
      success: true,
      transactionId,
      receiptNumber,
      timestamp
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('POS transaction error:', error);
    res.status(500).json({ error: 'Transaction processing failed' });
  }
}