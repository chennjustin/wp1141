import connectDB from "@/lib/db/mongoose";
import BotMessage, { IBotMessage, MessageType } from "@/models/BotMessage";
import { Logger } from "@/lib/utils/logger";

export class BotMessageService {
  /**
   * 記錄訊息
   */
  async logMessage(
    userId: string,
    type: MessageType,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    try {
      await connectDB();
      await BotMessage.create({
        userId,
        messageType: type,
        content,
        metadata: metadata || {},
        timestamp: new Date(),
      });
    } catch (error) {
      Logger.error("記錄訊息失敗", { error, userId, type });
      // 不拋出錯誤，避免影響主要流程
    }
  }

  /**
   * 取得使用者的訊息歷史
   */
  async getMessagesByUser(
    userId: string,
    limit: number = 50
  ): Promise<IBotMessage[]> {
    try {
      await connectDB();
      const messages = await BotMessage.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      return messages;
    } catch (error) {
      Logger.error("取得使用者訊息失敗", { error, userId });
      return [];
    }
  }

  /**
   * 取得所有最近的訊息
   */
  async getAllRecentMessages(limit: number = 100): Promise<IBotMessage[]> {
    try {
      await connectDB();
      const messages = await BotMessage.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .exec();
      return messages;
    } catch (error) {
      Logger.error("取得最近訊息失敗", { error });
      return [];
    }
  }
}

