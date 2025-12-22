/**
 * Wallet selector dropdown component
 * 
 * Displays a dropdown menu for selecting wallets, showing pinned wallets,
 * option to view all wallets, and option to create a new wallet.
 */

"use client";

import { useRouter } from "next/navigation";
import type { Wallet } from "@/modules/wallet/domain/wallet.types";

interface WalletSelectorDropdownProps {
  isOpen: boolean;
  dropdownPosition: { top: number; left: number } | null;
  wallets: Wallet[];
  pinnedWalletIds: Set<string>;
  pinnedWalletIdsArray: string[];
  onClose: () => void;
  onWalletChange: (walletId: string) => void;
}

export function WalletSelectorDropdown({
  isOpen,
  dropdownPosition,
  wallets,
  pinnedWalletIds,
  pinnedWalletIdsArray,
  onClose,
  onWalletChange,
}: WalletSelectorDropdownProps) {
  const router = useRouter();

  if (!isOpen || !dropdownPosition) {
    return null;
  }

  const handleAllWallets = () => {
    onClose();
    router.push("/wallets/all");
  };

  const handleNewWallet = () => {
    onClose();
    router.push("/wallets/new");
  };

  // Create a map for quick wallet lookup
  const walletMap = new Map(wallets.map((wallet) => [wallet.id, wallet]));

  // Get pinned wallets in order, filtering out any that don't exist in wallets list
  const orderedPinnedWallets = pinnedWalletIdsArray
    .map((walletId) => walletMap.get(walletId))
    .filter((wallet): wallet is Wallet => wallet !== undefined);

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        onClick={onClose}
      />
      <div
        className="fixed z-[9999] rounded-lg shadow-lg min-w-[200px] max-h-[300px] overflow-y-auto border-0"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--card-bg)',
          color: 'var(--card-text)',
        }}
      >
        <div className="py-2">
          {/* Show all pinned wallets in order (max 5) */}
          {orderedPinnedWallets.map((wallet) => (
            <button
              key={wallet.id}
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'var(--card-text)' }}
              onClick={() => onWalletChange(wallet.id)}
            >
              {wallet.name}
            </button>
          ))}
          <div className="border-t border-gray-200 my-1" />
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity"
            style={{ color: 'var(--card-text)' }}
            onClick={handleAllWallets}
          >
            所有錢包
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm hover:opacity-80 transition-opacity"
            style={{ color: 'var(--card-text)' }}
            onClick={handleNewWallet}
          >
            + 新增錢包
          </button>
        </div>
      </div>
    </>
  );
}

