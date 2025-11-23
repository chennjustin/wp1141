import { BotContext } from "@/types/bot";
import { DeadlineService } from "@/services/deadline/deadline.service";
import { UserStateService } from "@/services/user-state/user-state.service";
import { LLMUtilsService } from "@/services/llm/llm-utils.service";
import { BotMessageService } from "@/services/bot-message/bot-message.service";
import { buildDeadlineDetailFlexMessage } from "@/lib/line/flex-messages";
import { LineMessagingClient } from "@/lib/line/client";
import { Logger } from "@/lib/utils/logger";
import User from "@/models/User";
import connectDB from "@/lib/db/mongoose";

const deadlineService = new DeadlineService();
const userStateService = new UserStateService();
const llmUtilsService = new LLMUtilsService();
const botMessageService = new BotMessageService();
const lineClient = new LineMessagingClient();

/**
 * 處理逐步輸入 Deadline 的流程
 */
export async function handleAddDeadlineStepByStep(
  context: BotContext,
  step: string,
  userInput: string
): Promise<void> {
  const userId = context.event.source.userId;
  const replyToken = context.event.replyToken;
  if (!userId || !replyToken) return;

  try {
    const state = await userStateService.getState(userId);
    if (!state || state.currentFlow !== "add_deadline_step") {
      return;
    }

    const flowData = (state.flowData || {}) as Record<string, any>;
    const currentStep = flowData.step || "type";

    // 處理取消或返回主選單
    if (userInput === "取消" || userInput === "主選單" || userInput === "menu") {
      await userStateService.clearState(userId);
      await context.sendText("已取消輸入。");
      return;
    }

    switch (currentStep) {
      case "type": {
        // 選擇類型
        const typeMap: Record<string, "exam" | "assignment" | "project" | "other"> = {
          考試: "exam",
          作業: "assignment",
          專題: "project",
          其他: "other",
        };

        const type = typeMap[userInput] || "other";
        await userStateService.updateFlowData(userId, {
          step: "title",
          type,
        });

        await context.sendText("請輸入 Deadline 的名稱：");
        break;
      }

      case "title": {
        // 輸入標題
        await userStateService.updateFlowData(userId, {
          step: "dueDate",
          title: userInput,
        });

        await context.sendText("請輸入截止日期（格式：YYYY/MM/DD 或 12/20）：");
        break;
      }

      case "dueDate": {
        // 解析日期
        let dueDate: Date | null = null;

        // 嘗試簡單解析
        const dateMatch = userInput.match(/(\d{1,2})\/(\d{1,2})/);
        if (dateMatch) {
          const month = parseInt(dateMatch[1]);
          const day = parseInt(dateMatch[2]);
          const year = new Date().getFullYear();
          dueDate = new Date(year, month - 1, day);
        } else {
          // 使用 LLM 解析
          const parsedDate = await llmUtilsService.parseDateFromText(userInput);
          if (parsedDate) {
            dueDate = new Date(parsedDate);
          }
        }

        if (!dueDate || isNaN(dueDate.getTime())) {
          await context.sendText("無法解析日期，請重新輸入（格式：YYYY/MM/DD 或 12/20）：");
          return;
        }

        await userStateService.updateFlowData(userId, {
          step: "estimatedHours",
          dueDate: dueDate.toISOString(),
        });

        await lineClient.sendQuickReply(
          replyToken,
          "請選擇預估時間（小時）：",
          [
            { label: "1 小時", text: "1" },
            { label: "2 小時", text: "2" },
            { label: "3 小時", text: "3" },
            { label: "4 小時", text: "4" },
            { label: "8 小時", text: "8" },
          ]
        );
        break;
      }

      case "estimatedHours": {
        // 輸入預估時間
        const hours = parseInt(userInput) || 2;

        await userStateService.updateFlowData(userId, {
          step: "confirm",
          estimatedHours: hours,
        });

        // 顯示確認資訊
        const summary = `請確認以下資訊：\n\n名稱：${flowData.title}\n類型：${flowData.type}\n截止日期：${new Date(flowData.dueDate).toLocaleDateString("zh-TW")}\n預估時間：${hours} 小時`;

        await lineClient.sendQuickReply(
          replyToken,
          summary,
          [
            { label: "確認", text: "確認建立" },
            { label: "取消", text: "取消" },
          ]
        );
        break;
      }

      case "confirm": {
        // 確認建立
        if (userInput === "確認建立") {
          await connectDB();
          const user = await User.findOne({ lineUserId: userId });
          if (!user) {
            await context.sendText("找不到使用者資訊，請重新開始。");
            await userStateService.clearState(userId);
            return;
          }

          const deadline = await deadlineService.createDeadline({
            userId,
            title: flowData.title,
            type: flowData.type,
            dueDate: new Date(flowData.dueDate),
            estimatedHours: flowData.estimatedHours || 2,
          });

          await userStateService.clearState(userId);
          await context.sendText(`✅ 已成功建立 Deadline：${deadline.title}`);
        } else {
          await userStateService.clearState(userId);
          await context.sendText("已取消建立。");
        }
        break;
      }
    }
  } catch (error) {
    Logger.error("處理逐步輸入 Deadline 失敗", { error, userId, step });
    await context.sendText("處理時發生錯誤，請稍後再試。");
    await userStateService.clearState(userId);
  }
}

