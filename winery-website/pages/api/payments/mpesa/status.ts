// M-Pesa payment status check API endpoint

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../types';

interface PaymentStatusResponse {
  orderId: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  amount?: number;
  timestamp?: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaymentStatusResponse>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
      },
    });
  }

  try {
    const { orderId, checkoutRequestId } = req.query;

    if (!orderId && !checkoutRequestId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETER',
          message: 'Either orderId or checkoutRequestId is required',
        },
      });
    }

    // In a real application, you would query your database here
    // For now, we'll simulate the response
    
    // Mock payment status check
    const mockPaymentStatus = await checkPaymentStatus(
      orderId as string || checkoutRequestId as string
    );

    return res.status(200).json({
      success: true,
      data: mockPaymentStatus,
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to check payment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

// Mock function to check payment status
// In a real application, this would query your database
async function checkPaymentStatus(identifier: string): Promise<PaymentStatusResponse> {
  // Simulate database lookup
  await new Promise(resolve => setTimeout(resolve, 100));

  // Mock response - in reality, this would come from your database
  return {
    orderId: identifier,
    paymentStatus: 'pending', // This would be the actual status from DB
    transactionId: undefined,
    amount: undefined,
    timestamp: new Date(),
  };
}