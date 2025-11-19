"use client";

import { useEffect, useState } from "react";
import ConversationList from "@/components/conversations/ConversationList";
import ConversationFilter from "@/components/conversations/ConversationFilter";
import { ConversationListResponse } from "@/types/api";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationListResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // 每 5 秒更新一次
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">對話管理</h1>
          <Link href="/">
            <Button variant="secondary">返回儀表板</Button>
          </Link>
        </div>
        <ConversationFilter filters={filters} onFilterChange={setFilters} />
        <ConversationList conversations={conversations} loading={loading} />
      </div>
    </main>
  );
}

