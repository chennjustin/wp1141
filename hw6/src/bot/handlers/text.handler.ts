import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { ConversationService } from "@/services/conversation/conversation.service";
import { Logger } from "@/lib/utils/logger";

// 延迟初始化，避免模块加载时环境变量未设置导致失败
let chatService: ChatService | null = null;
let conversationService: ConversationService | null = null;

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

function getConversationService(): ConversationService {
  if (!conversationService) {
    conversationService = new ConversationService();
  }
  return conversationService;
}

export async function handleText(context: BotContext) {
  const userId = context.event.source.userId;
  const text = context.event.message?.text;

  if (!userId || !text) {
    Logger.warn("Missing userId or text in event", { userId, text });
    return;
  }

  try {
    console.log("🎯 [handleText] 開始處理文本消息");
    console.log("🎯 [handleText] User ID:", userId);
    console.log("🎯 [handleText] Text:", text);
    
    console.log("🔧 [handleText] 獲取 ChatService...");
    const chatService = getChatService();
    console.log("✅ [handleText] ChatService 獲取成功");
    
    console.log("🔧 [handleText] 獲取 ConversationService...");
    const conversationService = getConversationService();
    console.log("✅ [handleText] ConversationService 獲取成功");

    // 處理特殊指令
    if (text === "幫助" || text === "help" || text === "說明") {
      console.log("ℹ️ [handleText] 處理幫助指令");
      const helpMessage = chatService.getHelpMessage();
      await context.sendText(helpMessage);
      return;
    }

    console.log("👤 [handleText] 獲取或創建使用者...");
    // 獲取或創建使用者
    const user = await conversationService.getOrCreateUser(userId);
    console.log("✅ [handleText] 使用者獲取成功:", user._id.toString());

    console.log("💬 [handleText] 獲取或創建對話...");
    // 獲取或創建對話
    const conversation = await conversationService.getOrCreateConversation(
      user._id.toString(),
      userId
    );
    console.log("✅ [handleText] 對話獲取成功:", conversation._id.toString());

    console.log("📚 [handleText] 獲取對話歷史...");
    // 先獲取對話歷史（不包含當前訊息）
    const history = await conversationService.getConversationHistory(
      conversation._id.toString()
    );
    console.log("✅ [handleText] 歷史獲取成功，長度:", history.length);

    Logger.debug("Conversation history", {
      conversationId: conversation._id.toString(),
      historyLength: history.length,
      lastMessage: history[history.length - 1]?.content?.substring(0, 50),
    });

    console.log("💾 [handleText] 保存使用者訊息...");
    // 保存使用者訊息
    await conversationService.saveMessage(
      conversation._id.toString(),
      "user",
      text
    );
    console.log("✅ [handleText] 使用者訊息保存成功");

    // 生成 AI 回應（傳入當前訊息和歷史）
    console.log("🤖 [handleText] 準備調用 LLM...");
    Logger.info("Calling LLM", {
      userId,
      messageLength: text.length,
      historyLength: history.length,
    });
    
    const response = await chatService.generateResponse(text, history);
    
    console.log("✅ [handleText] LLM 回應收到:", response);
    Logger.info("LLM response received", {
      userId,
      responseLength: response.length,
      responsePreview: response.substring(0, 100),
    });

    console.log("💾 [handleText] 保存 AI 回應...");
    // 保存 AI 回應
    await conversationService.saveMessage(
      conversation._id.toString(),
      "assistant",
      response
    );
    console.log("✅ [handleText] AI 回應保存成功");

    console.log("📤 [handleText] 發送回應給使用者...");
    // 發送回應
    await context.sendText(response);
    console.log("✅ [handleText] 回應發送成功");
  } catch (error) {
    Logger.error("處理文本消息時發生錯誤", { 
      error,
      userId,
      text,
    });
    await context.sendText("抱歉，處理您的訊息時發生錯誤，請稍後再試。");
  }
}

