import { NextRequest, NextResponse } from "next/server";
import { ConversationService } from "@/services/conversation/conversation.service";
import { Logger } from "@/lib/utils/logger";

const conversationService = new ConversationService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await conversationService.getConversationById(
      params.id
    );

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    Logger.error("Get conversation error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get conversation" },
      { status: 500 }
    );
  }
}

