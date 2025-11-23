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

  /**
   * 發送 Flex Message
   */
  async sendFlexMessage(
    replyToken: string,
    altText: string,
    contents: any
  ): Promise<void> {
    try {
      const response = await fetch(LINE_MESSAGING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [
            {
              type: "flex",
              altText,
              contents,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Line API error (Flex Message)", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Line API error: ${response.status} ${response.statusText}`);
      }

      Logger.debug("Successfully sent Flex Message", { replyToken });
    } catch (error) {
      Logger.error("Failed to send Flex Message", { error, replyToken });
      throw error;
    }
  }

  /**
   * 發送帶有快速回覆的文字訊息
   */
  async sendQuickReply(
    replyToken: string,
    text: string,
    items: Array<{ label: string; text: string }>
  ): Promise<void> {
    try {
      const response = await fetch(LINE_MESSAGING_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [
            {
              type: "text",
              text,
              quickReply: {
                items: items.map((item) => ({
                  type: "action",
                  action: {
                    type: "message",
                    label: item.label,
                    text: item.text,
                  },
                })),
              },
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        Logger.error("Line API error (Quick Reply)", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Line API error: ${response.status} ${response.statusText}`);
      }

      Logger.debug("Successfully sent Quick Reply", { replyToken });
    } catch (error) {
      Logger.error("Failed to send Quick Reply", { error, replyToken });
      throw error;
    }
  }

  /**
   * 發送多個訊息（支援混合類型）
   */
  async sendMessages(replyToken: string, messages: any[]): Promise<void> {
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
        Logger.error("Line API error (Multiple Messages)", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Line API error: ${response.status} ${response.statusText}`);
      }

      Logger.debug("Successfully sent messages", { replyToken, count: messages.length });
    } catch (error) {
      Logger.error("Failed to send messages", { error, replyToken });
      throw error;
    }
  }
}

