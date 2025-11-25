import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { CheckinService } from "@/services/checkin/checkin.service";
import { DeadlineService } from "@/services/deadline/deadline.service";
import { UserStateService } from "@/services/user-state/user-state.service";
import { LLMUtilsService } from "@/services/llm/llm-utils.service";
import { buildMainMenuFlexMessage, buildDeadlineDetailFlexMessage, buildScheduleViewFlexMessage } from "@/lib/line/flex-messages";
import { UserTokenService } from "@/services/user/user-token.service";
import { LineMessagingClient } from "@/lib/line/client";
import { QuoteService } from "@/services/quote/quote.service";
import { IntentService } from "@/services/llm/intent.service";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Deadline from "@/models/Deadline";
import Checkin from "@/models/Checkin";
import {
  handleAddDeadlineStepByStep,
  handleAddDeadlineNLP,
  handleConfirmNLPDeadline,
  handleEditDeadline,
  handleDeleteDeadline,
  handleMarkDeadlineDone,
} from "./deadline.handler";
import { Logger } from "@/lib/utils/logger";

const checkinService = new CheckinService();
const deadlineService = new DeadlineService();
const userStateService = new UserStateService();
const llmUtilsService = new LLMUtilsService();
const userTokenService = new UserTokenService();
const lineClient = new LineMessagingClient();
const quoteService = new QuoteService();
const intentService = new IntentService();