/**
 * 處理一句話輸入 Deadline（NLP 解析）
 */
export async function handleAddDeadlineNLP(
  context: BotContext,
  userInput: string
): Promise<void> {
  const userId = context.event.source.userId;
  if (!userId) return;

  try {
    // 使用 LLM 解析
    const parsed = await llmUtilsService.parseDeadlineFromText(userInput);

    if (!parsed || !parsed.title) {
      const replyToken = context.event.replyToken;
      if (replyToken) {
        await lineClient.sendQuickReply(
          replyToken,
          "無法解析你的輸入，請改用逐步填入模式，或重新輸入更清楚的描述。",
          [
            { label: "逐步填入", text: "逐步填入" },
            { label: "主選單", text: "主選單" },
          ]
        );
      }
      return;
    }

    // 如果日期無法解析，提示使用者
    if (!parsed.dueDate) {
      const replyToken = context.event.replyToken;
      if (replyToken) {
        await lineClient.sendTextMessage(
          replyToken,
          "無法從你的描述中確定日期，請輸入日期（格式：YYYY/MM/DD 或 12/20）："
        );
      }
      // 儲存已解析的資料，等待日期輸入
      await userStateService.setState(userId, "add_deadline_step", {
        step: "dueDate",
        title: parsed.title,
        type: parsed.type,
        estimatedHours: parsed.estimatedHours,
      });
      return;
    }

    // 顯示確認資訊
    const dateStr = new Date(parsed.dueDate).toLocaleDateString("zh-TW");
    const summary = `我解析到以下資訊：\n\n名稱：${parsed.title}\n類型：${parsed.type}\n截止日期：${dateStr}\n預估時間：${parsed.estimatedHours} 小時`;

    const replyToken = context.event.replyToken;
    if (replyToken) {
      await lineClient.sendQuickReply(
        replyToken,
        summary,
        [
          { label: "確認", text: `確認建立 NLP ${parsed.title}|${parsed.type}|${parsed.dueDate}|${parsed.estimatedHours}` },
          { label: "重填", text: "輸入 Deadline" },
        ]
      );
    }
  } catch (error) {
    Logger.error("處理 NLP 輸入 Deadline 失敗", { error, userId });
    await context.sendText("處理時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理確認建立 Deadline（從 NLP 解析）
 */
export async function handleConfirmNLPDeadline(
  context: BotContext,
  dataString: string
): Promise<void> {
  const userId = context.event.source.userId;
  if (!userId) return;

  try {
    const [title, type, dueDateStr, estimatedHoursStr] = dataString.split("|");
    const dueDate = new Date(dueDateStr);
    const estimatedHours = parseInt(estimatedHoursStr) || 2;

    if (isNaN(dueDate.getTime())) {
      await context.sendText("日期格式錯誤，請重新輸入。");
      return;
    }

    await connectDB();
    const user = await User.findOne({ lineUserId: userId });
    if (!user) {
      await context.sendText("找不到使用者資訊，請重新開始。");
      return;
    }

    const deadline = await deadlineService.createDeadline({
      userId,
      title,
      type: type as any,
      dueDate,
      estimatedHours,
    });

    await context.sendText(`✅ 已成功建立 Deadline：${deadline.title}`);
  } catch (error) {
    Logger.error("確認建立 NLP Deadline 失敗", { error, userId });
    await context.sendText("建立時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理修改 Deadline
 */
export async function handleEditDeadline(
  context: BotContext,
  deadlineId: string,
  field?: string,
  newValue?: string
): Promise<void> {
  const userId = context.event.source.userId;
  if (!userId) return;

  try {
    const deadline = await deadlineService.getDeadlineById(deadlineId);
    if (!deadline) {
      await context.sendText("找不到這個 Deadline。");
      return;
    }

    // 檢查是否為該使用者的 Deadline
    await connectDB();
    const user = await User.findOne({ lineUserId: userId });
    if (!user || deadline.userId.toString() !== user._id.toString()) {
      await context.sendText("你沒有權限修改這個 Deadline。");
      return;
    }

    if (!field) {
      // 詢問要修改哪一項
      const replyToken = context.event.replyToken;
      if (replyToken) {
        await lineClient.sendQuickReply(
          replyToken,
          "你想修改哪一項？",
          [
            { label: "名稱", text: `修改 Deadline ${deadlineId} 名稱` },
            { label: "截止日期", text: `修改 Deadline ${deadlineId} 日期` },
            { label: "預估時間", text: `修改 Deadline ${deadlineId} 時間` },
            { label: "類別", text: `修改 Deadline ${deadlineId} 類別` },
          ]
        );
      }
      return;
    }

    // 處理修改
    if (field === "名稱" && newValue) {
      await deadlineService.updateDeadline(deadlineId, { title: newValue });
      await context.sendText(`✅ 已更新名稱：${newValue}`);
    } else if (field === "日期" && newValue) {
      const parsedDate = await llmUtilsService.parseDateFromText(newValue);
      if (!parsedDate) {
        await context.sendText("無法解析日期，請重新輸入。");
        return;
      }
      await deadlineService.updateDeadline(deadlineId, {
        dueDate: new Date(parsedDate),
      });
      await context.sendText(`✅ 已更新截止日期：${new Date(parsedDate).toLocaleDateString("zh-TW")}`);
    } else if (field === "時間" && newValue) {
      const hours = parseInt(newValue) || 2;
      await deadlineService.updateDeadline(deadlineId, { estimatedHours: hours });
      await context.sendText(`✅ 已更新預估時間：${hours} 小時`);
    } else if (field === "類別" && newValue) {
      const typeMap: Record<string, "exam" | "assignment" | "project" | "other"> = {
        考試: "exam",
        作業: "assignment",
        專題: "project",
        其他: "other",
      };
      const type = typeMap[newValue] || "other";
      await deadlineService.updateDeadline(deadlineId, { type });
      await context.sendText(`✅ 已更新類別：${newValue}`);
    } else {
      // 等待使用者輸入新值
      await userStateService.setState(userId, "edit_deadline", {
        deadlineId,
        field,
      });
      const replyToken = context.event.replyToken;
      if (replyToken) {
        await lineClient.sendTextMessage(replyToken, `請輸入新的${field}：`);
      }
    }
  } catch (error) {
    Logger.error("處理修改 Deadline 失敗", { error, userId, deadlineId });
    await context.sendText("處理時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理刪除 Deadline
 */
export async function handleDeleteDeadline(
  context: BotContext,
  deadlineId: string
): Promise<void> {
  const userId = context.event.source.userId;
  if (!userId) return;

  try {
    const deadline = await deadlineService.getDeadlineById(deadlineId);
    if (!deadline) {
      await context.sendText("找不到這個 Deadline。");
      return;
    }

    // 檢查是否為該使用者的 Deadline
    await connectDB();
    const user = await User.findOne({ lineUserId: userId });
    if (!user || deadline.userId.toString() !== user._id.toString()) {
      await context.sendText("你沒有權限刪除這個 Deadline。");
      return;
    }

    await deadlineService.deleteDeadline(deadlineId);
    await context.sendText(`✅ 已刪除 Deadline：${deadline.title}`);
  } catch (error) {
    Logger.error("處理刪除 Deadline 失敗", { error, userId, deadlineId });
    await context.sendText("刪除時發生錯誤，請稍後再試。");
  }
}

/**
 * 處理標記 Deadline 為完成
 */
export async function handleMarkDeadlineDone(
  context: BotContext,
  deadlineId: string
): Promise<void> {
  const userId = context.event.source.userId;
  if (!userId) return;

  try {
    const deadline = await deadlineService.getDeadlineById(deadlineId);
    if (!deadline) {
      await context.sendText("找不到這個 Deadline。");
      return;
    }

    // 檢查是否為該使用者的 Deadline
    await connectDB();
    const user = await User.findOne({ lineUserId: userId });
    if (!user || deadline.userId.toString() !== user._id.toString()) {
      await context.sendText("你沒有權限修改這個 Deadline。");
      return;
    }

    await deadlineService.markAsDone(deadlineId);
    await context.sendText(`✅ 已標記完成：${deadline.title}`);
  } catch (error) {
    Logger.error("處理標記 Deadline 完成失敗", { error, userId, deadlineId });
    await context.sendText("處理時發生錯誤，請稍後再試。");
  }
}

