import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";

const chatService = new ChatService();

export async function handleFollow(context: BotContext) {
  const welcomeMessage = chatService.getWelcomeMessage();
  await context.sendText(welcomeMessage);
}