export async function handleText(context: BotContext) {
  const userId = context.event.source.userId;
  const text = context.event.message?.text;
  const replyToken = context.event.replyToken;

  if (!userId || !text || !replyToken) {
    Logger.warn("Missing userId, text, or replyToken in event", { userId, text, replyToken });
    return;
  }

  try {
    // 記錄 incoming 訊息（僅記錄到日誌）
    Logger.info("收到使用者訊息", { userId, text });

    // 檢查使用者是否在流程中
    const userState = await userStateService.getState(userId);

    // 處理取消或返回主選單（優先級最高）
    // 支援更寬鬆的匹配：包含「選單」、「menu」、「主選單」、「help」等關鍵字
    const normalizedText = text.toLowerCase().trim();
    const menuKeywords = ["選單", "menu", "主選單", "help", "幫助", "功能", "有什麼功能", "回到主選單", "返回主選單"];
    if (
      text === "取消" || 
      text === "主選單" || 
      normalizedText === "menu" || 
      normalizedText === "help" ||
      menuKeywords.some(keyword => text.includes(keyword))
    ) {
      if (userState && userState.currentFlow) {
        await userStateService.clearState(userId);
      }
      await sendMainMenu(userId, replyToken);
      return;
    }

    // 處理清除資料（測試功能，優先級最高）
    if (
      text === "清除資料" ||
      text === "清除所有" ||
      text === "reset" ||
      text === "重置" ||
      text.toLowerCase().includes("清除") ||
      text.toLowerCase() === "reset"
    ) {
      await handleResetData(userId, replyToken);
      return;
    }

    // 處理確認建立 NLP Deadline（優先於流程處理）
    const confirmNLPMatch = text.match(/^確認建立 NLP (.+)$/);
    if (confirmNLPMatch) {
      await handleConfirmNLPDeadline(context, confirmNLPMatch[1]);
      return;
    }

    // 處理流程中的輸入（優先於意圖識別）
    if (userState && userState.currentFlow) {
      // 在流程中，必須繼續流程處理，不能跳出
      if (userState.currentFlow === "add_deadline_step") {
        await handleAddDeadlineStepByStep(context, "", text);
        return;
      } else if (userState.currentFlow === "add_deadline_nlp") {
        await handleAddDeadlineNLP(context, text);
        return;
      } else if (userState.currentFlow === "edit_deadline") {
        const flowData = userState.flowData as Record<string, any>;
        const deadlineId = flowData.deadlineId;
        const field = flowData.field;
        await handleEditDeadline(context, deadlineId, field, text);
        // 清除狀態
        await userStateService.clearState(userId);
        return;
      }
    }

    // 處理明確的關鍵字匹配（保留以確保向後兼容）
    // 處理每日簽到（支援更寬鬆的匹配）
    if (
      text === "每日簽到" || 
      text === "簽到" ||
      text.includes("簽到")
    ) {
      await handleCheckIn(userId, replyToken);
      return;
    }


    // 處理每日金句（支援更寬鬆的匹配）
    if (
      text === "每日金句" ||
      text === "金句" ||
      text.includes("金句") ||
      text.includes("來一句") ||
      text.includes("我要金句")
    ) {
      await handleDailyQuote(userId, replyToken);
      return;
    }

    // 處理查看時程（支援更寬鬆的匹配）
    // 如果是從 Rich Menu 點擊「查看時程」，直接打開 WebView
    if (text === "查看時程") {
      await handleViewSchedule(userId, replyToken, text, "direct_open");
      return;
    }

    // 檢查是否包含時程相關關鍵字，交給 LLM 意圖識別處理
    const scheduleKeywords = [
      "時程", "行事曆", "deadline", "待辦", "行程", "schedule", "calendar",
      "有什麼事", "要做什麼", "要幹嘛", "有什麼作業", "有什麼考試",
      "要讀哪些", "要讀什麼", "打開行事曆", "開啟行事曆", "顯示行事曆",
      "我想看", "我要看", "給我看"
    ];
    
    if (scheduleKeywords.some(keyword => text.includes(keyword))) {
      // 交給 LLM 意圖識別處理，會自動判斷是 direct_open 還是 inquiry
      // 這裡先不處理，讓它繼續到意圖識別階段
    }

    // 處理查看 Deadline 詳情
    const viewDeadlineMatch = text.match(/^查看 Deadline (.+)$/);
    if (viewDeadlineMatch) {
      const deadlineId = viewDeadlineMatch[1];
      await handleViewDeadlineDetail(userId, deadlineId, replyToken);
      return;
    }

    // 處理輸入 Deadline
    if (text === "輸入 Deadline") {
      await handleAddDeadlinePrompt(userId, replyToken);
      return;
    }

    // 處理逐步填入
    if (text === "逐步填入") {
      // 清除之前的歷史記錄，開始新的流程
      await userStateService.clearConversationHistory(userId);
      await userStateService.setState(userId, "add_deadline_step", { step: "type" });
      const promptText = "請選擇 Deadline 類型：";
      await lineClient.sendQuickReply(
        replyToken,
        promptText,
        [
          { label: "考試", text: "考試" },
          { label: "作業", text: "作業" },
          { label: "專題", text: "專題" },
          { label: "其他", text: "其他" },
        ]
      );
      // 記錄 Bot 回應到歷史
      await userStateService.addToConversationHistory(userId, "assistant", promptText);
      return;
    }

    // 處理一句話輸入
    if (text === "一句話輸入") {
      // 清除之前的歷史記錄，開始新的流程
      await userStateService.clearConversationHistory(userId);
      await userStateService.setState(userId, "add_deadline_nlp", {});
      const promptText = "請直接輸入你的 Deadline 資訊，例如：\n「我下週四有 OS HW4，要交 pdf，大概要三小時」";
      await lineClient.sendTextMessage(replyToken, promptText);
      // 記錄 Bot 回應到歷史
      await userStateService.addToConversationHistory(userId, "assistant", promptText);
      return;
    }


    // 處理修改 Deadline
    const editDeadlineMatch = text.match(/^修改 Deadline (.+)$/);
    if (editDeadlineMatch) {
      const deadlineId = editDeadlineMatch[1];
      await handleEditDeadline(context, deadlineId);
      return;
    }

    // 處理修改 Deadline 特定欄位
    const editFieldMatch = text.match(/^修改 Deadline (.+) (名稱|日期|時間|類別)$/);
    if (editFieldMatch) {
      const deadlineId = editFieldMatch[1];
      const field = editFieldMatch[2];
      await handleEditDeadline(context, deadlineId, field);
      return;
    }

    // 處理標記完成
    const markDoneMatch = text.match(/^標記完成 (.+)$/);
    if (markDoneMatch) {
      const deadlineId = markDoneMatch[1];
      await handleMarkDeadlineDone(context, deadlineId);
      return;
    }

    // 處理刪除 Deadline
    const deleteDeadlineMatch = text.match(/^刪除 Deadline (.+)$/);
    if (deleteDeadlineMatch) {
      const deadlineId = deleteDeadlineMatch[1];
      await handleDeleteDeadline(context, deadlineId);
      return;
    }

    // LLM 意圖識別和路由（如果沒有匹配到明確關鍵字）
    try {
      const intentResult = await intentService.detectIntentAndExtract(text);
      
      // 根據意圖路由到對應處理器
      if (intentResult.confidence > 0.5) {
        switch (intentResult.intent) {
          case "check_in":
            await handleCheckIn(userId, replyToken);
            return;
          
          case "daily_quote":
            await handleDailyQuote(userId, replyToken);
            return;
          
          case "view_schedule":
            // 根據 actionType 決定處理方式
            const actionType = intentResult.actionType || "inquiry";
            await handleViewSchedule(userId, replyToken, text, actionType);
            return;
          
          case "add_deadline":
            // 如果有提取到實體，使用 NLP 模式
            if (intentResult.entities.title) {
              // 使用提取的實體建立 deadline
              await handleAddDeadlineFromIntent(userId, replyToken, intentResult.entities, text);
              return;
            } else {
              // 如果沒有提取到完整資訊，提示用戶使用逐步輸入
              await handleAddDeadlinePrompt(userId, replyToken);
              return;
            }
          
          case "other":
          default:
            // 繼續到預設 LLM 聊天
            break;
        }
      }
    } catch (error) {
      Logger.error("意圖識別失敗", { error, text });
      // 如果意圖識別失敗，繼續到預設 LLM 聊天
    }

    // 預設：使用原有的 LLM 聊天功能
    await handleDefaultChat(context, userId, text, replyToken);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    Logger.error("處理文本消息時發生錯誤", { 
      error,
      errorMessage: errorMsg,
      errorStack,
      userId,
      text,
    });

    // 發送錯誤訊息
    try {
      await lineClient.sendTextMessage(replyToken, `處理訊息時發生錯誤：${errorMsg}\n\n請稍後再試或聯繫管理員。`);
    } catch (sendError) {
      Logger.error("無法發送錯誤訊息", { error: sendError });
    }
  }
}

