import { NextResponse } from "next/server";

interface MpesaRequestBody {
  phoneNumber?: string;
  amount?: number;
  orderNumber?: string;
  attempt?: number;
}

const PROCESSING_DELAY_MS = 1200;

function validatePayload(body: MpesaRequestBody) {
  if (!body.phoneNumber || body.phoneNumber.trim().length < 10) {
    return "A valid M-Pesa phone number is required.";
  }
  if (typeof body.amount !== "number" || Number.isNaN(body.amount) || body.amount <= 0) {
    return "A valid payment amount is required.";
  }
  if (!body.orderNumber) {
    return "Missing order number.";
  }
  return null;
}

function createReference(): string {
  return `MPESA-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createTransactionId(): string {
  return `TW${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MpesaRequestBody;
    const validationError = validatePayload(body);
    if (validationError) {
      return NextResponse.json(
        {
          status: "failed",
          message: validationError,
        },
        { status: 400 }
      );
    }

    await new Promise((resolve) => {
      setTimeout(resolve, PROCESSING_DELAY_MS);
    });

    const attempt = typeof body.attempt === "number" ? body.attempt : 1;
    const baseSuccessRate = 0.82;
    const success = Math.random() < baseSuccessRate + Math.min(0.1 * (attempt - 1), 0.1);

    if (!success) {
      return NextResponse.json(
        {
          status: "failed",
          message: "M-Pesa could not process the payment at this time. Please retry shortly.",
          retryable: true,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        transactionId: createTransactionId(),
        reference: createReference(),
        amount: body.amount,
        orderNumber: body.orderNumber,
        phoneNumber: body.phoneNumber,
        processedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected M-Pesa processing error", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected payment error. Please try again later.",
      },
      { status: 500 }
    );
  }
}
