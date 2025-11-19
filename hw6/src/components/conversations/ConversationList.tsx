"use client";

import { ConversationListResponse } from "@/types/api";
import ConversationItem from "./ConversationItem";

interface ConversationListProps {
  conversations: ConversationListResponse | null;
  loading: boolean;
}

export default function ConversationList({
  conversations,
  loading,
}: ConversationListProps) {
  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  if (!conversations || conversations.conversations.length === 0) {
    return <div className="text-center py-8">尚無對話紀錄</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        共 {conversations.total} 筆對話，顯示第{" "}
        {(conversations.page - 1) * conversations.limit + 1} -{" "}
        {Math.min(conversations.page * conversations.limit, conversations.total)}{" "}
        筆
      </div>
      {conversations.conversations.map((conversation) => (
        <ConversationItem key={conversation._id} conversation={conversation} />
      ))}
    </div>
  );
}