/**
 * 判斷是否為聊天內容（非流程相關的輸入）
 */
function isChatMessage(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  
  // 流程相關的關鍵字（這些應該繼續流程）
  const flowKeywords = [
    "考試", "作業", "專題", "其他",
    "1", "2", "3", "4", "8", // 預估時間選項
    "確認", "確認建立", "重填",
    "名稱", "日期", "時間", "類別",
  ];
  
  // 如果包含流程關鍵字，不是聊天內容
  if (flowKeywords.some(keyword => text.includes(keyword))) {
    return false;
  }
  
  // 如果是日期格式（YYYY/MM/DD 或 MM/DD），不是聊天內容
  if (/^\d{1,4}[\/\-]\d{1,2}[\/\-]?\d{0,4}$/.test(text)) {
    return false;
  }
  
  // 聊天內容的指標
  const chatIndicators = [
    "嗨", "你好", "哈囉", "hello", "hi",
    "謝謝", "感謝", "thank",
    "什麼", "怎麼", "為什麼", "如何",
    "串", "llm", "gpt", "ai",
    "？", "?", "！", "!",
  ];
  
  // 如果包含聊天指標，是聊天內容
  if (chatIndicators.some(indicator => normalizedText.includes(indicator))) {
    return true;
  }
  
  // 如果文字長度很短（1-3個字）且不是流程關鍵字，可能是聊天
  if (text.length <= 3 && !flowKeywords.some(keyword => text === keyword)) {
    return true;
  }
  
  // 預設：如果不在流程關鍵字中，視為聊天內容
  return true;
}

/**
 * 發送主選單
 */
async function sendMainMenu(userId: string, replyToken: string) {
  const menuMessage = buildMainMenuFlexMessage();
  await lineClient.sendFlexMessage(replyToken, menuMessage.altText, menuMessage.contents);
  Logger.info("發送主選單", { userId });
}

/**
 * 處理每日簽到
 */
