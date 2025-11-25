import connectDB from "@/lib/db/mongoose";
import { IDeadline } from "@/models/Deadline";
import { IStudyBlock } from "@/models/StudyBlock";
import StudyBlock from "@/models/StudyBlock";
import User from "@/models/User";
import { Logger } from "@/lib/utils/logger";
import mongoose from "mongoose";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// 排程規則配置
const SCHEDULE_CONFIG = {
  // 禁止時段（小時）
  FORBIDDEN_HOURS: [
    { start: 0, end: 8 }, // 00:00-08:00
    { start: 23, end: 24 }, // 23:00-24:00
  ],
  // 晚餐時段（可選）
  DINNER_HOURS: { start: 18, end: 19 }, // 18:00-19:00
  // 睡覺時段（僅允許 1hr block）
  SLEEP_HOURS: { start: 21, end: 23 }, // 21:00-23:00
  // 每天最大讀書時間（小時）
  MAX_HOURS_PER_DAY: 4,
  // 每天最多 blocks 數量
  MAX_BLOCKS_PER_DAY: 2,
};

export interface ScheduleResult {
  blocks: Array<{
    userId: mongoose.Types.ObjectId;
    deadlineId: mongoose.Types.ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    title: string;
    blockIndex: number;
    totalBlocks: number;
    status: "pending";
  }>;
  warning?: string; // 時間不足的警告訊息
}

export class SmartSchedulerService {
  /**
   * 為一個 Deadline 自動排程
   */
  async scheduleDeadline(deadline: IDeadline, userId: string): Promise<ScheduleResult> {
    try {
      await connectDB();

      // 取得使用者資訊
      const user = await User.findById(deadline.userId);
      if (!user) {
        throw new Error("User not found");
      }

      const estimatedHours = deadline.estimatedHours;
      const dueDate = dayjs(deadline.dueDate).tz("Asia/Taipei");
      const now = dayjs().tz("Asia/Taipei");

      // STEP 1: 計算可用時間區間（使用 user._id 而不是 lineUserId）
      const availableSlots = await this.calculateAvailableSlots(
        user._id.toString(),
        now.toDate(),
        dueDate.toDate()
      );

      // STEP 2: 拆分任務
      const blockDurations = this.splitTask(estimatedHours);

      // STEP 3: 往前回推排程
      const scheduledBlocks = this.scheduleBlocks(
        deadline,
        blockDurations,
        availableSlots,
        dueDate,
        now
      );

      // STEP 4: 檢查時間是否足夠
      const totalScheduledHours = scheduledBlocks.reduce((sum, block) => sum + block.duration, 0);
      let warning: string | undefined;

      if (totalScheduledHours < estimatedHours) {
        warning = `⚠️ 你這份作業需要 ${estimatedHours} 小時，但從現在到截止日剩 ${totalScheduledHours} 小時的可排時間。我幫你排了 ${totalScheduledHours} 小時，其餘部分請手動調整或重新分配 🙏`;
      }

      return {
        blocks: scheduledBlocks,
        warning,
      };
    } catch (error) {
      Logger.error("排程失敗", { error, deadlineId: deadline._id });
      throw error;
    }
  }

