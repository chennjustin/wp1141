import { NextRequest, NextResponse } from "next/server";
import { ConversationService } from "@/services/conversation/conversation.service";
import { ConversationQuerySchema } from "@/lib/utils/validation";
import { Logger } from "@/lib/utils/logger";

const conversationService = new ConversationService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = {
      userId: searchParams.get("userId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const validatedQuery = ConversationQuerySchema.parse(query);

    const filters: {
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {};

    if (validatedQuery.userId) {
      filters.userId = validatedQuery.userId;
    }

    if (validatedQuery.startDate) {
      filters.startDate = new Date(validatedQuery.startDate);
    }

    if (validatedQuery.endDate) {
      filters.endDate = new Date(validatedQuery.endDate);
    }

    if (validatedQuery.search) {
      filters.search = validatedQuery.search;
    }

    const page = parseInt(validatedQuery.page || "1", 10);
    const limit = parseInt(validatedQuery.limit || "20", 10);

    const result = await conversationService.getConversations(
      filters,
      page,
      limit
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    Logger.error("Get conversations error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get conversations" },
      { status: 500 }
    );
  }
}

