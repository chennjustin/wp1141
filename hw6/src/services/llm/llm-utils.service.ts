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
   */
  async parseDeadlineFromText(text: string): Promise<{
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

      const response = await this.llmClient.chat([
        {
          role: "system",
          content: "你是一個 JSON 解析器，只輸出有效的 JSON 格式。",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

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
}

