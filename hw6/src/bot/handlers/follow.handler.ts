import { BotContext } from "@/types/bot";
import { buildMainMenuFlexMessage } from "@/lib/line/flex-messages";
import { LineMessagingClient } from "@/lib/line/client";
import { Logger } from "@/lib/utils/logger";

const lineClient = new LineMessagingClient();

export async function handleFollow(context: BotContext) {
  try {
    const userId = context.event.source.userId;
    const replyToken = context.event.replyToken;

    if (!replyToken) {
      Logger.warn("No replyToken in follow event");
      return;
    }

    // 發送歡迎訊息
    const welcomeMessage = `🎉 歡迎使用「拯救期末大作戰」！

我是你的期末救星，專門幫助大學生管理 deadlines 和度過期末地獄 😊

📌 主要功能：
🍀 簽到 - 每日簽到，查看今天待辦事項
💬 每日金句 - 獲得一句鼓勵或毒雞湯
📅 查看時程 - 查看所有待辦事項
📝 新增 Deadline - 快速新增作業或考試

你可以：
• 使用底部的 Rich Menu 快速操作
• 用自然語言跟我對話，我會自動理解你的意圖
• 例如：「我要簽到」、「今天要幹嘛」、「我有一個作業下週三交」

準備好開始拯救你的期末了嗎？💪`;

    await lineClient.sendTextMessage(replyToken, welcomeMessage);

    // 發送主選單
    const menuMessage = buildMainMenuFlexMessage();
    await lineClient.sendFlexMessage(replyToken, menuMessage.altText, menuMessage.contents);
    
    if (userId) {
      Logger.info("發送歡迎訊息（主選單）", { userId });
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

