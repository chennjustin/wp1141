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

  // Get unpinned wallets (wallets not in pinnedWalletIds)
  const unpinnedWallets = wallets.filter(
    (wallet) => !pinnedWalletIds.has(wallet.id)
  );

  // Display logic according to rules:
  // 1. Always show all pinned wallets first
  // 2. If pinned wallets >= 3: only show pinned wallets
  // 3. If pinned wallets < 3: fill with unpinned wallets up to 3 total
  const walletsToDisplay: Wallet[] = [];
  
  // Step 1: Add all pinned wallets
  walletsToDisplay.push(...orderedPinnedWallets);
  
  // Step 2: If pinned wallets < 3, add unpinned wallets to fill up to 3
  if (orderedPinnedWallets.length < 3) {
    const remainingSlots = 3 - orderedPinnedWallets.length;
    const unpinnedToAdd = unpinnedWallets.slice(0, remainingSlots);
    walletsToDisplay.push(...unpinnedToAdd);
  }

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
          {/* Show wallets based on total count */}
          {walletsToDisplay.map((wallet) => (
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
          
          {/* Only show separator if there are wallets displayed */}
          {walletsToDisplay.length > 0 && (
            <div className="border-t border-gray-200 my-1" />
          )}
          
          {/* Always show "所有錢包" option */}
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

