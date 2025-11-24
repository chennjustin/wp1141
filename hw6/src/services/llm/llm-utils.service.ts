import { OpenAIClient } from "@/lib/llm/openai";
import { Logger } from "@/lib/utils/logger";

export class LLMUtilsService {
  private llmClient: OpenAIClient;

  constructor() {
    this.llmClient = new OpenAIClient();
  }

  /**
   * 生成每日簽到的勵志語錄（毒雞湯風格）
   */
  async generateMotivationQuote(): Promise<string> {
    try {
      const prompt = `你是一個幽默的學長，專門給大學生打氣。請生成一句關於期末、作業或考試的勵志或毒雞湯語錄，要求：
1. 使用繁體中文
2. 長度 10-20 個字
3. 包含 1-2 個相關 emoji
4. 風格可以是鼓勵或幽默諷刺
5. 直接輸出語錄，不要其他說明文字

範例：
- "今天不努力，明天更努力 😂"
- "作業不會寫？沒關係，明天也不會 ✨"
- "期末考就像愛情，來得突然，走得也突然 💔"`;

      const response = await this.llmClient.chat([
        {
          role: "user",
          content: prompt,
        },
      ]);

      return response.trim();
    } catch (error) {
      Logger.error("生成勵志語錄失敗", { error });
      return "今天也要加油！💪";
    }
  }

  /**
   * 生成今日占卜
   */
  async generateFortune(): Promise<string> {
    try {
      const prompt = `你是一個幽默的占卜師，專門為壓力大的大學生占卜。請生成今日學業運勢，要求：
1. 使用繁體中文
2. 總長度 50-80 字
3. 包含以下內容：
   - 學業運勢分數（0-100%，用數字表示）
   - 今日建議行動（例如：整理筆記、完成一份作業、複習第一章）
   - 一句幽默毒雞湯風格的句子
4. 格式自由，但要清楚易讀
5. 直接輸出占卜結果，不要其他說明文字

範例格式：
"🔮 今日學業運勢：75%
建議行動：整理本週筆記
毒雞湯：作業不會因為你忽略它而消失，但 deadline 會 😅"`;

      const response = await this.llmClient.chat([
        {
          role: "user",
          content: prompt,
        },
      ]);

      return response.trim();
    } catch (error) {
      Logger.error("生成占卜失敗", { error });
      return "🔮 今日學業運勢：60%\n建議行動：保持平常心\n毒雞湯：船到橋頭自然直，但作業不會自己寫完 😊";
    }
  }

  /**
   * 從自然語言解析 Deadline 資訊
   * @param text 用戶輸入的文字
   * @param conversationHistory 可選的對話歷史記錄（最多保留最近 10 條）
   */
  async parseDeadlineFromText(
    text: string,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<{
    title: string;
    type: "exam" | "assignment" | "project" | "other";
    dueDate: string | null; // YYYY-MM-DD
    estimatedHours: number;
  } | null> {
    try {
      const prompt = `你是一個 deadline 解析器，專門解析台灣大學生的作業和考試資訊。

請從以下中文句子中提取資訊，並以 JSON 格式輸出：
{
  "title": "作業或考試名稱",
  "type": "exam" | "assignment" | "project" | "other",
  "dueDate": "YYYY-MM-DD" 或 null（如果無法確定日期），
  "estimatedHours": 數字（預估需要的小時數，如果沒有提到則預設為 2）
}

規則：
1. type 判斷：
   - 包含「考試」「期末」「期中考」「期末考」→ "exam"
   - 包含「作業」「HW」「報告」→ "assignment"
   - 包含「專題」「project」→ "project"
   - 其他 → "other"
2. dueDate 必須是 YYYY-MM-DD 格式，如果無法確定則設為 null
3. estimatedHours 如果沒有提到，預設為 2
4. 只輸出 JSON，不要其他文字

使用者輸入：${text}`;

      // 構建 messages，包含歷史記錄（如果有的話）
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: "你是一個 JSON 解析器，只輸出有效的 JSON 格式。",
        },
      ];

      // 加入歷史記錄（最多保留最近 10 條）
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // 加入當前用戶輸入
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await this.llmClient.chat(messages);

      // 嘗試解析 JSON
      const cleaned = response.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // 驗證必要欄位
      if (!parsed.title || !parsed.type) {
        return null;
      }

      // 驗證日期格式（如果存在）
      if (parsed.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate)) {
        parsed.dueDate = null;
      }

