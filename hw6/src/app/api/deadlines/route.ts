import { NextRequest, NextResponse } from "next/server";
import { DeadlineService } from "@/services/deadline/deadline.service";
import { Logger } from "@/lib/utils/logger";

const deadlineService = new DeadlineService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const deadlines = await deadlineService.getDeadlinesByUser(userId, "pending");

    // 將 Date 轉換為字符串
    const formattedDeadlines = deadlines.map((deadline: any) => ({
      _id: deadline._id.toString(),
      title: deadline.title,
      type: deadline.type,
      dueDate: deadline.dueDate instanceof Date 
        ? deadline.dueDate.toISOString() 
        : typeof deadline.dueDate === 'string' 
        ? deadline.dueDate 
        : new Date(deadline.dueDate).toISOString(),
      estimatedHours: deadline.estimatedHours,
      status: deadline.status,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDeadlines,
    });
  } catch (error) {
    Logger.error("Get deadlines error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get deadlines" },
      { status: 500 }
    );
  }
}

