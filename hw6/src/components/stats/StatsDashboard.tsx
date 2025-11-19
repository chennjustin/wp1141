"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { StatsData } from "@/types/api";

export default function StatsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // 每 10 秒更新一次
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }

  if (!stats) {
    return <div className="text-center py-8">無法載入統計資料</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <div className="text-sm text-gray-600 mb-2">總對話數</div>
        <div className="text-3xl font-bold">{stats.totalConversations}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-600 mb-2">總訊息數</div>
        <div className="text-3xl font-bold">{stats.totalMessages}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-600 mb-2">活躍使用者</div>
        <div className="text-3xl font-bold">{stats.activeUsers}</div>
      </Card>
      <Card>
        <div className="text-sm text-gray-600 mb-2">今日訊息數</div>
        <div className="text-3xl font-bold">{stats.todayMessages}</div>
      </Card>
    </div>
  );
}

