import { getQuoteForUser } from "@/lib/data/quotes";
import { Logger } from "@/lib/utils/logger";

export class QuoteService {
  /**
   * 取得每日金句（根據用戶 ID 和日期）
   * 確保同一天同一用戶看到相同金句
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

