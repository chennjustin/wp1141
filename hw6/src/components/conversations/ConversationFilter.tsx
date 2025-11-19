"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface ConversationFilterProps {
  filters: {
    userId: string;
    startDate: string;
    endDate: string;
    search: string;
  };
  onFilterChange: (filters: {
    userId: string;
    startDate: string;
    endDate: string;
    search: string;
  }) => void;
}

export default function ConversationFilter({
  filters,
  onFilterChange,
}: ConversationFilterProps) {
  const handleChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const handleReset = () => {
    onFilterChange({
      userId: "",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">篩選條件</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="使用者 ID"
          placeholder="輸入使用者 ID"
          value={filters.userId}
          onChange={(e) => handleChange("userId", e.target.value)}
        />
        <Input
          label="開始日期"
          type="date"
          value={filters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
        <Input
          label="結束日期"
          type="date"
          value={filters.endDate}
          onChange={(e) => handleChange("endDate", e.target.value)}
        />
        <Input
          label="搜尋關鍵字"
          placeholder="搜尋訊息內容"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
        />
      </div>
      <div className="mt-4">
        <Button variant="secondary" onClick={handleReset}>
          重置篩選
        </Button>
      </div>
    </div>
  );
}

