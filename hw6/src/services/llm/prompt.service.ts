import { LLMMessage } from "@/lib/llm/client";
import { MAX_CONTEXT_MESSAGES } from "@/lib/constants";

const SYSTEM_PROMPT = `你是一個友善的 AI 個人小幫手，專門幫助使用者處理日常事務。你的特點：
1. 友善、耐心、樂於助人
2. 能夠協助資訊整理、記錄、搜尋和問題回應
3. 回答簡潔明瞭，適合在 Line 訊息中使用
4. 使用繁體中文回應
5. 如果遇到無法處理的問題，誠實告知並提供替代建議

請根據使用者的問題提供有用的回應。`;

export class PromptService {
  static buildSystemMessage(): LLMMessage {
    return {
      role: "system",
      content: SYSTEM_PROMPT,
    };
  }

  static buildMessages(
    userMessage: string,
    history: Array<{ role: string; content: string }>
  ): LLMMessage[] {
    const messages: LLMMessage[] = [this.buildSystemMessage()];

    // 加入歷史訊息（最多保留最近 N 條）
    const recentHistory = history.slice(-MAX_CONTEXT_MESSAGES);
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

    return messages;
  }

  static getWelcomeMessage(): string {
    return `👋 你好！我是你的 AI 個人小幫手。

我可以協助你：
📝 資訊整理與記錄
🔍 問題搜尋與回應
💡 提供建議與想法

有什麼我可以幫你的嗎？`;
  }

  static getHelpMessage(): string {
    return `📚 使用說明：

你可以直接問我任何問題，例如：
• "幫我記錄今天的待辦事項"
• "查詢天氣資訊"
• "解釋某個概念"
• "給我一些建議"

我會盡力協助你！`;
  }
}

