import { NextRequest, NextResponse } from "next/server";
import { BotMessageService } from "@/services/bot-message/bot-message.service";
import { Logger } from "@/lib/utils/logger";

const botMessageService = new BotMessageService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const messageType = searchParams.get("messageType") as "incoming" | "outgoing" | undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    let messages;
    if (userId) {
      messages = await botMessageService.getMessagesByUser(userId, limit);
    } else {
      messages = await botMessageService.getAllRecentMessages(limit);
    }

    // 如果指定了 messageType，進行過濾
    if (messageType) {
      messages = messages.filter((msg) => msg.messageType === messageType);
    }

    // 將 Date 轉換為字符串
    const formattedMessages = messages.map((msg: any) => ({
      ...msg.toObject ? msg.toObject() : msg,
      timestamp: msg.timestamp instanceof Date 
        ? msg.timestamp.toISOString() 
        : typeof msg.timestamp === 'string' 
        ? msg.timestamp 
        : msg.timestamp 
        ? new Date(msg.timestamp).toISOString()
        : new Date().toISOString(),
      createdAt: msg.createdAt instanceof Date 
        ? msg.createdAt.toISOString() 
        : typeof msg.createdAt === 'string' 
        ? msg.createdAt 
        : msg.createdAt 
        ? new Date(msg.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: msg.updatedAt instanceof Date 
        ? msg.updatedAt.toISOString() 
        : typeof msg.updatedAt === 'string' 
        ? msg.updatedAt 
        : msg.updatedAt 
        ? new Date(msg.updatedAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    Logger.error("Get messages error", { error });
    return NextResponse.json(
      { success: false, error: "Failed to get messages" },
      { status: 500 }
    );
  }
}

