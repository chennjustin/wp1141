/**
 * Unified Loading component for the entire application
 * 
 * Provides consistent loading states across all pages with customizable options.
 */

"use client";

interface LoadingProps {
  /**
   * Whether to display as full screen (min-h-screen)
   * If false, uses h-full for container-based loading
   */
  fullScreen?: boolean;
  
  /**
   * Custom loading message
   * Default: "載入中..." for Chinese, "Loading..." for English
   */
  message?: string;
  
  /**
   * Whether to show spinner animation
   * Default: true
   */
  showSpinner?: boolean;
  
  /**
   * Custom className for the container
   */
  className?: string;
}

export function Loading({
  fullScreen = false,
  message,
  showSpinner = true,
  className = "",
}: LoadingProps) {
  const defaultMessage = message ?? "載入中...";
  const containerClass = fullScreen ? "min-h-screen" : "h-full";
  
  return (
    <div
      className={`flex items-center justify-center ${containerClass} ${className}`}
      style={{ backgroundColor: fullScreen ? 'var(--wallet-loading-bg)' : 'transparent' }}
    >
      <div className="flex flex-col items-center gap-2">
        {showSpinner && (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        )}
        <span className="text-sm text-black/80">{defaultMessage}</span>
      </div>
    </div>
  );
}

