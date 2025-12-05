/**
 * Wallet home page loading component
 * 
 * Displays a loading state while initial data is being fetched.
 */

"use client";

export function WalletHomeLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        <span className="text-sm text-black/50">載入中...</span>
      </div>
    </div>
  );
}

