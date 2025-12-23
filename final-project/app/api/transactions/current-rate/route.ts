import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Get current exchange rate from external API
 * 
 * Fetches the current exchange rate from a free public API.
 * Uses exchangerate-api.io (free tier) which doesn't require API key.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromCurrency = searchParams.get("from");
    const toCurrency = searchParams.get("to");

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: "from and to currency parameters are required" },
        { status: 400 }
      );
    }

    // If same currency, return 1
    if (fromCurrency === toCurrency) {
      return NextResponse.json({
        rate: 1,
        from: fromCurrency,
        to: toCurrency,
      }, { status: 200 });
    }

    // Use exchangerate-api.io free tier (no API key required)
    // This API provides real-time exchange rates
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (!response.ok) {
        throw new Error(`Exchange rate API returned ${response.status}`);
      }

      const data = await response.json();
      const rate = data.rates?.[toCurrency];

      if (!rate) {
        return NextResponse.json(
          { error: `Exchange rate not found for ${fromCurrency} to ${toCurrency}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        rate,
        from: fromCurrency,
        to: toCurrency,
        date: data.date || new Date().toISOString().split('T')[0],
      }, { status: 200 });
    } catch (apiError) {
      console.error("[GET /api/transactions/current-rate] Exchange rate API error:", apiError);
      
      // Fallback: try alternative API (fixer.io free tier via exchangerate.host)
      try {
        const fallbackResponse = await fetch(
          `https://api.exchangerate.host/latest?base=${fromCurrency}&symbols=${toCurrency}`,
          {
            next: { revalidate: 3600 },
          }
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const rate = fallbackData.rates?.[toCurrency];

          if (rate) {
            return NextResponse.json({
              rate,
              from: fromCurrency,
              to: toCurrency,
              date: fallbackData.date || new Date().toISOString().split('T')[0],
            }, { status: 200 });
          }
        }
      } catch (fallbackError) {
        console.error("[GET /api/transactions/current-rate] Fallback API error:", fallbackError);
      }

      return NextResponse.json(
        { error: "Failed to fetch current exchange rate" },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("[GET /api/transactions/current-rate] Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

