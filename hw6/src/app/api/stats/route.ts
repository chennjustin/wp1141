import { NextResponse } from "next/server";
import { StatsService } from "@/services/stats/stats.service";
import { Logger } from "@/lib/utils/logger";

const statsService = new StatsService();

export async function GET() {
  try {
    const stats = await statsService.getStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error("Get stats error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

