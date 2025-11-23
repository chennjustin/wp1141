"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/conversations/ConversationList";
import ConversationFilter from "@/components/conversations/ConversationFilter";
import MessageList from "@/components/messages/MessageList";
import { ConversationListResponse } from "@/types/api";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

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

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationListResponse | null>(null);
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"conversations" | "messages">("conversations");
  const [messageTypeFilter, setMessageTypeFilter] = useState<"all" | "incoming" | "outgoing">("all");
  const [filters, setFilters] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/conversations?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append("userId", filters.userId);
      if (messageTypeFilter !== "all") {
        params.append("messageType", messageTypeFilter);
      }
      params.append("limit", "100");

      const response = await fetch(`/api/messages?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // 每 5 秒更新一次
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // 每 5 秒更新一次
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, messageTypeFilter, filters.userId]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">對話管理</h1>
          <Link href="/">
            <Button variant="secondary">返回儀表板</Button>
          </Link>
        </div>

        {/* 分頁切換 */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("conversations")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "conversations"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              對話記錄
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "messages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              訊息記錄
            </button>
          </nav>
        </div>

        {activeTab === "conversations" ? (
          <>
            <ConversationFilter filters={filters} onFilterChange={setFilters} />
            <ConversationList conversations={conversations} loading={loading} />
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">訊息類型：</label>
                <Select
                  value={messageTypeFilter}
                  onChange={(e) => setMessageTypeFilter(e.target.value as "all" | "incoming" | "outgoing")}
                  className="w-40"
                >
                  <option value="all">全部</option>
                  <option value="incoming">使用者訊息</option>
                  <option value="outgoing">Bot 回應</option>
                </Select>
              </div>
              {filters.userId && (
                <div className="text-sm text-gray-600">
                  篩選使用者: {filters.userId.substring(0, 20)}...
                </div>
              )}
            </div>
            <MessageList
              messages={messages}
              loading={messagesLoading}
              messageTypeFilter={messageTypeFilter}
            />
          </>
        )}
      </div>
    </main>
  );
}

