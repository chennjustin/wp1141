import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionRepository } from "@/modules/transaction/repositories/transaction.repository";
import { subscriptionRepository } from "@/modules/subscription/repositories/subscription.repository";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Get last exchange rate for a currency in a wallet
 * 
 * Returns the last used rateToDefaultCurrency for the given currency in the wallet.
 * Checks both transactions and subscriptions.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    const currency = searchParams.get("currency");

    if (!walletId) {
      return NextResponse.json({ error: "walletId is required" }, { status: 400 });
    }

    if (!currency) {
      return NextResponse.json({ error: "currency is required" }, { status: 400 });
    }

    // Check wallet access
    const hasAccess = await transactionRepository.hasAccess(walletId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Wallet not found or access denied" }, { status: 403 });
    }

    // Try to get last rate from subscriptions first, then transactions
    const lastRate = await subscriptionRepository.findLastExchangeRateToDefaultCurrency(
      walletId,
      currency
    );

    return NextResponse.json({
      rateToDefaultCurrency: lastRate?.rateToDefaultCurrency ?? null,
    }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/transactions/last-rate] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