  /**
   * 計算可用時間區間
   */
  private async calculateAvailableSlots(
    userId: string, // ObjectId string
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, boolean[]>> {
    // 取得該使用者在此時間範圍內的所有 blocks
    const existingBlocks = await StudyBlock.find({
      userId: userId,
      startTime: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();

    // 建立可用時間地圖：date -> hour[] (true = 可用, false = 不可用)
    const availableSlots = new Map<string, boolean[]>();
    const start = dayjs(startDate).tz("Asia/Taipei");
    const end = dayjs(endDate).tz("Asia/Taipei");

    let current = start.startOf("day");
    while (current.isBefore(end) || current.isSame(end, "day")) {
      const dateKey = current.format("YYYY-MM-DD");
      const hours = new Array(24).fill(true);

      // 標記禁止時段
      SCHEDULE_CONFIG.FORBIDDEN_HOURS.forEach(({ start: hStart, end: hEnd }) => {
        for (let h = hStart; h < hEnd; h++) {
          hours[h] = false;
        }
      });

      // 標記今天已過的時間
      if (current.isSame(dayjs().tz("Asia/Taipei"), "day")) {
        const currentHour = dayjs().tz("Asia/Taipei").hour();
        for (let h = 0; h <= currentHour; h++) {
          hours[h] = false;
        }
      }

      // 標記已存在的 blocks
      existingBlocks.forEach((block) => {
        const blockDate = dayjs(block.startTime).tz("Asia/Taipei");
        if (blockDate.isSame(current, "day")) {
          const blockStartHour = blockDate.hour();
          const blockEndHour = dayjs(block.endTime).tz("Asia/Taipei").hour();
          for (let h = blockStartHour; h < blockEndHour; h++) {
            hours[h] = false;
          }
        }
      });

      availableSlots.set(dateKey, hours);
      current = current.add(1, "day");
    }

    return availableSlots;
  }

  /**
   * 拆分任務
   */
  private splitTask(totalHours: number): number[] {
    if (totalHours <= 2) {
      return [totalHours];
    } else if (totalHours <= 4) {
      return [2, totalHours - 2];
    } else if (totalHours <= 8) {
      // 拆成多個 2hr blocks
      const blocks: number[] = [];
      let remaining = totalHours;
      while (remaining > 0) {
        blocks.push(Math.min(2, remaining));
        remaining -= 2;
      }
      return blocks;
    } else {
      // > 8hr: 每段最多 2hr，分散多天
      const blocks: number[] = [];
      let remaining = totalHours;
      while (remaining > 0) {
        blocks.push(Math.min(2, remaining));
        remaining -= 2;
      }
      return blocks;
    }
  }

  /**
   * 往前回推排程
   */
  private scheduleBlocks(
    deadline: IDeadline,
    blockDurations: number[],
    availableSlots: Map<string, boolean[]>,
    dueDate: dayjs.Dayjs,
    now: dayjs.Dayjs
  ): Array<{
    userId: mongoose.Types.ObjectId;
    deadlineId: mongoose.Types.ObjectId;
    date: Date;
    startTime: Date;
    endTime: Date;
    duration: number;
    title: string;
    blockIndex: number;
    totalBlocks: number;
    status: "pending";
  }> {
    const blocks: Array<{
      userId: mongoose.Types.ObjectId;
      deadlineId: mongoose.Types.ObjectId;
      date: Date;
      startTime: Date;
      endTime: Date;
      duration: number;
      title: string;
      blockIndex: number;
      totalBlocks: number;
      status: "pending";
    }> = [];
    let blockIndex = 1;
    const totalBlocks = blockDurations.length;

    // 從截止日往前排
    let currentDate = dueDate.startOf("day").subtract(1, "day"); // 從截止日前一天開始
    let dailyHoursUsed = 0;
    let dailyBlocksUsed = 0;

    for (const duration of blockDurations) {
      // 如果已經排到現在之前，停止
      if (currentDate.isBefore(now.startOf("day"))) {
        break;
      }

      // 尋找這一天可以排的時間
      const dateKey = currentDate.format("YYYY-MM-DD");
      const hours = availableSlots.get(dateKey);

      if (!hours) {
        // 如果這一天沒有可用時間，往前一天
        currentDate = currentDate.subtract(1, "day");
        dailyHoursUsed = 0;
        dailyBlocksUsed = 0;
        continue;
      }

      // 檢查是否超過每天限制
      if (
        dailyHoursUsed + duration > SCHEDULE_CONFIG.MAX_HOURS_PER_DAY ||
        dailyBlocksUsed >= SCHEDULE_CONFIG.MAX_BLOCKS_PER_DAY
      ) {
        // 往前一天
        currentDate = currentDate.subtract(1, "day");
        dailyHoursUsed = 0;
        dailyBlocksUsed = 0;
        continue;
      }

      // 尋找合適的開始時間
      const startHour = this.findAvailableStartHour(
        hours,
        duration,
        currentDate,
        now
      );

      if (startHour === -1) {
        // 這一天找不到合適時間，往前一天
        currentDate = currentDate.subtract(1, "day");
        dailyHoursUsed = 0;
        dailyBlocksUsed = 0;
        continue;
      }

      // 建立 block
      const startTime = currentDate.hour(startHour).minute(0).second(0);
      const endTime = startTime.add(duration, "hour");

      blocks.push({
        userId: deadline.userId as mongoose.Types.ObjectId,
        deadlineId: deadline._id as mongoose.Types.ObjectId,
        date: currentDate.toDate(),
        startTime: startTime.toDate(),
        endTime: endTime.toDate(),
        duration,
        title: `${deadline.title}（進度 ${blockIndex}/${totalBlocks}）`,
        blockIndex,
        totalBlocks,
        status: "pending" as const,
      });

      // 更新可用時間地圖（標記這個時段為已使用）
      for (let h = startHour; h < startHour + duration; h++) {
        if (h < 24) {
          hours[h] = false;
        }
      }

      dailyHoursUsed += duration;
      dailyBlocksUsed += 1;
      blockIndex += 1;

      // 如果這一天已經排滿，往前一天
      if (
        dailyHoursUsed >= SCHEDULE_CONFIG.MAX_HOURS_PER_DAY ||
        dailyBlocksUsed >= SCHEDULE_CONFIG.MAX_BLOCKS_PER_DAY
      ) {
        currentDate = currentDate.subtract(1, "day");
        dailyHoursUsed = 0;
        dailyBlocksUsed = 0;
      }
    }

    return blocks;
  }

  /**
   * 尋找可用的開始時間
   */
  private findAvailableStartHour(
    hours: boolean[],
    duration: number,
    date: dayjs.Dayjs,
    now: dayjs.Dayjs
  ): number {
    // 優先時段：09:00-12:00, 14:00-18:00, 19:00-21:00
    const preferredRanges = [
      { start: 9, end: 12 },
      { start: 14, end: 18 },
      { start: 19, end: 21 },
    ];

    // 先嘗試優先時段
    for (const range of preferredRanges) {
      for (let h = range.start; h <= range.end - duration; h++) {
        if (this.isSlotAvailable(hours, h, duration, date, now)) {
          return h;
        }
      }
    }

    // 如果優先時段都不可用，嘗試其他時段（排除禁止時段）
    for (let h = 8; h <= 22 - duration; h++) {
      // 跳過禁止時段
      if (
        SCHEDULE_CONFIG.FORBIDDEN_HOURS.some(
          ({ start, end }) => h >= start && h < end
        )
      ) {
        continue;
      }

      // 睡覺時段只允許 1hr block
      if (
        duration > 1 &&
        h >= SCHEDULE_CONFIG.SLEEP_HOURS.start &&
        h < SCHEDULE_CONFIG.SLEEP_HOURS.end
      ) {
        continue;
      }

      if (this.isSlotAvailable(hours, h, duration, date, now)) {
        return h;
      }
    }

    return -1; // 找不到可用時間
  }

  /**
   * 檢查時段是否可用
   */
  private isSlotAvailable(
    hours: boolean[],
    startHour: number,
    duration: number,
    date: dayjs.Dayjs,
    now: dayjs.Dayjs
  ): boolean {
    // 檢查是否在禁止時段內
    for (let h = startHour; h < startHour + duration; h++) {
      if (h >= 24) return false;

      if (!hours[h]) {
        return false;
      }

      // 檢查是否在禁止時段
      if (
        SCHEDULE_CONFIG.FORBIDDEN_HOURS.some(
          ({ start, end }) => h >= start && h < end
        )
      ) {
        return false;
      }

      // 如果是今天，檢查是否已過
      if (date.isSame(now, "day") && h <= now.hour()) {
        return false;
      }
    }

    return true;
  }
}

