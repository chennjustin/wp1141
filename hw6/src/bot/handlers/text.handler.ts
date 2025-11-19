import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { ConversationService } from "@/services/conversation/conversation.service";
import { Logger } from "@/lib/utils/logger";

const chatService = new ChatService();
const conversationService = new ConversationService();

export async function handleText(context: BotContext) {
  const userId = context.event.source.userId;
  const text = context.event.message?.text;

  if (!userId || !text) {
    Logger.warn("Missing userId or text in event", { userId, text });
    return;
  }

  try {
    // 處理特殊指令
    if (text === "幫助" || text === "help" || text === "說明") {
      const helpMessage = chatService.getHelpMessage();
      await context.sendText(helpMessage);
      return;
    }

    // 獲取或創建使用者
    const user = await conversationService.getOrCreateUser(userId);

    // 獲取或創建對話
    const conversation = await conversationService.getOrCreateConversation(
      user._id.toString(),
      userId
    );

    // 先獲取對話歷史（不包含當前訊息）
    const history = await conversationService.getConversationHistory(
      conversation._id.toString()
    );

    Logger.debug("Conversation history", {
      conversationId: conversation._id.toString(),
      historyLength: history.length,
      lastMessage: history[history.length - 1]?.content?.substring(0, 50),
    });

    // 保存使用者訊息
    await conversationService.saveMessage(
      conversation._id.toString(),
      "user",
      text
    );

    // 生成 AI 回應（傳入當前訊息和歷史）
    Logger.info("Calling LLM", {
      userId,
      messageLength: text.length,
      historyLength: history.length,
    });
    
    const response = await chatService.generateResponse(text, history);
    
    Logger.info("LLM response received", {
      userId,
      responseLength: response.length,
      responsePreview: response.substring(0, 100),
    });

    // 保存 AI 回應
    await conversationService.saveMessage(
      conversation._id.toString(),
      "assistant",
      response
    );

    // 發送回應
    await context.sendText(response);
  } catch (error) {
    Logger.error("Error handling text message", { error, userId, text });
    
    // 嘗試發送錯誤訊息，如果連發送都失敗則忽略
    try {
      await context.sendText("抱歉，處理訊息時發生錯誤，請稍後再試。");
    } catch (sendError) {
      Logger.error("Failed to send error message", { sendError });
    }
  }
}

