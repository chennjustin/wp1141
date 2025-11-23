import { BotContext } from "@/types/bot";
import { ChatService } from "@/services/llm/chat.service";
import { ConversationService } from "@/services/conversation/conversation.service";
import { CheckinService } from "@/services/checkin/checkin.service";
import { DeadlineService } from "@/services/deadline/deadline.service";
import { UserStateService } from "@/services/user-state/user-state.service";
import { BotMessageService } from "@/services/bot-message/bot-message.service";
import { LLMUtilsService } from "@/services/llm/llm-utils.service";
import { buildMainMenuFlexMessage, buildDeadlineListFlexMessage, buildDeadlineDetailFlexMessage } from "@/lib/line/flex-messages";
import { LineMessagingClient } from "@/lib/line/client";
import {
  handleAddDeadlineStepByStep,
  handleAddDeadlineNLP,
  handleConfirmNLPDeadline,
  handleEditDeadline,
  handleDeleteDeadline,
  handleMarkDeadlineDone,
} from "./deadline.handler";
import { Logger } from "@/lib/utils/logger";

const conversationService = new ConversationService();
const checkinService = new CheckinService();
const deadlineService = new DeadlineService();
const userStateService = new UserStateService();
const botMessageService = new BotMessageService();
const llmUtilsService = new LLMUtilsService();
const lineClient = new LineMessagingClient();

