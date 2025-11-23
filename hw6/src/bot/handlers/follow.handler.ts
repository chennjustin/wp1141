import { BotContext } from "@/types/bot";
import { buildMainMenuFlexMessage } from "@/lib/line/flex-messages";
import { LineMessagingClient } from "@/lib/line/client";
import { BotMessageService } from "@/services/bot-message/bot-message.service";
import { Logger } from "@/lib/utils/logger";

const lineClient = new LineMessagingClient();
const botMessageService = new BotMessageService();

export async function handleFollow(context: BotContext) {
  try {
    const userId = context.event.source.userId;
    const replyToken = context.event.replyToken;

    if (!replyToken) {
      Logger.warn("No replyToken in follow event");
      return;
    }

    // 發送主選單
    const menuMessage = buildMainMenuFlexMessage();
    await lineClient.sendFlexMessage(replyToken, menuMessage.altText, menuMessage.contents);
    
    if (userId) {
      await botMessageService.logMessage(userId, "outgoing", "主選單（歡迎訊息）", { type: "welcome" });
    }
  } catch (error) {
    Logger.error("處理關注事件時發生錯誤", { error });
    const replyToken = context.event.replyToken;
    if (replyToken) {
      try {
        await lineClient.sendTextMessage(replyToken, "歡迎使用拯救期末大作戰！");
      } catch (sendError) {
        Logger.error("無法發送歡迎訊息", { error: sendError });
      }
    }
  }
}

