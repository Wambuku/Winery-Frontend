// M-Pesa payment callback handler

import { NextApiRequest, NextApiResponse } from 'next';

interface MPesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

interface PaymentMetadata {
  amount?: number;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST method is allowed' });
  }

  try {
    const callbackData: MPesaCallbackBody = req.body;
    const { stkCallback } = callbackData.Body;

    console.log('M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

    // Extract payment metadata
    const metadata: PaymentMetadata = {};
    
    if (stkCallback.CallbackMetadata?.Item) {
      stkCallback.CallbackMetadata.Item.forEach(item => {
        switch (item.Name) {
          case 'Amount':
            metadata.amount = Number(item.Value);
            break;
          case 'MpesaReceiptNumber':
            metadata.mpesaReceiptNumber = String(item.Value);
            break;
          case 'TransactionDate':
            metadata.transactionDate = String(item.Value);
            break;
          case 'PhoneNumber':
            metadata.phoneNumber = String(item.Value);
            break;
        }
      });
    }

    // Process the payment result
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      console.log('Payment successful:', {
        checkoutRequestId: stkCallback.CheckoutRequestID,
        merchantRequestId: stkCallback.MerchantRequestID,
        metadata,
      });

      // Here you would typically:
      // 1. Update the order status in your database
      // 2. Send confirmation email to customer
      // 3. Trigger any post-payment workflows
      
      // For now, we'll just log the success
      await updateOrderPaymentStatus(
        stkCallback.CheckoutRequestID,
        'completed',
        metadata
      );

    } else {
      // Payment failed or cancelled
      console.log('Payment failed:', {
        checkoutRequestId: stkCallback.CheckoutRequestID,
        resultCode: stkCallback.ResultCode,
        resultDesc: stkCallback.ResultDesc,
      });

      // Update order status to failed
      await updateOrderPaymentStatus(
        stkCallback.CheckoutRequestID,
        'failed',
        { error: stkCallback.ResultDesc }
      );
    }

    // Always respond with success to M-Pesa
    res.status(200).json({ 
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully' 
    });

  } catch (error) {
    console.error('M-Pesa callback processing error:', error);
    
    // Still respond with success to avoid M-Pesa retries
    res.status(200).json({ 
      ResultCode: 0,
      ResultDesc: 'Callback received' 
    });
  }
}

// Mock function to update order payment status
// In a real application, this would update your database
async function updateOrderPaymentStatus(
  checkoutRequestId: string,
  status: 'completed' | 'failed',
  metadata: PaymentMetadata | { error?: string }
): Promise<void> {
  try {
    // This is where you would update your database
    // For example:
    // await db.orders.update({
    //   where: { checkoutRequestId },
    //   data: { 
    //     paymentStatus: status,
    //     paymentMetadata: metadata,
    //     updatedAt: new Date()
    //   }
    // });

    console.log(`Order payment status updated:`, {
      checkoutRequestId,
      status,
      metadata,
    });

    // You might also want to send notifications here
    if (status === 'completed') {
      // Send success email/SMS
      console.log('Sending payment confirmation...');
    } else {
      // Send failure notification
      console.log('Sending payment failure notification...');
    }

  } catch (error) {
    console.error('Failed to update order payment status:', error);
    throw error;
  }
}