"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Deadline {
  id: string;
  title: string;
  type: string;
  typeName: string;
  dueDate: string;
  dueDateFormatted: string;
  estimatedHours: number;
  daysLeft: number;
  isOverdue: boolean;
  isToday: boolean;
}

function ScheduleContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!token) {
        setError("缺少 token 參數");
        setLoading(false);
        return;
      }

      try {
        // 使用絕對 URL 以避免在 LINE WebView 中的相對路徑問題
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const apiUrl = `${baseUrl}/api/schedule?token=${encodeURIComponent(token || '')}`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
        });
        const data = await response.json();

        if (!data.success) {
          if (response.status === 401) {
            setError("無效的 token，請重新從 LINE Bot 開啟時程表");
          } else {
            setError(data.error || "載入時程表失敗");
          }
        } else {
          setDeadlines(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch schedule", error);
        setError("載入時程表時發生錯誤");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [token]);

  const getTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      exam: "📝",
      assignment: "📄",
      project: "📦",
      other: "📌",
    };
    return emojiMap[type] || "📌";
  };

  const getDaysLeftText = (daysLeft: number, isOverdue: boolean, isToday: boolean) => {
    if (isOverdue) {
      return `已過期 ${Math.abs(daysLeft)} 天`;
    }
    if (isToday) {
      return "今天截止";
    }
    return `剩餘 ${daysLeft} 天`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700 mb-2">載入中...</div>
          <div className="text-sm text-gray-500">正在載入你的時程表</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">無法載入時程表</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            請從 LINE Bot 重新開啟時程表
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">📅 我的時程表</h1>
          <p className="text-sm text-gray-600">拯救期末大作戰</p>
        </div>

        {/* Deadlines List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {deadlines.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🌈</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                目前沒有任何待辦事項
              </h3>
              <p className="text-sm text-gray-500">
                你的人生一片光明！
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  待辦事項 ({deadlines.length})
                </h2>
              </div>
              <div className="space-y-3">
                {deadlines
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((deadline) => (
                    <Link
                      key={deadline.id}
                      href={`/schedule/${deadline.id}?token=${token}`}
                      className={`block p-4 rounded-lg border transition-all hover:shadow-md ${
                        deadline.isOverdue
                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                          : deadline.isToday
                          ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">
                              {getTypeEmoji(deadline.type)}
                            </span>
                            <h3 className="font-semibold text-gray-800 text-lg">
                              {deadline.title}
                            </h3>
                            <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
                              {deadline.typeName}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">📅 截止日期：</span>
                              {deadline.dueDateFormatted}
                            </div>
                            <div>
                              <span className="font-medium">⏰ 預估時間：</span>
                              {deadline.estimatedHours} 小時
                            </div>
                          </div>
                          <div
                            className={`mt-2 text-sm font-semibold ${
                              deadline.isOverdue
                                ? "text-red-600"
                                : deadline.isToday
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {deadline.isOverdue && "⚠️ "}
                            {deadline.isToday && "⏰ "}
                            {!deadline.isOverdue && !deadline.isToday && "⏳ "}
                            {getDaysLeftText(
                              deadline.daysLeft,
                              deadline.isOverdue,
                              deadline.isToday
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-gray-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>此頁面為只讀模式，編輯請回到 LINE Bot</p>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-700 mb-2">載入中...</div>
            <div className="text-sm text-gray-500">正在載入你的時程表</div>
          </div>
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}

