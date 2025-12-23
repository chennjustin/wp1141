/**
 * Wallet header component
 * 
 * Displays the main navigation header with menu toggle, wallet selector, and user name.
 */

"use client";

import { useRef } from "react";
import { Pencil, Menu } from "lucide-react";

interface WalletHeaderProps {
  walletDisplayName: string;
  displayName: string;
  onMenuToggle: () => void;
  onWalletSelectorOpen: () => void;
  walletButtonRef: React.RefObject<HTMLButtonElement>;
  unreadCount?: number;
  currentWalletId?: string | null;
  onEditClick?: () => void;
}

export function WalletHeader({
  walletDisplayName,
  displayName,
  onMenuToggle,
  onWalletSelectorOpen,
  walletButtonRef,
  unreadCount = 0,
  currentWalletId,
  onEditClick,
}: WalletHeaderProps) {
  // Determine if settings icon should be shown
  // Show only when currentWalletId exists and onEditClick is provided
  const showSettingsIcon = currentWalletId && onEditClick;

  return (
    <header className="relative mb-1 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Left: main menu toggle */}
      <button
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
        onClick={onMenuToggle}
        aria-label="Open main menu"
      >
        <Menu className="h-5 w-5 text-black" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Center: wallet selector - absolutely centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          ref={walletButtonRef}
          type="button"
          className="relative inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-medium hover:opacity-80 active:opacity-90 focus:outline-none focus:ring-0 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={onWalletSelectorOpen}
          aria-label="Select wallet"
        >
          <span className="max-w-[140px] truncate">{walletDisplayName}</span>
        </button>
        {showSettingsIcon && (
          <button
            type="button"
            onClick={onEditClick}
            className="absolute left-full top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full hover:bg-black/10 active:bg-black/20 transition-colors focus:outline-none focus:ring-0"
            aria-label="Edit wallet settings"
          >
            <Pencil className="h-3.5 w-3.5 text-black/50" />
          </button>
        )}
      </div>

      {/* Right: user name or role text */}
      <div className="flex flex-col items-end text-right text-xs leading-snug text-black">
        <span className="font-semibold">{displayName}</span>
      </div>
    </header>
  );
}

