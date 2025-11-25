"use client";

import { useState, Suspense, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useDeadlines, useStudyBlocks, Deadline, StudyBlock } from "@/hooks/useScheduleData";

// 時間軸配置
const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 - 24:00
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

// 類型顏色配置
const TYPE_COLORS = {
  exam: {
    bg: "bg-red-100",
    border: "border-red-300",
    text: "text-red-800",
    badge: "bg-red-50 text-red-700",
  },
  assignment: {
    bg: "bg-blue-100",
    border: "border-blue-300",
    text: "text-blue-800",
    badge: "bg-blue-50 text-blue-700",
  },
  project: {
    bg: "bg-purple-100",
    border: "border-purple-300",
    text: "text-purple-800",
    badge: "bg-purple-50 text-purple-700",
  },
  other: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    text: "text-gray-800",
    badge: "bg-gray-50 text-gray-700",
  },
};

// Deadline 紅色提醒顏色
const DEADLINE_COLORS = {
  bg: "bg-red-200",
  border: "border-red-400",
  text: "text-red-900",
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

  const weekEnd = useMemo(() => {
    return dayjs(currentWeekStart).add(6, "day").toDate();
  }, [currentWeekStart]);

  // 載入資料
  const { deadlines, loading: deadlinesLoading, error: deadlinesError, refetch: refetchDeadlines } = useDeadlines(token, currentWeekStart, weekEnd);
  const { studyBlocks, loading: blocksLoading, error: blocksError, refetch: refetchBlocks } = useStudyBlocks(token, currentWeekStart, weekEnd);

  // Debug: 檢查載入的資料
  useEffect(() => {
    console.log("Study blocks loaded:", studyBlocks);
    console.log("Deadlines loaded:", deadlines);
  }, [studyBlocks, deadlines]);

  // Modal/Drawer 狀態
  const [selectedItem, setSelectedItem] = useState<{ type: "deadline" | "block"; data: Deadline | StudyBlock } | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clickedDate, setClickedDate] = useState<{ date: Date; hour: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizingBlockId, setResizingBlockId] = useState<string | null>(null);

  // 計算一週的日期
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      return dayjs(currentWeekStart).add(i, "day").toDate();
    });
  }, [currentWeekStart]);

  // 判斷是否為今天
  const isToday = useCallback((date: Date) => {
    return dayjs(date).isSame(dayjs(), "day");
  }, []);

  // 獲取某個日期某個小時的 deadlines（紅色提醒，顯示在截止日當天的 23:00）
  const getDeadlinesAtSlot = useCallback((date: Date, hour: number) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return deadlines.filter((d) => {
      const deadlineDate = dayjs(d.dueDate).format("YYYY-MM-DD");
      // Deadline 顯示在截止日當天的 23:00（或可設定時間）
      return deadlineDate === dateStr && hour === 23;
    });
  }, [deadlines]);

  // 獲取某個日期某個小時的 study blocks
  const getStudyBlocksAtSlot = useCallback((date: Date, hour: number) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    return studyBlocks.filter((block) => {
      const blockDate = dayjs(block.startTime).format("YYYY-MM-DD");
      const blockHour = dayjs(block.startTime).hour();
      return blockDate === dateStr && blockHour === hour;
    });
  }, [studyBlocks]);

  // 獲取某個日期所有時間的 study blocks（用於計算位置和高度）
  const getAllStudyBlocksForDate = useCallback((date: Date) => {
    const dateStr = dayjs(date).format("YYYY-MM-DD");
    const blocks = studyBlocks.filter((block) => {
      const blockDate = dayjs(block.startTime).format("YYYY-MM-DD");
      return blockDate === dateStr;
    });
    // Debug: 檢查 blocks
    if (blocks.length > 0) {
      console.log(`Date ${dateStr} has ${blocks.length} blocks:`, blocks);
    }
    return blocks;
  }, [studyBlocks]);

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

  // 計算剩餘天數
  const getDaysLeft = (dueDate: string) => {
    const days = dayjs(dueDate).diff(dayjs(), "day");
    if (days < 0) return `已過期 ${Math.abs(days)} 天`;
    if (days === 0) return "今天截止";
    return `剩餘 ${days} 天`;
  };

  // 拖曳處理
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination || !token) return;

    const { draggableId, destination } = result;
    const block = studyBlocks.find((b) => b.id === draggableId);
    if (!block) return;

    // 解析目標位置（格式：dateStr-col，例如 "2025-11-25-col"）
    const targetDateStr = destination.droppableId.replace("-col", "");
    const targetDate = dayjs(targetDateStr).toDate();

    // 計算目標時間（預設為該日期的第一個可用時間，例如 9:00）
    // 這裡簡化處理，實際應該根據拖曳位置計算具體時間
    const newStartTime = dayjs(targetDate).hour(9).minute(0).second(0).toDate();
    const newEndTime = dayjs(newStartTime).add(block.duration, "hour").toDate();

    // 更新 block
    try {
      const url = new URL(`${window.location.origin}/api/study-blocks/${block.id}`);
      url.searchParams.set("token", token);

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newStartTime.toISOString(),
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update block");
      }

      // 重新載入資料
      refetchBlocks();
    } catch (error) {
      console.error("Failed to update block:", error);
      alert("更新失敗，請稍後再試");
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // 調整大小處理
  const handleResizeStart = (blockId: string) => {
    setResizingBlockId(blockId);
  };

  const handleResize = async (blockId: string, newDuration: number) => {
    if (newDuration < 0.5 || newDuration > 4) return;

    const block = studyBlocks.find((b) => b.id === blockId);
    if (!block || !token) return;

    const startTime = new Date(block.startTime);
    const newEndTime = dayjs(startTime).add(newDuration, "hour").toDate();

    try {
      const url = new URL(`${window.location.origin}/api/study-blocks/${blockId}`);
      url.searchParams.set("token", token);

      const response = await fetch(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endTime: newEndTime.toISOString(),
          duration: newDuration,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update block");
      }

      refetchBlocks();
    } catch (error) {
      console.error("Failed to resize block:", error);
      alert("調整失敗，請稍後再試");
    } finally {
      setResizingBlockId(null);
    }
  };

  // 點擊處理
  const handleDeadlineClick = (deadline: Deadline) => {
    setSelectedItem({ type: "deadline", data: deadline });
    setIsDetailPanelOpen(true);
  };

  const handleBlockClick = (block: StudyBlock) => {
    setSelectedItem({ type: "block", data: block });
    setIsDetailPanelOpen(true);
  };

  const handleEmptySlotClick = (date: Date, hour: number) => {
    if (isDragging) return;
    setClickedDate({ date, hour });
    setIsAddModalOpen(true);
  };

  // 今天的待辦事項
  const todayDeadlines = useMemo(() => {
    return deadlines.filter((d) => {
      return dayjs(d.dueDate).isSame(dayjs(), "day");
    });
  }, [deadlines]);

  // 計算 block 的位置和高度
  const calculateBlockPosition = (block: StudyBlock, date: Date) => {
    const blockStart = dayjs(block.startTime);
    const blockEnd = dayjs(block.endTime);
    const slotDate = dayjs(date);
    
    const startHour = blockStart.hour();
    const startMinute = blockStart.minute();
    const endHour = blockEnd.hour();
    const endMinute = blockEnd.minute();

    // 計算在該日期中的位置（相對於該日期的第一個小時）
    const slotStartHour = HOURS[0]; // 8
    const topOffset = (startHour - slotStartHour) * 64 + (startMinute / 60) * 64; // 64px per hour
    const height = (endHour - startHour) * 64 + ((endMinute - startMinute) / 60) * 64;

    // Debug: 檢查計算結果
    console.log(`Block ${block.title} position:`, {
      startHour,
      startMinute,
      endHour,
      endMinute,
      topOffset,
      height,
      blockStart: blockStart.format("YYYY-MM-DD HH:mm"),
      blockEnd: blockEnd.format("YYYY-MM-DD HH:mm"),
    });

    return { top: topOffset, height: Math.max(height, 32) }; // 最小高度 32px
  };

  // 載入狀態
  if (deadlinesLoading || blocksLoading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-light text-gray-700 mb-2">載入中...</div>
          <div className="text-sm text-gray-500">正在載入你的時程表</div>
        </div>
      </div>
    );
  }

  // 錯誤狀態
  if (deadlinesError || blocksError) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-light text-red-700 mb-2">載入失敗</div>
          <div className="text-sm text-gray-500 mb-4">{deadlinesError || blocksError}</div>
          <button
            onClick={() => {
              refetchDeadlines();
              refetchBlocks();
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
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
                    const dateStr = dayjs(date).format("YYYY-MM-DD");
                    const allBlocksForDate = getAllStudyBlocksForDate(date);

                    return (
                      <Droppable key={colIndex} droppableId={`${dateStr}-col`}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
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

                            {/* 時間格子容器 */}
                            <div className="relative" style={{ height: `${HOURS.length * 64}px` }}>
                              {/* 時間格子 */}
                              {HOURS.map((hour) => {
                                const slotDeadlines = getDeadlinesAtSlot(date, hour);
                                const slotBlocks = getStudyBlocksAtSlot(date, hour);

                                return (
                                  <div
                                    key={hour}
                                    className={`h-16 border-b border-gray-100 relative ${
                                      isDragging ? "" : "group cursor-pointer"
                                    }`}
                                    onClick={() => !isDragging && handleEmptySlotClick(date, hour)}
                                    style={{ minHeight: "64px" }}
                                  >
                                    {/* 空白格子的 hover 效果 */}
                                    {!isDragging && slotDeadlines.length === 0 && slotBlocks.length === 0 && (
                                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-blue-50 transition-opacity" />
                                    )}

                                    {/* Deadline 紅色提醒（顯示在 23:00） */}
                                    {slotDeadlines.map((deadline) => (
                                      <div
                                        key={`deadline-${deadline.id}`}
                                        className={`absolute left-1 right-1 ${DEADLINE_COLORS.bg} ${DEADLINE_COLORS.border} border-2 rounded-lg shadow-sm p-2 cursor-pointer hover:shadow-md transition-shadow z-30`}
                                        style={{
                                          top: "0px",
                                          height: "64px", // 1 小時高度
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeadlineClick(deadline);
                                        }}
                                      >
                                        <div className="text-xs font-semibold text-red-900 mb-1 truncate">
                                          ⚠️ {deadline.title}
                                        </div>
                                        <div className="text-[10px] text-red-800">
                                          <span className="font-medium">截止日</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}

                              {/* Study Blocks（絕對定位） */}
                              {allBlocksForDate.map((block, blockIndex) => {
                                const { top, height } = calculateBlockPosition(block, date);
                                const colors = TYPE_COLORS[block.type];
                                
                                // 檢查 block 是否在顯示範圍內
                                const blockStartHour = dayjs(block.startTime).hour();
                                const blockEndHour = dayjs(block.endTime).hour();
                                const minHour = HOURS[0]; // 8
                                const maxHour = HOURS[HOURS.length - 1]; // 24
                                
                                // 如果 block 完全在顯示範圍外，不顯示
                                if (blockEndHour < minHour || blockStartHour > maxHour) {
                                  return null;
                                }

                                return (
                                  <Draggable key={block.id} draggableId={block.id} index={blockIndex}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`absolute left-1 right-1 ${colors.bg} ${colors.border} border-2 rounded-lg shadow-sm p-2 cursor-move hover:shadow-md transition-shadow z-20 ${
                                          snapshot.isDragging ? "opacity-50" : ""
                                        }`}
                                        style={{
                                          ...provided.draggableProps.style,
                                          top: `${top}px`,
                                          height: `${height}px`,
                                          minHeight: "32px",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBlockClick(block);
                                        }}
                                      >
                                        <div className="text-xs font-medium text-gray-800 mb-1 truncate leading-tight">
                                          {block.title}
                                        </div>
                                        <div className="text-[10px] text-gray-600 space-y-0.5 leading-tight">
                                          <div className="flex items-center gap-1">
                                            <span className={`${colors.badge} px-1.5 py-0.5 rounded text-[10px]`}>
                                              {TYPE_NAMES[block.type]}
                                            </span>
                                            <span className="text-gray-500">
                                              {block.blockIndex}/{block.totalBlocks}
                                            </span>
                                          </div>
                                          <div className="truncate">
                                            {dayjs(block.startTime).format("HH:mm")} - {dayjs(block.endTime).format("HH:mm")}
                                          </div>
                                        </div>

                                        {/* 調整大小 handle */}
                                        <div
                                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-gray-300 hover:bg-gray-400 rounded-b-lg"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            handleResizeStart(block.id);
                                            const startY = e.clientY;
                                            const startHeight = height;
                                            const startDuration = block.duration;

                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                              const deltaY = moveEvent.clientY - startY;
                                              const deltaHours = deltaY / 64; // 64px per hour
                                              const newDuration = Math.max(0.5, Math.min(4, startDuration + deltaHours));
                                              const newHeight = newDuration * 64;
                                              
                                              // 視覺更新（不立即保存）
                                              const element = e.currentTarget.parentElement;
                                              if (element) {
                                                element.style.height = `${newHeight}px`;
                                              }
                                            };

                                            const handleMouseUp = (upEvent: MouseEvent) => {
                                              const deltaY = upEvent.clientY - startY;
                                              const deltaHours = deltaY / 64;
                                              const newDuration = Math.max(0.5, Math.min(4, startDuration + deltaHours));
                                              
                                              handleResize(block.id, newDuration);
                                              document.removeEventListener("mousemove", handleMouseMove);
                                              document.removeEventListener("mouseup", handleMouseUp);
                                            };

                                            document.addEventListener("mousemove", handleMouseMove);
                                            document.addEventListener("mouseup", handleMouseUp);
                                          }}
                                        />
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                            </div>

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
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
        {isDetailPanelOpen && selectedItem && (
          <DetailPanel
            item={selectedItem}
            token={token}
            onClose={() => {
              setIsDetailPanelOpen(false);
              setSelectedItem(null);
            }}
            onUpdate={() => {
              refetchDeadlines();
              refetchBlocks();
            }}
          />
        )}

        {/* 新增 Modal */}
        {isAddModalOpen && clickedDate && (
          <AddDeadlineModal
            clickedDate={clickedDate}
            token={token}
            onClose={() => {
              setIsAddModalOpen(false);
              setClickedDate(null);
            }}
            onSuccess={() => {
              refetchDeadlines();
              refetchBlocks();
            }}
          />
        )}
      </div>
    </DragDropContext>
  );
}

// Detail Panel Component
function DetailPanel({
  item,
  token,
  onClose,
  onUpdate,
}: {
  item: { type: "deadline" | "block"; data: Deadline | StudyBlock };
  token: string | null;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (item.type === "deadline") {
      const deadline = item.data as Deadline;
      setFormData({
        title: deadline.title,
        type: deadline.type,
        dueDate: dayjs(deadline.dueDate).format("YYYY-MM-DD"),
        dueTime: "23:00", // 預設 23:00
        estimatedHours: deadline.estimatedHours,
      });
    } else {
      const block = item.data as StudyBlock;
      setFormData({
        startTime: dayjs(block.startTime).format("YYYY-MM-DDTHH:mm"),
        endTime: dayjs(block.endTime).format("YYYY-MM-DDTHH:mm"),
        duration: block.duration,
        title: block.title,
      });
    }
  }, [item]);

  const handleUpdate = async () => {
    if (!token || !formData) return;

    try {
      let url: string;
      let body: any;

      if (item.type === "deadline") {
        const deadline = item.data as Deadline;
        url = `${window.location.origin}/api/deadlines/${deadline.id}?token=${encodeURIComponent(token)}`;
        body = {
          title: formData.title,
          type: formData.type,
          dueDate: new Date(`${formData.dueDate}T${formData.dueTime}:00`).toISOString(),
          estimatedHours: formData.estimatedHours,
        };
      } else {
        const block = item.data as StudyBlock;
        url = `${window.location.origin}/api/study-blocks/${block.id}?token=${encodeURIComponent(token)}`;
        body = {
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          duration: formData.duration,
          title: formData.title,
        };
      }

      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("更新失敗");
      }

      setIsEditing(false);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      alert("更新失敗，請稍後再試");
    }
  };

  const handleDelete = async () => {
    if (!token || !confirm("確定要刪除嗎？")) return;

    try {
      let url: string;
      if (item.type === "deadline") {
        const deadline = item.data as Deadline;
        url = `${window.location.origin}/api/deadlines/${deadline.id}?token=${encodeURIComponent(token)}`;
      } else {
        const block = item.data as StudyBlock;
        url = `${window.location.origin}/api/study-blocks/${block.id}?token=${encodeURIComponent(token)}`;
      }

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("刪除失敗");
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      alert("刪除失敗，請稍後再試");
    }
  };

  if (!formData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:w-96 h-[80vh] sm:h-auto rounded-t-2xl sm:rounded-l-2xl shadow-xl p-6 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isEditing ? (
          <div className="space-y-4">
            <h3 className="text-xl font-light text-gray-800 mb-4">編輯</h3>
            {item.type === "deadline" ? (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">標題</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">類型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="exam">考試</option>
                    <option value="assignment">作業</option>
                    <option value="project">專題</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">截止日期</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">截止時間</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">預估時間（小時）</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">標題</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">開始時間</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">結束時間</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">持續時間（小時）</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="4"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                儲存
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-light text-gray-800 mb-2">
                {item.type === "deadline" ? (item.data as Deadline).title : (item.data as StudyBlock).title}
              </h3>
              {item.type === "deadline" && (
                <div className="flex items-center gap-2 mb-4">
                  <span className={`${TYPE_COLORS[(item.data as Deadline).type].badge} px-3 py-1 rounded-lg text-sm`}>
                    {TYPE_NAMES[(item.data as Deadline).type]}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 text-sm">
              {item.type === "deadline" ? (
                <>
                  <div>
                    <span className="text-gray-500">截止日期：</span>
                    <span className="text-gray-800 ml-2">
                      {dayjs((item.data as Deadline).dueDate).format("YYYY 年 M 月 D 日 HH:mm")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">估計時間：</span>
                    <span className="text-gray-800 ml-2">{(item.data as Deadline).estimatedHours} 小時</span>
                  </div>
                  <div>
                    <span className="text-gray-500">剩餘時間：</span>
                    <span className="text-gray-800 ml-2">
                      {(() => {
                        const days = dayjs((item.data as Deadline).dueDate).diff(dayjs(), "day");
                        if (days < 0) return `已過期 ${Math.abs(days)} 天`;
                        if (days === 0) return "今天截止";
                        return `剩餘 ${days} 天`;
                      })()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-500">開始時間：</span>
                    <span className="text-gray-800 ml-2">
                      {dayjs((item.data as StudyBlock).startTime).format("YYYY 年 M 月 D 日 HH:mm")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">結束時間：</span>
                    <span className="text-gray-800 ml-2">
                      {dayjs((item.data as StudyBlock).endTime).format("YYYY 年 M 月 D 日 HH:mm")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">持續時間：</span>
                    <span className="text-gray-800 ml-2">{(item.data as StudyBlock).duration} 小時</span>
                  </div>
                  <div>
                    <span className="text-gray-500">進度：</span>
                    <span className="text-gray-800 ml-2">
                      {(item.data as StudyBlock).blockIndex} / {(item.data as StudyBlock).totalBlocks}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                編輯
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                刪除
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                關閉
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Add Deadline Modal Component
function AddDeadlineModal({
  clickedDate,
  token,
  onClose,
  onSuccess,
}: {
  clickedDate: { date: Date; hour: number };
  token: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "assignment" as "exam" | "assignment" | "project" | "other",
    dueDate: dayjs(clickedDate.date).format("YYYY-MM-DD"),
    dueTime: `${clickedDate.hour.toString().padStart(2, "0")}:00`,
    estimatedHours: 2,
  });

  const handleSubmit = async () => {
    if (!token || !formData.title) {
      alert("請填寫標題");
      return;
    }

    try {
      const url = `${window.location.origin}/api/deadlines?token=${encodeURIComponent(token)}`;
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}:00`);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          type: formData.type,
          dueDate: dueDateTime.toISOString(),
          estimatedHours: formData.estimatedHours,
        }),
      });

      if (!response.ok) {
        throw new Error("建立失敗");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Create error:", error);
      alert("建立失敗，請稍後再試");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-xl font-light text-gray-800 mb-6">新增 Deadline</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">標題</label>
            <input
              type="text"
              placeholder="輸入標題..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">類型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
            >
              <option value="exam">考試</option>
              <option value="assignment">作業</option>
              <option value="project">專題</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">截止日期</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">截止時間</label>
            <input
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">預估時間（小時）</label>
            <input
              type="number"
              placeholder="2"
              min="1"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 2 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            建立
          </button>
        </div>
      </div>
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
