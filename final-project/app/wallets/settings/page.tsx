"use client";

import { useState, useEffect } from "react";
import { useCarriers } from "@/hooks/useCarrier";
import type { DeviceCarrier } from "@/modules/carrier/domain/carrier.types";

/**
 * Settings page for wallet and user preferences.
 * 
 * This page allows users to manage their device carriers (載具).
 */
export default function SettingsPage() {
  const { carriers, loading, error, refetch } = useCarriers();
  const [carrierCode, setCarrierCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Set initial value from existing carrier if available
  useEffect(() => {
    if (carriers.length > 0 && !carrierCode) {
      setCarrierCode(carriers[0].carrierCode);
    }
  }, [carriers, carrierCode]);

  // Validate carrier code format: / + 7 alphanumeric characters
  const validateCarrierCode = (code: string): string | null => {
    const trimmed = code.trim();
    
    if (trimmed.length === 0) {
      return null; // Empty is allowed (for clearing)
    }

    if (trimmed.length !== 8) {
      return "載具編碼必須為 8 個字元（格式：/ + 7 個英數字）";
    }

    const validPattern = /^\/[A-Za-z0-9]{7}$/;
    if (!validPattern.test(trimmed)) {
      return "載具編碼格式必須為：/ + 7 個英數字（例如：/ABCDEF1）";
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCarrierCode(value);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = carrierCode.trim();
    
    // If empty, don't submit
    if (trimmedCode.length === 0) {
      setSubmitError("請輸入載具編碼");
      return;
    }

    const validationError = validateCarrierCode(trimmedCode);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const existingCarrier = carriers[0];
      
      if (existingCarrier) {
        // Update existing carrier
        const response = await fetch(`/api/carriers/${existingCarrier.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ carrierCode: trimmedCode }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "更新載具失敗");
        }
      } else {
        // Create new carrier
        const response = await fetch("/api/carriers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ carrierCode: trimmedCode }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "建立載具失敗");
        }
      }

      setSubmitSuccess(true);
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!carriers[0] || !confirm("確定要刪除載具嗎？")) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`/api/carriers/${carriers[0].id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "刪除載具失敗");
      }

      setCarrierCode("");
      setSubmitSuccess(true);
      await refetch();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "刪除失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-black">
        載入中...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold text-black">設定</h1>

      {/* Carrier settings section */}
      <section className="rounded-xl p-4" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}>
        <h2 className="mb-4 text-sm font-medium">載具設定</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="carrierCode" className="text-xs text-black/70">
              載具編碼
            </label>
            <input
              id="carrierCode"
              type="text"
              value={carrierCode}
              onChange={handleInputChange}
              placeholder="/ABCDEF1"
              maxLength={8}
              className="rounded border border-gray-300 px-3 py-2 text-sm font-mono focus:border-black focus:outline-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-black/50">
              格式：/ + 7 個英數字，共 8 個字元（例如：/ABCDEF1）
            </p>
          </div>

          {submitError && (
            <div className="rounded bg-red-50 p-2 text-xs text-red-600">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded bg-green-50 p-2 text-xs text-green-600">
              儲存成功
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
            >
              {isSubmitting ? "處理中..." : "儲存"}
            </button>
            {carriers.length > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                刪除
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
