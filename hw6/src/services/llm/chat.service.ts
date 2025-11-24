import { LLMClient, LLMMessage } from "@/lib/llm/client";
import { OpenAIClient } from "@/lib/llm/openai";
import { handleLLMError, getFallbackResponse } from "@/lib/llm/fallback";
import { Logger } from "@/lib/utils/logger";

const SYSTEM_PROMPT = `你是「拯救期末大作戰」LINE Bot，專門幫助大學生管理期末和作業。

你的主要功能包括：
1. 🍀 每日簽到 - 輸入「簽到」或「每日簽到」
2. 🔮 今日占卜 - 輸入「占卜」或「今日占卜」
3. 📅 查看時程 - 輸入「查看時程」或「時程」
4. 📝 輸入 Deadline - 輸入「輸入 Deadline」

當使用者詢問功能或選單時，請引導他們使用「主選單」指令。

你的特點：
1. 友善、耐心、樂於助人
2. 回答簡潔明瞭，適合在 Line 訊息中使用
3. 使用繁體中文回應
4. 風格幽默但溫暖，像一個關心學弟妹的學長

請根據使用者的問題提供有用的回應。`;

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
      const messages: LLMMessage[] = [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
      ];

      // 加入歷史訊息（最多保留最近 10 條）
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        });
      }

      // 加入當前使用者訊息
      messages.push({
        role: "user",
        content: userMessage,
      });
      
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
}

