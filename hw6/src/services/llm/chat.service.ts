import { LLMClient, LLMMessage } from "@/lib/llm/client";
import { OpenAIClient } from "@/lib/llm/openai";
import { handleLLMError, getFallbackResponse } from "@/lib/llm/fallback";
import { PromptService } from "./prompt.service";
import { Logger } from "@/lib/utils/logger";

export class ChatService {
  private llmClient: LLMClient;

  constructor() {
    try {
      this.llmClient = new OpenAIClient();
    } catch (error) {
      Logger.error("Failed to initialize LLM client", { error });
      throw error;
    }
  }

  async generateResponse(
    userMessage: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      console.log("📝 [ChatService] 開始生成回應");
      console.log("📝 [ChatService] User message:", userMessage);
      console.log("📝 [ChatService] History length:", history.length);
      
      const messages = PromptService.buildMessages(userMessage, history);
      
      console.log("📝 [ChatService] Built messages:", messages.length);
      console.log("📝 [ChatService] Messages:", JSON.stringify(messages, null, 2));
      
      Logger.debug("Building messages for LLM", {
        totalMessages: messages.length,
        systemMessage: messages[0]?.role === "system",
        historyMessages: messages.length - 2, // 减去 system 和当前 user message
        currentUserMessage: userMessage.substring(0, 50),
      });
      
      console.log("📞 [ChatService] 準備調用 LLM client");
      
      // 添加超時處理
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 秒超時
      });

      console.log("📞 [ChatService] 調用 this.llmClient.chat()");
      const responsePromise = this.llmClient.chat(messages);
      console.log("⏳ [ChatService] 等待 LLM 回應...");
      
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      console.log("✅ [ChatService] LLM 回應收到:", response);
      
      Logger.debug("LLM response generated", {
        responseLength: response.length,
        responsePreview: response.substring(0, 100),
      });
      
      return response;
    } catch (error) {
      console.error("❌ [ChatService] 生成回應失敗");
      console.error("❌ [ChatService] Error:", error);
      console.error("❌ [ChatService] Error message:", error instanceof Error ? error.message : String(error));
      console.error("❌ [ChatService] Error stack:", error instanceof Error ? error.stack : undefined);
      
      Logger.error("Failed to generate response", { 
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        userMessage: userMessage.substring(0, 50),
      });
      const errorMessage = handleLLMError(error);
      console.log("⚠️ [ChatService] 返回 fallback 回應:", errorMessage);
      return errorMessage;
    }
  }

  getWelcomeMessage(): string {
    return PromptService.getWelcomeMessage();
  }

  getHelpMessage(): string {
    return PromptService.getHelpMessage();
  }
}

