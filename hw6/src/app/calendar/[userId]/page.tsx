"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Deadline {
  _id: string;
  title: string;
  type: "exam" | "assignment" | "project" | "other";
  dueDate: string;
  estimatedHours: number;
  status: "pending" | "done";
}

export default function CalendarPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (userId) {
      fetchDeadlines();
    }
  }, [userId]);

  const fetchDeadlines = async () => {
    try {
      // 使用絕對路徑確保在 LINE WebView 中也能正確請求
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const response = await fetch(`${baseUrl}/api/deadlines?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setDeadlines(data.data);
      } else {
        console.error("Failed to fetch deadlines:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch deadlines", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 填充前面的空白
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDeadlinesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.dueDate).toISOString().split("T")[0];
      return deadlineDate === dateStr && deadline.status === "pending";
    });
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      exam: "📝",
      assignment: "📄",
      project: "📦",
      other: "📌",
    };
    return emojiMap[type] || "📌";
  };

  const getTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      exam: "考試",
      assignment: "作業",
      project: "專題",
      other: "其他",
    };
    return nameMap[type] || "其他";
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString("zh-TW", { year: "numeric", month: "long" });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">載入中...</div>
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

        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              ← 上個月
            </button>
            <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              下個月 →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday Headers */}
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((date, index) => {
              const dayDeadlines = getDeadlinesForDate(date);
              const isToday =
                date &&
                date.toDateString() === new Date().toDateString();
              const isPast =
                date && date < new Date() && !isToday;

              return (
                <div
                  key={index}
                  className={`min-h-24 border rounded-lg p-2 ${
                    isToday
                      ? "bg-blue-50 border-blue-400 border-2"
                      : isPast
                      ? "bg-gray-100"
                      : "bg-white"
                  }`}
                >
                  {date ? (
                    <>
                      <div
                        className={`text-sm font-semibold mb-1 ${
                          isToday ? "text-blue-600" : "text-gray-700"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayDeadlines.slice(0, 3).map((deadline) => {
                          const daysLeft = calculateDaysLeft(deadline.dueDate);
                          const isOverdue = daysLeft < 0;
                          return (
                            <div
                              key={deadline._id}
                              className={`text-xs p-1 rounded truncate ${
                                isOverdue
                                  ? "bg-red-100 text-red-700 border border-red-300"
                                  : daysLeft === 0
                                  ? "bg-orange-100 text-orange-700 border border-orange-300"
                                  : "bg-green-100 text-green-700 border border-green-300"
                              }`}
                              title={deadline.title}
                            >
                              {getTypeEmoji(deadline.type)} {deadline.title}
                            </div>
                          );
                        })}
                        {dayDeadlines.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayDeadlines.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadlines List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            待辦事項列表
          </h3>
          {deadlines.filter((d) => d.status === "pending").length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              目前沒有任何待辦事項 🌈
            </div>
          ) : (
            <div className="space-y-3">
              {deadlines
                .filter((d) => d.status === "pending")
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((deadline) => {
                  const daysLeft = calculateDaysLeft(deadline.dueDate);
                  const isOverdue = daysLeft < 0;
                  const dueDateStr = new Date(deadline.dueDate).toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={deadline._id}
                      className={`p-4 rounded-lg border ${
                        isOverdue
                          ? "bg-red-50 border-red-200"
                          : daysLeft === 0
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">
                              {getTypeEmoji(deadline.type)}
                            </span>
                            <h4 className="font-semibold text-gray-800">
                              {deadline.title}
                            </h4>
                            <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                              {getTypeName(deadline.type)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>📅 截止日期：{dueDateStr}</div>
                            <div>⏰ 預估時間：{deadline.estimatedHours} 小時</div>
                            <div
                              className={`font-semibold ${
                                isOverdue
                                  ? "text-red-600"
                                  : daysLeft === 0
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {isOverdue
                                ? `⚠️ 已過期 ${Math.abs(daysLeft)} 天`
                                : daysLeft === 0
                                ? "⏰ 今天截止"
                                : `⏳ 剩餘 ${daysLeft} 天`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

