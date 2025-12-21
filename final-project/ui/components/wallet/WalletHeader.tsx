/**
 * Wallet header component
 * 
 * Displays the main navigation header with menu toggle, wallet selector, and user name.
 */

"use client";

import { useRef } from "react";

interface WalletHeaderProps {
  walletDisplayName: string;
  displayName: string;
  onMenuToggle: () => void;
  onWalletSelectorOpen: () => void;
  walletButtonRef: React.RefObject<HTMLButtonElement>;
}

export function WalletHeader({
  walletDisplayName,
  displayName,
  onMenuToggle,
  onWalletSelectorOpen,
  walletButtonRef,
}: WalletHeaderProps) {
  return (
    <header className="relative mb-4 flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Left: main menu toggle */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10"
        onClick={onMenuToggle}
        aria-label="Open main menu"
      >
        <span className="flex flex-col gap-0.5">
          <span className="h-0.5 w-4 rounded-full bg-black" />
          <span className="h-0.5 w-4 rounded-full bg-black" />
          <span className="h-0.5 w-4 rounded-full bg-black" />
        </span>
      </button>

      {/* Center: wallet selector - oval button, absolutely centered */}
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
      </div>

      {/* Right: user name or role text */}
      <div className="flex flex-col items-end text-right text-xs leading-snug text-black">
        <span className="font-semibold">{displayName}</span>
      </div>
    </header>
  );
}

