import connectDB from "@/lib/db/mongoose";
import Deadline, { IDeadline, DeadlineStatus, DeadlineType } from "@/models/Deadline";
import User from "@/models/User";
import { Logger } from "@/lib/utils/logger";

export interface CreateDeadlineData {
  userId: string;
  title: string;
  type: DeadlineType;
  dueDate: Date;
  estimatedHours?: number;
}

export interface UpdateDeadlineData {
  title?: string;
  type?: DeadlineType;
  dueDate?: Date;
  estimatedHours?: number;
  status?: DeadlineStatus;
}

export class DeadlineService {
  /**
   * 建立新的 Deadline
   */
  async createDeadline(data: CreateDeadlineData): Promise<IDeadline> {
    try {
      await connectDB();
      const user = await User.findOne({ lineUserId: data.userId });
      if (!user) {
        throw new Error("User not found");
      }

      const deadline = await Deadline.create({
        userId: user._id,
        title: data.title,
        type: data.type,
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours || 2,
        status: "pending",
      });

      return deadline;
    } catch (error) {
      Logger.error("建立 Deadline 失敗", { error, data });
      throw error;
    }
  }

  /**
   * 取得使用者的所有 Deadline
   */
  async getDeadlinesByUser(
    userId: string,
    status?: DeadlineStatus
  ): Promise<IDeadline[]> {
    try {
      await connectDB();
      const user = await User.findOne({ lineUserId: userId });
      if (!user) {
        return [];
      }

      const query: any = { userId: user._id };
      if (status) {
        query.status = status;
      }

      const deadlines = await Deadline.find(query).sort({ dueDate: 1 }).exec();
      return deadlines;
    } catch (error) {
      Logger.error("取得 Deadline 列表失敗", { error, userId });
      return [];
    }
  }

  /**
   * 取得今天的 Deadline（台灣時區）
   */
  async getTodayDeadlines(userId: string): Promise<IDeadline[]> {
    try {
      await connectDB();
      const user = await User.findOne({ lineUserId: userId });
      if (!user) {
        return [];
      }

      // 取得台灣時區的今天日期
      const now = new Date();
      const taiwanTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Taipei" }));
      taiwanTime.setHours(0, 0, 0, 0);
      const tomorrow = new Date(taiwanTime);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const deadlines = await Deadline.find({
        userId: user._id,
        status: "pending",
        dueDate: {
          $gte: taiwanTime,
          $lt: tomorrow,
        },
      })
        .sort({ dueDate: 1 })
        .exec();

      return deadlines;
    } catch (error) {
      Logger.error("取得今天 Deadline 列表失敗", { error, userId });
      return [];
    }
  }

  /**
   * 根據 ID 取得 Deadline
   */
  async getDeadlineById(id: string): Promise<IDeadline | null> {
    try {
      await connectDB();
      const deadline = await Deadline.findById(id).exec();
      return deadline;
    } catch (error) {
      Logger.error("取得 Deadline 失敗", { error, id });
      return null;
    }
  }

  /**
   * 更新 Deadline
   */
  async updateDeadline(
    id: string,
    updates: UpdateDeadlineData
  ): Promise<IDeadline | null> {
    try {
      await connectDB();
      const deadline = await Deadline.findByIdAndUpdate(id, updates, {
        new: true,
      }).exec();
      return deadline;
    } catch (error) {
      Logger.error("更新 Deadline 失敗", { error, id, updates });
      return null;
    }
  }

  /**
   * 刪除 Deadline
   */
  async deleteDeadline(id: string): Promise<void> {
    try {
      await connectDB();
      await Deadline.findByIdAndDelete(id).exec();
    } catch (error) {
      Logger.error("刪除 Deadline 失敗", { error, id });
      throw error;
    }
  }

  /**
   * 標記 Deadline 為完成
   */
  async markAsDone(id: string): Promise<IDeadline | null> {
    try {
      await connectDB();
      const deadline = await Deadline.findByIdAndUpdate(
        id,
        { status: "done" },
        { new: true }
      ).exec();
      return deadline;
    } catch (error) {
      Logger.error("標記 Deadline 完成失敗", { error, id });
      return null;
    }
  }

  /**
   * 計算剩餘天數（負數表示已過期）
   */
  calculateDaysLeft(dueDate: Date): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

