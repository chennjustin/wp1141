import OpenAI from "openai";
import { LLMClient, LLMMessage } from "./client";
import { DEFAULT_LLM_MODEL } from "@/lib/constants";
import { handleLLMError } from "./fallback";
import { Logger } from "@/lib/utils/logger";

export class OpenAIClient implements LLMClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    this.client = new OpenAI({
      apiKey,
    });
    this.model = process.env.OPENAI_MODEL || DEFAULT_LLM_MODEL;
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    try {
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

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      Logger.debug("OpenAI API success", {
        tokens: response.usage?.total_tokens,
      });

      return content;
    } catch (error) {
      Logger.error("OpenAI API call failed", { error });
      throw error;
    }
  }
}

