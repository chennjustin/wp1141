import connectDB from "@/lib/db/mongoose";
import UserState, { IUserState, FlowType } from "@/models/UserState";
import { Logger } from "@/lib/utils/logger";

export class UserStateService {
  /**
   * 取得使用者狀態
   */
  async getState(userId: string): Promise<IUserState | null> {
    try {
      await connectDB();
      const state = await UserState.findOne({ userId }).exec();
      return state;
    } catch (error) {
      Logger.error("取得使用者狀態失敗", { error, userId });
      return null;
    }
  }

  /**
   * 設定使用者狀態
   */
  async setState(
    userId: string,
    flow: FlowType,
    flowData?: Record<string, unknown>
  ): Promise<void> {
    try {
      await connectDB();
      await UserState.findOneAndUpdate(
        { userId },
        {
          userId,
          currentFlow: flow,
          flowData: flowData || {},
        },
        { upsert: true, new: true }
      ).exec();
    } catch (error) {
      Logger.error("設定使用者狀態失敗", { error, userId, flow });
      throw error;
    }
  }

  /**
   * 清除使用者狀態
   */
  async clearState(userId: string): Promise<void> {
    try {
      await connectDB();
      await UserState.findOneAndUpdate(
        { userId },
        {
          currentFlow: null,
          flowData: {},
        }
      ).exec();
    } catch (error) {
      Logger.error("清除使用者狀態失敗", { error, userId });
      throw error;
    }
  }

  /**
   * 更新流程資料（不改變 currentFlow）
   */
  async updateFlowData(
    userId: string,
    flowData: Record<string, unknown>
  ): Promise<void> {
    try {
      await connectDB();
      const state = await UserState.findOne({ userId }).exec();
      if (state) {
        state.flowData = { ...state.flowData, ...flowData };
        await state.save();
      }
    } catch (error) {
      Logger.error("更新流程資料失敗", { error, userId });
      throw error;
    }
  }
}

