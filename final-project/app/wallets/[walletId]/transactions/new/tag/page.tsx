"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { listTagsAction } from "@/modules/tag/routes/list-tags";
import { TagIcon } from "@/ui/utils/tag-icon";
import { DEFAULT_SYSTEM_TAGS, DEFAULT_SYSTEM_INCOME_TAGS } from "@/config/constants";

/**
 * Tag with iconKey (extended interface for UI)
 */
interface TagWithIcon {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  iconKey: string;
  createdBy?: string; // Optional, to identify system tags
}

/**
 * Get tag background color based on iconKey
 * Returns a low-saturation color for the tag icon background
 * This is a simple mapping - can be extended in the future
 */
function getTagColor(iconKey: string): string {
  // Low-saturation color palette for tag backgrounds
  // Uses full system tag IDs (e.g., "system-tag-food") for system tags.
  const colorMap: Record<string, string> = {
    // Default
    tag: "bg-gray-100",
    
    // System expense tags (Full IDs only)
    "system-tag-food": "bg-orange-100",
    "system-tag-drinks": "bg-amber-100",
    "system-tag-entertainment": "bg-purple-100",
    "system-tag-transportation": "bg-blue-100",
    "system-tag-shopping": "bg-sky-100",
    "system-tag-bills": "bg-amber-100",
    "system-tag-healthcare": "bg-red-100",
    "system-tag-education": "bg-indigo-100",
    "system-tag-travel": "bg-cyan-100",
    "system-tag-other": "bg-slate-200",
    
    // System income tags (Full IDs only)
    "system-tag-salary": "bg-green-100",
    "system-tag-bonus": "bg-emerald-100",
    "system-tag-investment": "bg-teal-100",
    "system-tag-gift": "bg-pink-100",
  };

  return colorMap[iconKey] || "bg-gray-100";
}

/**
 * Select Tag page
 * 
 * This is the first step in creating a new transaction.
 * User selects a tag (category) which determines the transaction type.
 */
export default function SelectTagPage() {
  const router = useRouter();
  const params = useParams();
  const walletId = params.walletId as string;

  const [transactionType, setTransactionType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [tags, setTags] = useState<TagWithIcon[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tags on mount
  useEffect(() => {
    async function fetchTags() {
      try {
        const result = await listTagsAction({ filter: "all" });
        if (result.success && result.data) {
          // Type assertion - the data from DB includes iconKey but type definition may not
          setTags(result.data as unknown as TagWithIcon[]);
        }
      } catch (err) {
        console.error("Failed to fetch tags", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, []);

  // Filter and sort tags by transaction type
  const filteredTags = useMemo(() => {
    const allTags = tags.filter((tag) => tag.type === transactionType);
    
    // Separate system tags (excluding "other") and custom tags
    // System tags are identified by: name in system tag list OR id starts with "system-tag-"
    const systemTags: TagWithIcon[] = [];
    let otherTag: TagWithIcon | null = null;
    const customTags: TagWithIcon[] = [];
    
    // Get system tag names, excluding "其他" which will be handled separately
    const allSystemTagNames = transactionType === "INCOME" 
      ? [...DEFAULT_SYSTEM_INCOME_TAGS]
      : [...DEFAULT_SYSTEM_TAGS];
    const systemTagNames = allSystemTagNames.filter(name => name !== "其他");
    
    allTags.forEach((tag) => {
      const isSystemTag = tag.id.startsWith("system-tag-") || 
                          systemTagNames.includes(tag.name as any);
      
      if (tag.name === "其他") {
        otherTag = tag;
      } else if (isSystemTag) {
        systemTags.push(tag);
      } else {
        // Custom tags: id doesn't start with "system-tag-" AND name not in system list
        customTags.push(tag);
      }
    });
    
    // Sort system tags by the order in constants (if in list), otherwise by name
    systemTags.sort((a, b) => {
      const indexA = systemTagNames.indexOf(a.name as any);
      const indexB = systemTagNames.indexOf(b.name as any);
      
      // If both in the list, sort by index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one in the list, it comes first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither in the list, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
    
    // Sort custom tags alphabetically by name
    customTags.sort((a, b) => a.name.localeCompare(b.name));
    
    // Combine: system tags -> other -> custom tags
    const result = [...systemTags];
    if (otherTag) {
      result.push(otherTag);
    }
    result.push(...customTags);
    
    return result;
  }, [tags, transactionType]);

  // Handle tag selection
  const handleTagSelect = (tagId: string, tagType: "EXPENSE" | "INCOME") => {
    router.push(`/wallets/${walletId}/transactions/new?tagId=${tagId}&type=${tagType}`);
  };

  // Handle type toggle
  const handleTypeToggle = (type: "EXPENSE" | "INCOME") => {
    setTransactionType(type);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-gray-500">載入中...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col -mx-4" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Header */}
      <header className="relative flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
          aria-label="返回"
        >
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Title */}
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-medium text-black">
          選擇分類
        </h1>
      </header>

      {/* Type Toggle */}
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTypeToggle("EXPENSE")}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              transactionType === "EXPENSE"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            支出
          </button>
          <button
            type="button"
            onClick={() => handleTypeToggle("INCOME")}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              transactionType === "INCOME"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            收入
          </button>
        </div>
      </div>

      {/* Tag Grid - Content-driven, not layout-driven */}
      <div className="flex-1 overflow-y-auto">
        {filteredTags.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-gray-500">暫無可用分類</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-4 py-4">
            {filteredTags.map((tag) => {
              const bgColor = getTagColor(tag.iconKey);
              return (
                <div
                  key={tag.id}
                  className="flex flex-col items-center gap-1.5"
                >
                  {/* Circular button - only clickable area */}
                  <button
                    type="button"
                    onClick={() => handleTagSelect(tag.id, tag.type)}
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColor} active:scale-95 transition-transform`}
                  >
                    <TagIcon
                      iconKey={tag.iconKey}
                      size={26}
                      color="currentColor"
                      className="text-gray-700"
                    />
                  </button>
                  {/* Tag name - not clickable */}
                  <span className="text-xs text-gray-700 text-center leading-tight pointer-events-none">{tag.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
