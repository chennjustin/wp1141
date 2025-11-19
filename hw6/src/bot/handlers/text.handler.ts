import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { ConversationService } from "@/services/conversation/conversation.service";
import { Logger } from "@/lib/utils/logger";

const conversationService = new ConversationService();

export async function handleText(context: BotContext) {
  const userId = context.event.source.userId;
  const text = context.event.message?.text;

  if (!userId || !text) {
    Logger.warn("Missing userId or text in event", { userId, text });
    return;
  }

  try {
    // 初始化 ChatService
    let chatService: ChatService;
    try {
      chatService = new ChatService();
    } catch (initError) {
      const errorMsg = initError instanceof Error ? initError.message : String(initError);
      Logger.error("ChatService 初始化失敗", { error: initError });
      await context.sendText(`系統錯誤：${errorMsg}\n\n請檢查環境變數設定。`);
      return;
    }

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

    // 獲取對話歷史（不包含當前訊息）
    const history = await conversationService.getConversationHistory(
      conversation._id.toString()
    );

    // 保存使用者訊息
    await conversationService.saveMessage(
      conversation._id.toString(),
      "user",
      text
    );

    // 生成 AI 回應
    const response = await chatService.generateResponse(text, history);

    // 保存 AI 回應
    await conversationService.saveMessage(
      conversation._id.toString(),
      "assistant",
      response
    );

    // 發送回應
    await context.sendText(response);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    Logger.error("處理文本消息時發生錯誤", { 
      error,
      errorMessage: errorMsg,
      errorStack,
      userId,
      text,
    });

    // 發送錯誤訊息
    try {
      await context.sendText(`處理訊息時發生錯誤：${errorMsg}\n\n請稍後再試或聯繫管理員。`);
    } catch (sendError) {
      Logger.error("無法發送錯誤訊息", { error: sendError });
    }
  }
}

