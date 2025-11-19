"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import MessageBubble from "./MessageBubble";

interface ConversationItemProps {
  conversation: {
    _id: string;
    lineUserId: string;
    createdAt: string;
    updatedAt: string;
    lastMessage?: string;
    messageCount: number;
  };
}

export default function ConversationItem({
  conversation,
}: ConversationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const handleToggle = async () => {
    if (!expanded && messages.length === 0) {
      setLoadingMessages(true);
      try {
        const response = await fetch(`/api/conversations/${conversation._id}`);
        const data = await response.json();
        if (data.success) {
          setMessages(data.data.messages || []);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoadingMessages(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">使用者: {conversation.lineUserId}</span>
            <Badge>{conversation.messageCount} 則訊息</Badge>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            建立時間: {new Date(conversation.createdAt).toLocaleString("zh-TW")}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            最後更新: {new Date(conversation.updatedAt).toLocaleString("zh-TW")}
          </div>
          {conversation.lastMessage && (
            <div className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
              最後訊息: {conversation.lastMessage.substring(0, 100)}
              {conversation.lastMessage.length > 100 ? "..." : ""}
            </div>
          )}
        </div>
        <button
          onClick={handleToggle}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {expanded ? "收起" : "展開"}
        </button>
      </div>
      {expanded && (
        <div className="mt-4 border-t pt-4">
          {loadingMessages ? (
            <div className="text-center py-4">載入訊息中...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4">尚無訊息</div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble key={message._id} message={message} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

