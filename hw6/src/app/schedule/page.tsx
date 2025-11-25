"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";

// Mock data type
interface Deadline {
  id: string;
  title: string;
  type: "exam" | "assignment" | "project" | "other";
  dueDate: string; // ISO string
  estimatedHours: number;
  startHour?: number; // Optional, default 14
}

// Mock hook - 之後可以替換成真實的 API
function useDeadlines(weekStart: Date): Deadline[] {
  // Mock data for current week
  const today = dayjs();
  return [
    {
      id: "1",
      title: "OS HW4",
      type: "assignment",
      dueDate: today.format("YYYY-MM-DD"),
      estimatedHours: 3,
      startHour: 14,
    },
    {
      id: "2",
      title: "資料結構期末考",
      type: "exam",
      dueDate: today.add(2, "day").format("YYYY-MM-DD"),
      estimatedHours: 8,
      startHour: 9,
    },
    {
      id: "3",
      title: "網服專題報告",
      type: "project",
      dueDate: today.add(4, "day").format("YYYY-MM-DD"),
      estimatedHours: 5,
      startHour: 10,
    },
    {
      id: "4",
      title: "線性代數作業",
      type: "assignment",
      dueDate: today.add(1, "day").format("YYYY-MM-DD"),
      estimatedHours: 2,
      startHour: 15,
    },
  ];
}

// 時間軸配置
const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 - 24:00
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// 類型顏色配置（柔和色調）
const TYPE_COLORS = {
  exam: {
    bg: "bg-red-100",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-50 text-red-700",
  },
  assignment: {
    bg: "bg-blue-100",
    border: "border-blue-200",
    text: "text-blue-800",
    badge: "bg-blue-50 text-blue-700",
  },
  project: {
    bg: "bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-800",
    badge: "bg-purple-50 text-purple-700",
  },
  other: {
    bg: "bg-gray-100",
    border: "border-gray-200",
    text: "text-gray-800",
    badge: "bg-gray-50 text-gray-700",
  },
};

const TYPE_NAMES = {
  exam: "考試",
  assignment: "作業",
  project: "專題",
  other: "其他",
};

function ScheduleContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // 週管理
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = dayjs();
    return today.startOf("week").add(1, "day").toDate(); // Monday
  });

  // Modal/Drawer 狀態
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<{ date: Date; hour: number } | null>(null);

  // Mock data
  const deadlines = useDeadlines(currentWeekStart);

  // 計算一週的日期
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    return dayjs(currentWeekStart).add(i, "day").toDate();
  });

  // 判斷是否為今天
  const isToday = (date: Date) => {
    return dayjs(date).isSame(dayjs(), "day");
  };

  // 獲取某個日期某個小時的 deadlines（只返回從這個小時開始的）
  const getDeadlinesAtSlot = (date: Date, hour: number) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return deadlines.filter((d) => {
      const deadlineDate = dayjs(d.dueDate).format("YYYY-MM-DD");
      const startHour = d.startHour || 14;
      return deadlineDate === dateStr && startHour === hour;
    });
  };

  // 週切換
  const goToPrevWeek = () => {
    setCurrentWeekStart(dayjs(currentWeekStart).subtract(1, "week").toDate());
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(dayjs(currentWeekStart).add(1, "week").toDate());
  };

  // 週範圍文字
  const weekRangeText = () => {
    const start = dayjs(currentWeekStart);
    const end = start.add(6, "day");
    return `${start.format("YYYY 年 M 月 D 日")} – ${end.format("M 月 D 日")}`;
  };

  // 點擊色塊
  const handleDeadlineClick = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    setIsDetailPanelOpen(true);
  };

  // 點擊空白格子
  const handleEmptySlotClick = (date: Date, hour: number) => {
    setClickedDate({ date, hour });
    setIsAddModalOpen(true);
  };

  // 今天的待辦事項
  const todayDeadlines = deadlines.filter((d) => {
    return dayjs(d.dueDate).isSame(dayjs(), "day");
  });

  // 計算剩餘天數
  const getDaysLeft = (dueDate: string) => {
    const days = dayjs(dueDate).diff(dayjs(), "day");
    if (days < 0) return `已過期 ${Math.abs(days)} 天`;
    if (days === 0) return "今天截止";
    return `剩餘 ${days} 天`;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-gray-800 mb-1">我的時程表</h1>
          <p className="text-sm text-gray-500">拯救期末大作戰</p>
        </div>

        {/* Weekly Calendar Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          {/* 週導覽 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPrevWeek}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700">{weekRangeText()}</span>
            <button
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="flex min-w-[800px]">
              {/* 時間軸 */}
              <div className="w-20 flex-shrink-0 pr-4">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-100 flex items-start justify-end pr-2"
                  >
                    <span className="text-xs text-gray-400 font-light">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* 日期欄 */}
              <div className="flex-1 grid grid-cols-7 gap-px bg-gray-100">
                {weekDates.map((date, colIndex) => {
                  const isTodayColumn = isToday(date);
                  return (
                    <div
                      key={colIndex}
                      className={`relative ${isTodayColumn ? "bg-gray-50" : "bg-white"}`}
                    >
                      {/* 日期標題 */}
                      <div className="sticky top-0 z-10 bg-inherit border-b border-gray-100 p-2">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">{WEEKDAYS[colIndex]}</div>
                          <div className="text-sm font-medium text-gray-700">
                            {dayjs(date).format("D")}
                          </div>
                          {isTodayColumn && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                              今天
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 時間格子 */}
                      {HOURS.map((hour) => {
                        const slotDeadlines = getDeadlinesAtSlot(date, hour);
                        const isEmpty = slotDeadlines.length === 0;

                        return (
                          <div
                            key={hour}
                            className="h-16 border-b border-gray-100 relative group cursor-pointer"
                            onClick={() => isEmpty && handleEmptySlotClick(date, hour)}
                          >
                            {/* 空白格子的 hover 效果 */}
                            {isEmpty && (
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-50 transition-opacity" />
                            )}

                            {/* Deadline 色塊 */}
                            {slotDeadlines.map((deadline) => {
                              const colors = TYPE_COLORS[deadline.type];
                              const height = deadline.estimatedHours * 4; // 1hr = 4rem (h-16 = 64px)
                              const topOffset = 0; // 從當前格子的頂部開始

                              return (
                                <div
                                  key={deadline.id}
                                  className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border rounded-2xl shadow-sm p-2 cursor-pointer hover:shadow-md transition-shadow z-20 overflow-hidden`}
                                  style={{
                                    top: `${topOffset}px`,
                                    height: `${height * 16}px`, // 轉換為 px (1rem = 16px)
                                    minHeight: "48px", // 最小高度確保內容可見
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeadlineClick(deadline);
                                  }}
                                >
                                  <div className="text-xs font-medium text-gray-800 mb-1 truncate leading-tight">
                                    {deadline.title}
                                  </div>
                                  <div className="text-[10px] text-gray-600 space-y-0.5 leading-tight">
                                    <div className="flex items-center gap-1">
                                      <span className={colors.badge + " px-1.5 py-0.5 rounded text-[10px]"}>
                                        {TYPE_NAMES[deadline.type]}
                                      </span>
                                    </div>
                                    {!isToday(date) && (
                                      <div className="truncate">{dayjs(deadline.dueDate).format("M/D")}</div>
                                    )}
                                    <div className="truncate">{getDaysLeft(deadline.dueDate)}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 今天的待辦事項 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-800 mb-4">今天的待辦事項</h2>
          {todayDeadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              今天沒有任何待辦事項 🌈
            </div>
          ) : (
            <div className="space-y-3">
              {todayDeadlines.map((deadline) => {
                const colors = TYPE_COLORS[deadline.type];
                return (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleDeadlineClick(deadline)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">{deadline.title}</span>
                        <span className={`${colors.badge} px-2 py-0.5 rounded text-xs`}>
                          {TYPE_NAMES[deadline.type]}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayjs(deadline.dueDate).format("YYYY 年 M 月 D 日")} · {getDaysLeft(deadline.dueDate)}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 詳細 Panel (Drawer) */}
      {isDetailPanelOpen && selectedDeadline && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsDetailPanelOpen(false)}
          />

          {/* Panel */}
          <div className="relative bg-white w-full sm:w-96 h-[80vh] sm:h-auto rounded-t-2xl sm:rounded-l-2xl shadow-xl p-6 overflow-y-auto">
            <button
              onClick={() => setIsDetailPanelOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-light text-gray-800 mb-2">{selectedDeadline.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <span className={`${TYPE_COLORS[selectedDeadline.type].badge} px-3 py-1 rounded-lg text-sm`}>
                  {TYPE_NAMES[selectedDeadline.type]}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-sm">
              <div>
                <span className="text-gray-500">截止日期：</span>
                <span className="text-gray-800 ml-2">
                  {dayjs(selectedDeadline.dueDate).format("YYYY 年 M 月 D 日")}
                </span>
              </div>
              <div>
                <span className="text-gray-500">估計時間：</span>
                <span className="text-gray-800 ml-2">{selectedDeadline.estimatedHours} 小時</span>
              </div>
              <div>
                <span className="text-gray-500">剩餘時間：</span>
                <span className="text-gray-800 ml-2">{getDaysLeft(selectedDeadline.dueDate)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log("編輯", selectedDeadline);
                  setIsDetailPanelOpen(false);
                }}
                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                編輯
              </button>
              <button
                onClick={() => {
                  console.log("刪除", selectedDeadline);
                  setIsDetailPanelOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                刪除
              </button>
              <button
                onClick={() => setIsDetailPanelOpen(false)}
                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增 Modal */}
      {isAddModalOpen && clickedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-light text-gray-800 mb-6">新增 Deadline</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">日期</label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  {dayjs(clickedDate.date).format("YYYY 年 M 月 D 日")} {clickedDate.hour}:00
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">標題</label>
                <input
                  type="text"
                  placeholder="輸入標題..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">估計時間（小時）</label>
                <input
                  type="number"
                  placeholder="2"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={() => {
                  console.log("新增 Deadline", clickedDate);
                  setIsAddModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                建立
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-light text-gray-700 mb-2">載入中...</div>
            <div className="text-sm text-gray-500">正在載入你的時程表</div>
          </div>
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