async function handleCheckIn(userId: string, replyToken: string) {
  try {
    const result = await checkinService.checkIn(userId);
    
    // 取得今天的待辦事項
    const todayDeadlines = await deadlineService.getTodayDeadlines(userId);
    
    // 取得或創建 viewToken
    const viewToken = await userTokenService.getOrCreateViewToken(userId);
    
    // 取得應用程式 URL（改進邏輯，優先使用 VERCEL_URL）
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      // 在 Vercel 上，優先使用 VERCEL_URL（Vercel 自動提供的環境變數）
      if (process.env.VERCEL_URL) {
        // VERCEL_URL 可能已經包含 https://，也可能沒有，需要檢查
        const vercelUrl = process.env.VERCEL_URL;
        if (vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")) {
          appUrl = vercelUrl;
        } else {
          appUrl = `https://${vercelUrl}`;
        }
      } else {
        // 本地開發環境
        appUrl = "http://localhost:3000";
        Logger.warn("使用預設 localhost URL，請確認環境變數設定", { userId });
      }
    }
    
    // 確保 URL 沒有尾隨斜線，並且格式正確
    appUrl = appUrl.replace(/\/$/, "");
    // 確保 URL 是完整的（包含協議）
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      appUrl = `https://${appUrl}`;
    }

    if (result.alreadyChecked) {
      let message = `你今天已經簽到過囉，連續簽到 ${result.consecutiveDays} 天`;
      
      if (todayDeadlines.length > 0) {
        message += `\n\n📅 今天的待辦事項：\n`;
        todayDeadlines.forEach((deadline, index) => {
          const typeEmoji = deadline.type === "exam" ? "📝" : deadline.type === "assignment" ? "📄" : deadline.type === "project" ? "📦" : "📌";
          message += `${index + 1}. ${typeEmoji} ${deadline.title}\n`;
        });
      }
      
      await lineClient.sendTextMessage(replyToken, message);
      Logger.info("簽到回應（已簽到）", { userId, consecutiveDays: result.consecutiveDays, todayDeadlinesCount: todayDeadlines.length, appUrl });
    } else {
      const quote = await llmUtilsService.generateMotivationQuote();
      let message = `✔ 今天已成功簽到！你已連續簽到 ${result.consecutiveDays} 天\n\n💬 今日金句：${quote}`;
      
      if (todayDeadlines.length > 0) {
        message += `\n\n📅 今天的待辦事項：\n`;
        todayDeadlines.forEach((deadline, index) => {
          const typeEmoji = deadline.type === "exam" ? "📝" : deadline.type === "assignment" ? "📄" : deadline.type === "project" ? "📦" : "📌";
          message += `${index + 1}. ${typeEmoji} ${deadline.title}\n`;
        });
      } else {
        message += `\n\n📅 今天沒有任何待辦事項，可以好好休息！`;
      }
      
      await lineClient.sendTextMessage(replyToken, message);
      Logger.info("簽到回應（成功）", { userId, consecutiveDays: result.consecutiveDays, todayDeadlinesCount: todayDeadlines.length, appUrl });
    }

    // 發送時程表連結按鈕
    const scheduleMessage = buildScheduleViewFlexMessage(viewToken, appUrl, todayDeadlines.length);
    await lineClient.sendFlexMessage(replyToken, scheduleMessage.altText, scheduleMessage.contents);

    // 提供快速回覆
    await lineClient.sendQuickReply(
      replyToken,
      "",
      [
        { label: "主選單", text: "主選單" },
        { label: "查看時程", text: "查看時程" },
      ]
    );
  } catch (error) {
    // 記錄詳細錯誤資訊以便除錯
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    Logger.error("處理簽到失敗", { 
      error, 
      errorMessage, 
      errorStack,
      userId,
      env: {
        hasMongoDB: !!process.env.MONGODB_URI,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        vercelUrl: process.env.VERCEL_URL,
      }
    });
    await lineClient.sendTextMessage(replyToken, `簽到時發生錯誤：${errorMessage}\n\n請稍後再試或聯繫管理員。`);
  }
}


/**
 * 處理每日金句（從列表選擇）
 */
