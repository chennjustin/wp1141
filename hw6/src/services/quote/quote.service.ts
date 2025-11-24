import { getQuoteForUser } from "@/lib/data/quotes";
import { Logger } from "@/lib/utils/logger";

export class QuoteService {
  /**
   * 取得每日金句（每次隨機抽卡，允許重複）
   */
  getDailyQuote(userId: string, date: Date = new Date()): string {
    try {
      const quote = getQuoteForUser(userId, date);
      Logger.info("取得每日金句", { userId, date: date.toISOString() });
      return quote;
    } catch (error) {
      Logger.error("取得每日金句失敗", { error, userId });
      return "今天也要加油！💪";
    }
  }
}

