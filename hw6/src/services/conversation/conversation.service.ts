import connectDB from "@/lib/db/mongoose";
import User, { IUser } from "@/models/User";
import Conversation, { IConversation } from "@/models/Conversation";
import Message, { IMessage } from "@/models/Message";
import { Logger } from "@/lib/utils/logger";

export class ConversationService {
  async getOrCreateUser(lineUserId: string, displayName?: string): Promise<IUser> {
    try {
      await connectDB();

      let user = await User.findOne({ lineUserId });

      if (!user) {
        user = await User.create({
          lineUserId,
          displayName,
        });
        Logger.info("Created new user", { lineUserId });
      } else if (displayName && user.displayName !== displayName) {
        user.displayName = displayName;
        await user.save();
      }

      return user;
    } catch (error) {
      Logger.error("Error in getOrCreateUser", { error, lineUserId });
      throw error;
    }
  }

  async getOrCreateConversation(
    userId: string,
    lineUserId: string
  ): Promise<IConversation> {
    await connectDB();

    let conversation = await Conversation.findOne({
      userId,
      lineUserId,
    }).sort({ updatedAt: -1 });

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        platform: "line",
        lineUserId,
      });
      Logger.info("Created new conversation", { userId, lineUserId });
    }

    return conversation;
  }

  async saveMessage(
    conversationId: string,
    role: "user" | "assistant" | "system",
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<IMessage> {
    try {
      await connectDB();

      const message = await Message.create({
        conversationId,
        role,
        content,
        timestamp: new Date(),
        metadata,
      });

      // 更新對話的 updatedAt（不等待完成，避免阻塞）
      Conversation.findByIdAndUpdate(conversationId, {
        updatedAt: new Date(),
      }).catch((error) => {
        Logger.error("Failed to update conversation timestamp", { error });
      });

      Logger.debug("Saved message", { conversationId, role });

      return message;
    } catch (error) {
      Logger.error("Error saving message", { error, conversationId, role });
      throw error;
    }
  }

  async getConversationHistory(
    conversationId: string,
    limit: number = 20
  ): Promise<Array<{ role: string; content: string }>> {
    await connectDB();

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("role content")
      .lean();

    // 反轉順序，讓最舊的訊息在前
    return messages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  async getConversations(
    filters: {
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 20
  ) {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      const dateQuery: Record<string, Date> = {};
      if (filters.startDate) {
        dateQuery.$gte = filters.startDate;
      }
      if (filters.endDate) {
        dateQuery.$lte = filters.endDate;
      }
      query.createdAt = dateQuery;
    }

    const conversations = await Conversation.find(query)
      .populate("userId", "lineUserId displayName")
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Conversation.countDocuments(query);

    // 為每個對話獲取最後一條訊息
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        })
          .sort({ timestamp: -1 })
          .select("content")
          .lean();

        const messageCount = await Message.countDocuments({
          conversationId: conv._id,
        });

        return {
          ...conv,
          lastMessage: (lastMessage as any)?.content,
          messageCount,
        };
      })
    );

    return {
      conversations: conversationsWithMessages,
      total,
      page,
      limit,
    };
  }

  async getConversationById(conversationId: string) {
    await connectDB();

    const conversation = await Conversation.findById(conversationId)
      .populate("userId", "lineUserId displayName")
      .lean();

    if (!conversation) {
      return null;
    }

    const messages = await Message.find({ conversationId })
      .sort({ timestamp: 1 })
      .lean();

    return {
      ...conversation,
      messages,
    };
  }
}

