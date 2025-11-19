interface MessageBubbleProps {
  message: {
    role: string;
    content: string;
    timestamp: string;
  };
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`max-w-md px-4 py-2 rounded-lg ${
          isUser
            ? "bg-blue-600 text-white"
            : isAssistant
            ? "bg-gray-200 text-gray-800"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        <div className="text-sm font-semibold mb-1">
          {isUser ? "使用者" : isAssistant ? "AI 助手" : "系統"}
        </div>
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleString("zh-TW")}
        </div>
      </div>
    </div>
  );
}

