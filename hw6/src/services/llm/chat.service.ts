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
      // 構建訊息
      const messages = PromptService.buildMessages(userMessage, history);
      
      // 添加超時處理（30秒）
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout after 30s")), 30000);
      });

      // 調用 LLM
      const responsePromise = this.llmClient.chat(messages);
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      return response;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      Logger.error("生成回應失敗", { 
        error,
        errorMessage: errorMsg,
        userMessage: userMessage.substring(0, 50),
      });
      
      // 返回錯誤訊息
      const fallbackMessage = handleLLMError(error);
      return fallbackMessage;
    }
  }

  getWelcomeMessage(): string {
    return PromptService.getWelcomeMessage();
  }

  getHelpMessage(): string {
    return PromptService.getHelpMessage();
  }
}

