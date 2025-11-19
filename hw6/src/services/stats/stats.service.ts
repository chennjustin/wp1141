import connectDB from "@/lib/db/mongoose";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import User from "@/models/User";

export class StatsService {
  async getStats() {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalConversations,
      totalMessages,
      activeUsers,
      todayMessages,
    ] = await Promise.all([
      Conversation.countDocuments(),
      Message.countDocuments(),
      User.countDocuments(),
      Message.countDocuments({
        timestamp: { $gte: today },
      }),
    ]);

    return {
      totalConversations,
      totalMessages,
      activeUsers,
      todayMessages,
    };
  }
}

