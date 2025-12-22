/**
 * Cron Job API Route: Add Transaction from Subscriptions
 * 
 * This route should be called periodically (e.g., daily) to check for
 * subscriptions that are due and create transactions automatically.
 * 
 * Usage:
 * - Vercel Cron: Add to vercel.json
 * - External Cron: Call this endpoint daily
 * - Manual: Call GET /api/cron/add-transaction
 */

import { NextResponse } from "next/server";
import { addTransactionFromSubscriptions } from "@/modules/subscription/services/add-transaction.service";

export async function GET() {
  try {
    // Optional: Add authentication/authorization here
    // For example, check for a secret token in headers
    // const authHeader = request.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const results = await addTransactionFromSubscriptions();

    return NextResponse.json({
      success: true,
      message: "Subscription transactions processed",
      results,
    });
  } catch (error) {
    console.error("[GET /api/cron/add-transaction] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export async function POST() {
  return GET();
}

