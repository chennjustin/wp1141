"use client";

interface BotMessage {
  _id: string;
  userId: string;
  messageType: "incoming" | "outgoing";
  content: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageListProps {
  messages: BotMessage[];
  loading: boolean;
  messageTypeFilter?: "incoming" | "outgoing" | "all";
}

export default function MessageList({
  messages,
  loading,
  messageTypeFilter = "all",
}: MessageListProps) {
  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  if (messages.length === 0) {
    return <div className="text-center py-8">尚無訊息記錄</div>;
  }

  const filteredMessages = messageTypeFilter === "all" 
    ? messages 
    : messages.filter((msg) => msg.messageType === messageTypeFilter);

  // 依使用者分組
  const messagesByUser: Record<string, BotMessage[]> = {};
  filteredMessages.forEach((msg) => {
    if (!messagesByUser[msg.userId]) {
      messagesByUser[msg.userId] = [];
    }
    messagesByUser[msg.userId].push(msg);
  });

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        共 {filteredMessages.length} 筆訊息記錄
      </div>
      {Object.entries(messagesByUser).map(([userId, userMessages]) => (
        <div key={userId} className="bg-white rounded-lg shadow p-4">
          <div className="font-semibold text-gray-700 mb-3">
            使用者 ID: {userId.substring(0, 20)}...
          </div>
          <div className="space-y-2">
            {userMessages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded ${
                  msg.messageType === "incoming"
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "bg-green-50 border-l-4 border-green-500"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-xs font-medium ${
                      msg.messageType === "incoming"
                        ? "text-blue-700"
                        : "text-green-700"
                    }`}
                  >
                    {msg.messageType === "incoming" ? "📥 使用者" : "📤 Bot"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleString("zh-TW")}
                  </span>
                </div>
                <div className="text-sm text-gray-800 whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.metadata && Object.keys(msg.metadata).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    類型: {msg.metadata.type || "未知"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

