import OpenAI from "openai";
import { LLMClient, LLMMessage } from "./client";
import { Logger } from "@/lib/utils/logger";

export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    const model = process.env.OPENAI_MODEL;
    if (!model) {
      throw new Error(
        "OPENAI_MODEL is not set in environment variables. Please add OPENAI_MODEL to your .env file"
      );
    }

    this.client = new OpenAI({
      apiKey,
    });
    this.model = model;
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    try {
      console.log("🚀 [OpenAI] 開始使用 OpenAI API");
      console.log("🚀 [OpenAI] Model:", this.model);
      console.log("🚀 [OpenAI] Messages count:", messages.length);
      console.log("🚀 [OpenAI] Messages:", JSON.stringify(messages, null, 2));
      
      Logger.debug("Calling OpenAI API", {
        model: this.model,
        messageCount: messages.length,
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 500,
      });

      console.log("✅ [OpenAI] API 使用成功");
      console.log("✅ [OpenAI] Response:", JSON.stringify(response, null, 2));

      const content = response.choices[0]?.message?.content;

      if (!content) {
        console.error("❌ [OpenAI] 回應中沒有內容");
        throw new Error("No content in OpenAI response");
      }

      console.log("✅ [OpenAI] Content:", content);
      console.log("✅ [OpenAI] Tokens used:", response.usage?.total_tokens);

      Logger.debug("OpenAI API success", {
        tokens: response.usage?.total_tokens,
      });

      return content;
    } catch (error) {
      console.error("❌ [OpenAI] API 使用失敗");
      console.error("❌ [OpenAI] Error:", error);
      console.error("❌ [OpenAI] Error message:", error instanceof Error ? error.message : String(error));
      console.error("❌ [OpenAI] Error stack:", error instanceof Error ? error.stack : undefined);
      
      Logger.error("OpenAI API call failed", { error });
      throw error;
    }
  }
}

