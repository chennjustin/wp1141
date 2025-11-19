import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { Logger } from "@/lib/utils/logger";

export async function handleFollow(context: BotContext) {
  try {
    const chatService = new ChatService();
    const welcomeMessage = chatService.getWelcomeMessage();
    await context.sendText(welcomeMessage);
  } catch (error) {
    Logger.error("處理關注事件時發生錯誤", { error });
    await context.sendText("歡迎使用 Line Bot！");
  }
}