async function handleDailyQuote(userId: string, replyToken: string) {
  try {
    const quote = quoteService.getDailyQuote(userId);
    const message = `💬 今日金句：\n\n${quote}`;
    await lineClient.sendTextMessage(replyToken, message);
    Logger.info("發送每日金句", { userId });

    // 提供快速回覆
    await lineClient.sendQuickReply(
      replyToken,
      "",
      [
        { label: "主選單", text: "主選單" },
        { label: "查看時程", text: "查看時程" },
      ]
    );
  } catch (error) {
    Logger.error("處理每日金句失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "取得金句時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理查看時程
 * @param userId 用戶 ID
 * @param replyToken 回覆 Token
 * @param text 用戶輸入的文字（用於提取日期）
 * @param actionType 動作類型："direct_open" 直接打開頁面，"inquiry" 先回答再給按鈕
 */
async function handleViewSchedule(userId: string, replyToken: string, text?: string, actionType: "direct_open" | "inquiry" = "inquiry") {
  try {
    // 獲取或創建用戶的 viewToken
    const viewToken = await userTokenService.getOrCreateViewToken(userId);
    
    // 取得應用程式 URL（改進邏輯，優先使用 VERCEL_URL）
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      // 在 Vercel 上，優先使用 VERCEL_URL（Vercel 自動提供的環境變數）
      if (process.env.VERCEL_URL) {
        // VERCEL_URL 可能已經包含 https://，也可能沒有，需要檢查
        const vercelUrl = process.env.VERCEL_URL;
        if (vercelUrl.startsWith("http://") || vercelUrl.startsWith("https://")) {
          appUrl = vercelUrl;
        } else {
          appUrl = `https://${vercelUrl}`;
        }
      } else {
        // 本地開發環境
        appUrl = "http://localhost:3000";
        Logger.warn("使用預設 localhost URL，請確認環境變數設定", { userId });
      }
    }
    
    // 確保 URL 沒有尾隨斜線，並且格式正確
    appUrl = appUrl.replace(/\/$/, "");
    // 確保 URL 是完整的（包含協議）
    if (!appUrl.startsWith("http://") && !appUrl.startsWith("https://")) {
      appUrl = `https://${appUrl}`;
    }
    
    const scheduleUrl = `${appUrl}/schedule?token=${viewToken}`;
    
    Logger.info("使用應用程式 URL", { 
      appUrl, 
      scheduleUrl, 
      userId, 
      actionType, 
      env: { 
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, 
        VERCEL_URL: process.env.VERCEL_URL,
        NODE_ENV: process.env.NODE_ENV,
      } 
    });
    
    // 如果要求直接打開 WebView
    if (actionType === "direct_open") {
      // 發送一個包含 URI action 的訊息來打開 WebView
      await lineClient.sendMessages(replyToken, [
        {
          type: "template",
          altText: "打開時程表",
          template: {
            type: "buttons",
            text: "📅 正在打開你的時程表...",
            actions: [
              {
                type: "uri",
                label: "打開時程表",
                uri: scheduleUrl,
              },
            ],
          },
        },
      ]);
      Logger.info("發送打開 WebView 訊息", { userId, scheduleUrl });
      return;
    }
    
    // 如果是詢問式，先回答問題，再給按鈕
    
    // 如果提供了文字，嘗試提取日期
    let targetDate: string | null = null;
    if (text) {
      targetDate = await intentService.extractDateFromText(text);
    }
    
    // 獲取用戶的 deadlines
    let deadlines = await deadlineService.getDeadlinesByUser(userId, "pending");
    
    // 如果有指定日期，過濾該日期的 deadlines
    if (targetDate) {
      const targetDateObj = new Date(targetDate);
      targetDateObj.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      
      deadlines = deadlines.filter((deadline) => {
        const dueDate = deadline.dueDate instanceof Date 
          ? deadline.dueDate 
          : new Date(deadline.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= targetDateObj && dueDate < nextDay;
      });
      
      Logger.info("過濾日期 deadlines", { userId, targetDate, filteredCount: deadlines.length });
    }
    
    // 構建回應訊息
    let message = "";
    if (targetDate) {
      const dateFormatted = new Date(targetDate).toLocaleDateString("zh-TW", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      message = `📅 ${dateFormatted} 的待辦事項：\n\n`;
    } else {
      message = `📅 你的待辦事項：\n\n`;
    }
    
    if (deadlines.length === 0) {
      message += "目前沒有任何待辦事項 🌈";
    } else {
      deadlines.forEach((deadline, index) => {
        const typeEmoji = deadline.type === "exam" ? "📝" : deadline.type === "assignment" ? "📄" : deadline.type === "project" ? "📦" : "📌";
        const dueDate = deadline.dueDate instanceof Date 
          ? deadline.dueDate 
          : new Date(deadline.dueDate);
        const daysLeft = deadlineService.calculateDaysLeft(dueDate);
        const daysLeftText = daysLeft < 0 
          ? `已過期 ${Math.abs(daysLeft)} 天` 
          : daysLeft === 0 
          ? "今天截止" 
          : `剩餘 ${daysLeft} 天`;
        
        message += `${index + 1}. ${typeEmoji} ${deadline.title}\n   ${daysLeftText}\n`;
      });
    }
    
    await lineClient.sendTextMessage(replyToken, message);
    
    // 發送打開時程表的按鈕，並提示「詳細的行程在這邊」
    await lineClient.sendMessages(replyToken, [
      {
        type: "template",
        altText: "打開時程表",
        template: {
          type: "buttons",
          text: "📅 詳細的行程在這邊，點擊下方按鈕開啟時程表頁面查看完整資訊",
          actions: [
            {
              type: "uri",
              label: "📅 打開時程表",
              uri: scheduleUrl,
            },
          ],
        },
      },
    ]);
    
    Logger.info("發送時程表", { userId, deadlineCount: deadlines.length, targetDate, actionType });

    // 提供快速回覆
    await lineClient.sendQuickReply(
      replyToken,
      "",
      [
        { label: "主選單", text: "主選單" },
        { label: "輸入 Deadline", text: "輸入 Deadline" },
      ]
    );
  } catch (error) {
    Logger.error("處理查看時程失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "查看時程時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理查看 Deadline 詳情
 */
async function handleViewDeadlineDetail(userId: string, deadlineId: string, replyToken: string) {
  try {
    const deadline = await deadlineService.getDeadlineById(deadlineId);
    if (!deadline) {
      await lineClient.sendTextMessage(replyToken, "找不到這個 Deadline。");
      return;
    }

    const flexMessage = buildDeadlineDetailFlexMessage(deadline);
    await lineClient.sendFlexMessage(replyToken, flexMessage.altText, flexMessage.contents);
    Logger.info("發送 Deadline 詳情", { userId, deadlineId, title: deadline.title });
  } catch (error) {
    Logger.error("處理查看 Deadline 詳情失敗", { error, deadlineId });
    await lineClient.sendTextMessage(replyToken, "查看詳情時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理輸入 Deadline 提示
 */
async function handleAddDeadlinePrompt(userId: string, replyToken: string) {
  // 清除之前的歷史記錄，開始新的流程
  await userStateService.clearConversationHistory(userId);
  const promptText = "你想怎麼輸入？";
  await lineClient.sendQuickReply(
    replyToken,
    promptText,
    [
      { label: "逐步填入", text: "逐步填入" },
      { label: "一句話輸入", text: "一句話輸入" },
    ]
  );
  // 記錄 Bot 回應到歷史
  await userStateService.addToConversationHistory(userId, "assistant", promptText);
  Logger.info("發送輸入 Deadline 提示", { userId });
}

/**
 * 處理清除資料（測試功能）
 */
async function handleResetData(userId: string, replyToken: string) {
  try {
    await connectDB();
    const user = await User.findOne({ lineUserId: userId });
    if (!user) {
      await lineClient.sendTextMessage(replyToken, "找不到使用者資訊。");
      return;
    }

    // 刪除所有 deadlines
    const deadlineResult = await Deadline.deleteMany({ userId: user._id });
    
    // 刪除所有 checkins
    const checkinResult = await Checkin.deleteMany({ userId: user._id });
    
    // 清除用戶狀態
    await userStateService.clearState(userId);
    
    // 重置 viewToken
    const { generateViewToken } = await import("@/lib/utils/token");
    user.viewToken = generateViewToken();
    await user.save();

    const message = `✅ 資料已清除完成！\n\n` +
      `📝 待辦事項：刪除 ${deadlineResult.deletedCount || 0} 筆\n` +
      `🍀 簽到記錄：刪除 ${checkinResult.deletedCount || 0} 筆\n` +
      `🔄 用戶狀態：已清除\n` +
      `🔑 Token：已重置\n\n` +
      `你的帳號已恢復到初始狀態。`;
    
    await lineClient.sendTextMessage(replyToken, message);
    Logger.info("清除用戶資料成功", { userId });
  } catch (error) {
    Logger.error("清除資料失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "清除資料時發生錯誤，請稍後再試。");
  }
}

/**
 * 從意圖提取的實體建立 Deadline
 */
async function handleAddDeadlineFromIntent(
  userId: string,
  replyToken: string,
  entities: {
    date?: string | null;
    title?: string | null;
    estimatedHours?: number | null;
    type?: "exam" | "assignment" | "project" | "other" | null;
  },
  originalText: string
) {
  try {
    // 清除之前的歷史記錄，開始新的流程
    await userStateService.clearConversationHistory(userId);
    // 記錄用戶輸入到歷史
    await userStateService.addToConversationHistory(userId, "user", originalText);

    // 如果缺少必要資訊，使用 NLP 模式
    if (!entities.title) {
      await handleAddDeadlineNLP({ event: { source: { userId }, replyToken } } as BotContext, originalText);
      return;
    }

    // 如果缺少日期，提示用戶輸入
    if (!entities.date) {
      await userStateService.setState(userId, "add_deadline_step", {
        step: "dueDate",
        title: entities.title,
        type: entities.type || "other",
        estimatedHours: entities.estimatedHours || 2,
      });
      const promptText = `已解析到標題：${entities.title}\n\n請輸入截止日期（格式：YYYY/MM/DD 或 12/20）：`;
      await lineClient.sendTextMessage(replyToken, promptText);
      // 記錄 Bot 回應到歷史
      await userStateService.addToConversationHistory(userId, "assistant", promptText);
      return;
    }

    // 顯示確認資訊
    const dateStr = new Date(entities.date).toLocaleDateString("zh-TW");
    const typeName = entities.type === "exam" ? "考試" : entities.type === "assignment" ? "作業" : entities.type === "project" ? "專題" : "其他";
    const summary = `我解析到以下資訊：\n\n名稱：${entities.title}\n類型：${typeName}\n截止日期：${dateStr}\n預估時間：${entities.estimatedHours || 2} 小時`;

    await lineClient.sendQuickReply(
      replyToken,
      summary,
      [
        { label: "確認", text: `確認建立 NLP ${entities.title}|${entities.type || "other"}|${entities.date}|${entities.estimatedHours || 2}` },
        { label: "重填", text: "輸入 Deadline" },
      ]
    );
    // 記錄 Bot 回應到歷史
    await userStateService.addToConversationHistory(userId, "assistant", summary);
  } catch (error) {
    Logger.error("從意圖建立 Deadline 失敗", { error, userId, entities });
    await lineClient.sendTextMessage(replyToken, "處理時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理預設聊天（LLM 功能，不保存對話歷史）
 */
async function handleDefaultChat(context: BotContext, userId: string, text: string, replyToken: string) {
  try {
    // 初始化 ChatService
    let chatService: ChatService;
    try {
      chatService = new ChatService();
    } catch (initError) {
      const errorMsg = initError instanceof Error ? initError.message : String(initError);
      Logger.error("ChatService 初始化失敗", { error: initError });
      await lineClient.sendTextMessage(replyToken, `系統錯誤：${errorMsg}\n\n請檢查環境變數設定。`);
      return;
    }

    // 生成 AI 回應（不保存對話歷史）
    const response = await chatService.generateResponse(text, []);

    // 記錄回應
    Logger.info("發送 LLM 回應", { userId, textLength: text.length });

    // 發送回應
    await lineClient.sendTextMessage(replyToken, response);
  } catch (error) {
    Logger.error("處理預設聊天失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "處理訊息時發生錯誤，請稍後再試。");
  }
}

