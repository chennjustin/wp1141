import { Logger } from "@/lib/utils/logger";

const LINE_MESSAGING_API_URL = "https://api.line.me/v2/bot/message/reply";

export class LineMessagingClient {
  private accessToken: string;

  constructor() {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
    }
    this.accessToken = token;
  }

  async replyMessage(replyToken: string, messages: Array<{ type: string; text: string }>): Promise<void> {
    try {
      const response = await fetch(LINE_MESSAGING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Line API error", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Line API error: ${response.status} ${response.statusText}`);
      }

      Logger.debug("Successfully sent reply", { replyToken });
    } catch (error) {
      Logger.error("Failed to send reply", { error, replyToken });
      throw error;
    }
  }

  async sendTextMessage(replyToken: string, text: string): Promise<void> {
    await this.replyMessage(replyToken, [
      {
        type: "text",
        text,
      },
    ]);
  }
}

