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
      
      // 添加超時處理
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 秒超時
      });

      const responsePromise = this.llmClient.chat(messages);
      const response = await Promise.race([responsePromise, timeoutPromise]);
      
      return response;
    } catch (error) {
      Logger.error("Failed to generate response", { error });
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