      // 確保 estimatedHours 是數字
      parsed.estimatedHours = parsed.estimatedHours || 2;
      if (typeof parsed.estimatedHours !== "number") {
        parsed.estimatedHours = 2;
      }

      return parsed;
    } catch (error) {
      Logger.error("解析 Deadline 失敗", { error, text });
      return null;
    }
  }

  /**
   * 從自然語言解析日期
   */
  async parseDateFromText(text: string): Promise<string | null> {
    try {
      const prompt = `請將以下中文日期描述轉換為 YYYY-MM-DD 格式的日期。

規則：
1. 如果提到「今天」「今日」→ 使用今天的日期
2. 如果提到「明天」「明日」→ 使用明天的日期
3. 如果提到「下週X」「下星期X」→ 計算下週對應的日期
4. 如果提到「X月X日」「X/X」→ 轉換為今年對應日期
5. 如果無法確定，返回 null
6. 只輸出 JSON 格式：{"dueDate": "YYYY-MM-DD"} 或 {"dueDate": null}
7. 不要輸出其他文字

使用者輸入：${text}

注意：今天是 ${new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Taipei" })}`;

      const response = await this.llmClient.chat([
        {
          role: "system",
          content: "你是一個日期解析器，只輸出有效的 JSON 格式。",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      // 嘗試解析 JSON
      const cleaned = response.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // 驗證日期格式
      if (parsed.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate)) {
        return parsed.dueDate;
      }

      return null;
    } catch (error) {
      Logger.error("解析日期失敗", { error, text });
      return null;
    }
  }

  /**
   * 在流程中理解用戶輸入並更新 Deadline 資料
   * 用於在新增 Deadline 流程中，當用戶輸入不符合當前步驟時，使用 LLM 理解並更新資料
   * @param text 用戶輸入的文字
   * @param currentStep 當前步驟（type/title/dueDate/estimatedHours）
   * @param existingData 已收集的資料
   * @param conversationHistory 對話歷史記錄
   */
  async understandAndUpdateDeadlineInFlow(
    text: string,
    currentStep: string,
    existingData: Record<string, any>,
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
  ): Promise<{
    updated: boolean;
    data?: Record<string, any>;
    message?: string;
  }> {
    try {
      const prompt = `你是一個 deadline 資料更新助手，正在幫助用戶新增一個 Deadline。

當前步驟：${currentStep}
已收集的資料：${JSON.stringify(existingData, null, 2)}

用戶剛剛說：「${text}」

請分析用戶的輸入，判斷：
1. 用戶是否在修正已收集的資料（例如：更正日期、修改標題等）？
2. 用戶是否在提供或更新某個欄位的資訊？
3. 用戶是否在詢問問題或聊天？

特別注意：
- 如果用戶提到「今天」「明天」「後天」等相對日期，請根據當前日期計算（今天是 ${new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Taipei" })}）
- 如果用戶在修正之前的資訊（例如：「不對，應該是...」「更正一下...」），請更新對應的欄位
- 如果用戶只提到日期相關資訊，請只更新 dueDate
- 如果用戶只提到標題相關資訊，請只更新 title

如果用戶在提供或修正資訊，請以 JSON 格式輸出更新的資料：
{
  "updated": true,
  "data": {
    "step": "下一步驟（如果資料完整則為 confirm，否則保持當前步驟）",
    "title": "標題（如果有提到或需要保留）",
    "type": "exam|assignment|project|other（如果有提到或需要保留）",
    "dueDate": "YYYY-MM-DD（如果有提到或需要保留）",
    "estimatedHours": 數字（如果有提到或需要保留）
  }
}

如果用戶在詢問或聊天，請輸出：
{
  "updated": false,
  "message": "提醒用戶當前需要填寫的資訊"
}

只輸出 JSON，不要其他文字。`;

      // 構建 messages，包含歷史記錄
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        {
          role: "system",
          content: "你是一個 JSON 解析器，只輸出有效的 JSON 格式。",
        },
      ];

      // 加入歷史記錄（最多保留最近 10 條）
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-10);
        for (const msg of recentHistory) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }

      // 加入當前提示
      messages.push({
        role: "user",
        content: prompt,
      });

      const response = await this.llmClient.chat(messages);

      // 嘗試解析 JSON
      const cleaned = response.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);

      return parsed;
    } catch (error) {
      Logger.error("理解流程中輸入失敗", { error, text, currentStep });
      return {
        updated: false,
        message: "我無法理解你的輸入，請按照提示填寫資訊。",
      };
    }
  }
}

