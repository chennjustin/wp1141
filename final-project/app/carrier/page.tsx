"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BarcodeDisplay from "@/components/BarcodeDisplay";

interface DeviceCarrier {
  id: string;
  carrierCode: string;
  lastSyncedAt: string | null;
  createdAt: string;
}

export default function CarrierPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [carriers, setCarriers] = useState<DeviceCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 表單狀態
  const [carrierCode, setCarrierCode] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  // 檢查登入狀態
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // 載入載具列表
  const fetchCarriers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/carrier/list");
      const result = await response.json();

      if (result.success) {
        setCarriers(result.data);
      } else {
        setError(result.error || "無法載入載具列表");
      }
    } catch (err) {
      console.error("載入載具列表失敗:", err);
      setError("載入載具列表時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchCarriers();
    }
  }, [status]);

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    // 前端驗證
    if (!carrierCode.trim()) {
      setError("請輸入載具條碼");
      setSubmitting(false);
      return;
    }

    if (!carrierCode.startsWith("/")) {
      setError("載具條碼應以 / 開頭");
      setSubmitting(false);
      return;
    }

    if (!verifyCode.trim() || verifyCode.length !== 16) {
      setError("載具驗證碼必須為16碼");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/carrier/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carrierCode: carrierCode.trim(),
          verifyCode: verifyCode.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("載具新增成功！");
        setCarrierCode("");
        setVerifyCode("");
        // 重新載入列表
        await fetchCarriers();
      } else {
        setError(result.error || "新增載具失敗");
      }
    } catch (err) {
      console.error("新增載具失敗:", err);
      setError("新增載具時發生錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            載具管理
          </h1>
          <p className="text-gray-600">
            管理您的手機條碼載具
          </p>
        </div>

        {/* 新增載具表單 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            新增載具
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="carrierCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                載具條碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="carrierCode"
                value={carrierCode}
                onChange={(e) => setCarrierCode(e.target.value)}
                placeholder="/AB1234CD"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                請輸入手機條碼，格式：/AB1234CD
              </p>
            </div>

            <div>
              <label
                htmlFor="verifyCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                載具驗證碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="verifyCode"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="16碼驗證碼"
                maxLength={16}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                請輸入16碼載具驗證碼
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:cursor-not-allowed"
            >
              {submitting ? "新增中..." : "新增載具"}
            </button>
          </form>
        </div>

        {/* 載具列表 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            我的載具 ({carriers.length})
          </h2>

          {carriers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">尚未新增任何載具</p>
              <p className="text-sm text-gray-400">
                請使用上方表單新增您的第一個載具
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {carriers.map((carrier) => (
                <div
                  key={carrier.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        手機條碼
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(carrier.createdAt).toLocaleDateString("zh-TW")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 font-mono">
                      {carrier.carrierCode}
                    </h3>
                  </div>

                  {/* 條碼顯示 */}
                  <div className="my-6">
                    <BarcodeDisplay carrierCode={carrier.carrierCode} />
                  </div>

                  {carrier.lastSyncedAt && (
                    <p className="text-xs text-gray-500 mt-4">
                      最後同步：{" "}
                      {new Date(carrier.lastSyncedAt).toLocaleString("zh-TW")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