export async function handleText(context: BotContext) {
  const userId = context.event.source.userId;
  const text = context.event.message?.text;
  const replyToken = context.event.replyToken;

  if (!userId || !text || !replyToken) {
    Logger.warn("Missing userId, text, or replyToken in event", { userId, text, replyToken });
    return;
  }

  try {
    // 記錄所有 incoming 訊息
    await botMessageService.logMessage(userId, "incoming", text);

    // 檢查使用者是否在流程中
    const userState = await userStateService.getState(userId);

    // 處理取消或返回主選單（優先級最高）
    // 支援更寬鬆的匹配：包含「選單」、「menu」、「主選單」、「help」等關鍵字
    const normalizedText = text.toLowerCase().trim();
    const menuKeywords = ["選單", "menu", "主選單", "help", "幫助", "功能", "有什麼功能"];
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

    // 處理每日簽到（支援更寬鬆的匹配）
    if (
      text === "每日簽到" || 
      text === "簽到" ||
      text.includes("簽到")
    ) {
      await handleCheckIn(userId, replyToken);
      return;
    }

    // 處理今日占卜（支援更寬鬆的匹配）
    if (
      text === "今日占卜" || 
      text === "占卜" || 
      text === "運勢" ||
      text.includes("占卜") ||
      text.includes("運勢")
    ) {
      await handleFortune(userId, replyToken);
      return;
    }

    // 處理查看時程（支援更寬鬆的匹配）
    if (
      text === "查看時程" ||
      text.includes("時程") ||
      text.includes("deadline") ||
      text.includes("待辦")
    ) {
      await handleViewSchedule(userId, replyToken);
      return;
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
      await userStateService.setState(userId, "add_deadline_step", { step: "type" });
      await lineClient.sendQuickReply(
        replyToken,
        "請選擇 Deadline 類型：",
        [
          { label: "考試", text: "考試" },
          { label: "作業", text: "作業" },
          { label: "專題", text: "專題" },
          { label: "其他", text: "其他" },
        ]
      );
      return;
    }

    // 處理一句話輸入
    if (text === "一句話輸入") {
      await userStateService.setState(userId, "add_deadline_nlp", {});
      await lineClient.sendTextMessage(replyToken, "請直接輸入你的 Deadline 資訊，例如：\n「我下週四有 OS HW4，要交 pdf，大概要三小時」");
      return;
    }

    // 處理確認建立 NLP Deadline
    const confirmNLPMatch = text.match(/^確認建立 NLP (.+)$/);
    if (confirmNLPMatch) {
      await handleConfirmNLPDeadline(context, confirmNLPMatch[1]);
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

    // 處理流程中的輸入
    if (userState && userState.currentFlow) {
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
 * 發送主選單
 */
async function sendMainMenu(userId: string, replyToken: string) {
  const menuMessage = buildMainMenuFlexMessage();
  await lineClient.sendFlexMessage(replyToken, menuMessage.altText, menuMessage.contents);
  await botMessageService.logMessage(userId, "outgoing", "主選單", { type: "main_menu" });
}

/**
 * 處理每日簽到
 */
async function handleCheckIn(userId: string, replyToken: string) {
  try {
    const result = await checkinService.checkIn(userId);
    
    if (result.alreadyChecked) {
      const message = `你今天已經簽到過囉，連續簽到 ${result.consecutiveDays} 天`;
      await lineClient.sendTextMessage(replyToken, message);
      await botMessageService.logMessage(userId, "outgoing", message, { type: "checkin", alreadyChecked: true });
    } else {
      const quote = await llmUtilsService.generateMotivationQuote();
      const message = `✔ 今天已成功簽到！你已連續簽到 ${result.consecutiveDays} 天\n\n💬 今日金句：${quote}`;
      await lineClient.sendTextMessage(replyToken, message);
      await botMessageService.logMessage(userId, "outgoing", message, { type: "checkin", consecutiveDays: result.consecutiveDays });
    }

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
    Logger.error("處理簽到失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "簽到時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理今日占卜
 */
async function handleFortune(userId: string, replyToken: string) {
  try {
    const fortune = await llmUtilsService.generateFortune();
    await lineClient.sendTextMessage(replyToken, fortune);
    await botMessageService.logMessage(userId, "outgoing", fortune, { type: "fortune" });

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
    Logger.error("處理占卜失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "占卜時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理查看時程
 */
async function handleViewSchedule(userId: string, replyToken: string) {
  try {
    const deadlines = await deadlineService.getDeadlinesByUser(userId, "pending");
    
    // 取得應用程式 URL
    // 優先使用 NEXT_PUBLIC_APP_URL，如果沒有則嘗試 VERCEL_URL，最後使用 localhost
    let appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl && process.env.VERCEL_URL) {
      appUrl = `https://${process.env.VERCEL_URL}`;
    }
    if (!appUrl) {
      // 開發環境：如果使用 ngrok，應該在環境變數中設定 NEXT_PUBLIC_APP_URL
      appUrl = "http://localhost:3000";
    }
    const calendarUrl = `${appUrl}/calendar/${userId}`;
    
    // 建立包含 WebView 按鈕的 Flex Message
    const flexMessage = {
      type: "flex",
      altText: "查看時程表",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "📅 我的時程表",
              weight: "bold",
              size: "xl",
              color: "#1DB446",
              align: "center",
            },
            {
              type: "separator",
              margin: "md",
            },
            {
              type: "box",
              layout: "vertical",
              spacing: "sm",
              margin: "lg",
              contents: [
                {
                  type: "text",
                  text: deadlines.length === 0 
                    ? "目前沒有任何待辦事項 🌈" 
                    : `你有 ${deadlines.length} 個待辦事項`,
                  size: "md",
                  color: "#666666",
                  wrap: true,
                },
                {
                  type: "text",
                  text: "點擊下方按鈕開啟行事曆頁面查看詳細時程",
                  size: "sm",
                  color: "#999999",
                  wrap: true,
                  margin: "md",
                },
              ],
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "📅 開啟行事曆",
                uri: calendarUrl,
              },
              style: "primary",
              color: "#4ECDC4",
            },
          ],
        },
      },
    };

    await lineClient.sendFlexMessage(replyToken, flexMessage.altText, flexMessage.contents);
    await botMessageService.logMessage(userId, "outgoing", `查看時程（${deadlines.length} 個待辦）`, { 
      type: "schedule_list", 
      count: deadlines.length,
      calendarUrl 
    });

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
    await botMessageService.logMessage(userId, "outgoing", `查看 Deadline 詳情：${deadline.title}`, { type: "deadline_detail", deadlineId });
  } catch (error) {
    Logger.error("處理查看 Deadline 詳情失敗", { error, deadlineId });
    await lineClient.sendTextMessage(replyToken, "查看詳情時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理輸入 Deadline 提示
 */
async function handleAddDeadlinePrompt(userId: string, replyToken: string) {
  await lineClient.sendQuickReply(
    replyToken,
    "你想怎麼輸入？",
    [
      { label: "逐步填入", text: "逐步填入" },
      { label: "一句話輸入", text: "一句話輸入" },
    ]
  );
  await botMessageService.logMessage(userId, "outgoing", "輸入 Deadline 提示", { type: "add_deadline_prompt" });
}

/**
 * 處理預設聊天（原有的 LLM 功能）
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

    // 獲取或創建使用者
    const user = await conversationService.getOrCreateUser(userId);

    // 獲取或創建對話
    const conversation = await conversationService.getOrCreateConversation(
      user._id.toString(),
      userId
    );

    // 獲取對話歷史（不包含當前訊息）
    const history = await conversationService.getConversationHistory(
      conversation._id.toString()
    );

    // 保存使用者訊息
    await conversationService.saveMessage(
      conversation._id.toString(),
      "user",
      text
    );

    // 生成 AI 回應
    const response = await chatService.generateResponse(text, history);

    // 保存 AI 回應
    await conversationService.saveMessage(
      conversation._id.toString(),
      "assistant",
      response
    );

    // 記錄 outgoing 訊息
    await botMessageService.logMessage(userId, "outgoing", response, { type: "chat" });

    // 發送回應
    await lineClient.sendTextMessage(replyToken, response);
  } catch (error) {
    Logger.error("處理預設聊天失敗", { error, userId });
    await lineClient.sendTextMessage(replyToken, "處理訊息時發生錯誤，請稍後再試。");
  }
}

