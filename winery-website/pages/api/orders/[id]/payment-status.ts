import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../../types';
import { verifyToken } from '../../../../utils/auth';

type PaymentStatus = 'pending' | 'completed' | 'failed';

interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
}

interface UpdatePaymentStatusResponse {
  orderId: string;
  paymentStatus: PaymentStatus;
  updatedAt: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<UpdatePaymentStatusResponse>>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only PATCH method is allowed',
      },
    });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication token is required',
        },
      });
    }

    const user = verifyToken(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token',
        },
      });
    }

    // Check if user has staff or admin privileges
    if (user.role !== 'staff' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Staff or admin privileges required',
        },
      });
    }

    const { id } = req.query;
    const { status }: UpdatePaymentStatusRequest = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_ID',
          message: 'Valid order ID is required',
        },
      });
    }

    if (!status || !['pending', 'completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Payment status must be one of: pending, completed, failed',
        },
      });
    }

    // In a real application, this would update the database
    // For now, we'll simulate the update operation
    console.log(`Updating order ${id} payment status to ${status} by user ${user.id}`);

    // Simulate database update delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const updatedAt = new Date();

    return res.status(200).json({
      success: true,
      data: {
        orderId: id,
        paymentStatus: status,
        updatedAt,
      },
    });

  } catch (error) {
    console.error('Payment status update error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update payment status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}