// M-Pesa payment initiation API endpoint

import { NextApiRequest, NextApiResponse } from 'next';
import { config } from '../../../../utils/config';
import { ApiResponse } from '../../../../types';
import { MPesaPaymentRequest, MPesaPaymentResponse } from '../../../../types/checkout';

interface MPesaSTKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

// Generate M-Pesa password
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  const data = shortcode + passkey + timestamp;
  return Buffer.from(data).toString('base64');
}

// Generate timestamp in the format required by M-Pesa
function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Get M-Pesa access token
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`).toString('base64');
  
  const response = await fetch(
    `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get M-Pesa access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Initiate STK Push
async function initiateSTKPush(accessToken: string, request: MPesaSTKPushRequest): Promise<any> {
  const response = await fetch(
    'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to initiate M-Pesa payment');
  }

  return response.json();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<MPesaPaymentResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    });
  }

  try {
    const { phoneNumber, amount, orderId, description }: MPesaPaymentRequest = req.body;

    // Validate required fields
    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Phone number, amount, and order ID are required',
        },
      });
    }

    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    if (!/^(\+254|254|0)[17]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Please provide a valid Kenyan phone number',
        },
      });
    }

    // Format phone number for M-Pesa (254XXXXXXXXX)
    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith('+254')) {
      formattedPhone = formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }

    // Validate amount
    if (amount < 1 || amount > 150000) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_AMOUNT',
          message: 'Amount must be between KSh 1 and KSh 150,000',
        },
      });
    }

    // Check if M-Pesa configuration is available
    if (!config.mpesa.consumerKey || !config.mpesa.consumerSecret || !config.mpesa.shortcode || !config.mpesa.passkey) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'MPESA_CONFIG_MISSING',
          message: 'M-Pesa configuration is not properly set up',
        },
      });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generatePassword(config.mpesa.shortcode, config.mpesa.passkey, timestamp);

    // Prepare STK Push request
    const stkPushRequest: MPesaSTKPushRequest = {
      BusinessShortCode: config.mpesa.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: config.mpesa.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.mpesa.callbackUrl || `${config.app.url}/api/payments/mpesa/callback`,
      AccountReference: orderId,
      TransactionDesc: description || `Payment for order ${orderId}`,
    };

    // Initiate STK Push
    const mpesaResponse = await initiateSTKPush(accessToken, stkPushRequest);

    // Check if the request was successful
    if (mpesaResponse.ResponseCode === '0') {
      return res.status(200).json({
        success: true,
        data: {
          success: true,
          checkoutRequestId: mpesaResponse.CheckoutRequestID,
          responseCode: mpesaResponse.ResponseCode,
          responseDescription: mpesaResponse.ResponseDescription,
          customerMessage: mpesaResponse.CustomerMessage,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MPESA_REQUEST_FAILED',
          message: mpesaResponse.ResponseDescription || 'M-Pesa request failed',
          details: mpesaResponse,
        },
      });
    }
  } catch (error) {
    console.error('M-Pesa initiation error:', error);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to initiate M-Pesa payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}