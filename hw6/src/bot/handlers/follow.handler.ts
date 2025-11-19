import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { Logger } from "@/lib/utils/logger";

let chatService: ChatService | null = null;

function getChatService(): ChatService {
  if (!chatService) {
    try {
      chatService = new ChatService();
    } catch (error) {
      Logger.error("Failed to initialize ChatService", { error });
      throw error;
    }
  }
  return chatService;
}

export async function handleFollow(context: BotContext) {
  try {
    const chatService = getChatService();
    const welcomeMessage = chatService.getWelcomeMessage();
    await context.sendText(welcomeMessage);
  } catch (error) {
    Logger.error("Error in handleFollow", { error });
    await context.sendText("歡迎使用 Line Bot！");
  }
}

