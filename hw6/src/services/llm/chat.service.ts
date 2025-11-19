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
      const messages = PromptService.buildMessages(userMessage, history);
      
      Logger.debug("Building messages for LLM", {
        totalMessages: messages.length,
        systemMessage: messages[0]?.role === "system",
        historyMessages: messages.length - 2, // 减去 system 和当前 user message
        currentUserMessage: userMessage.substring(0, 50),
      });
      
      // 添加超時處理
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 秒超時
      });

      const responsePromise = this.llmClient.chat(messages);
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      Logger.debug("LLM response generated", {
        responseLength: response.length,
        responsePreview: response.substring(0, 100),
      });
      
      return response;
    } catch (error) {
      Logger.error("Failed to generate response", { 
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        userMessage: userMessage.substring(0, 50),
      });
      const errorMessage = handleLLMError(error);
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

