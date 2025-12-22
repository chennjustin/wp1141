/**
 * Side menu component
 * 
 * Displays the side navigation menu with user profile, menu items, and logout button.
 */

"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface SideMenuProps {
  isOpen: boolean;
  userName: string;
  userImage: string | null | undefined;
  currentWalletId: string | null;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export function SideMenu({
  isOpen,
  userName,
  userImage,
  currentWalletId,
  onClose,
  onNavigate,
}: SideMenuProps) {
  const router = useRouter();

  const handleHomeClick = () => {
    onClose();
    if (currentWalletId) {
      router.push(`/wallets/${currentWalletId}`);
    } else {
      router.push("/wallets");
    }
  };

  const handleLogout = async () => {
    onClose();
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-2/3 max-w-[280px] p-4 shadow-xl md:absolute md:inset-y-0 md:left-0 md:rounded-l-[3rem] md:rounded-r-none transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ backgroundColor: 'var(--wallet-bg)' }}
    >
      {/* User block with home icon */}
      <div className="mt-2 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {userImage ? (
            <img
              src={userImage}
              alt={userName || "User"}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-semibold text-black">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black">
              {userName || "User"}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5"
          onClick={handleHomeClick}
          aria-label="Go to wallet home"
        >
          {/* House icon */}
          <svg
            className="h-5 w-5 text-black"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
      </div>

      {/* Menu buttons */}
      <nav className="flex flex-col gap-3 text-sm">
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={() => onNavigate("/wallets/notifications")}
        >
          通知
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={() => onNavigate("/wallets/history")}
        >
          收支明細
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={() => onNavigate("/wallets/statistics")}
        >
          統計
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={() => {
            if (currentWalletId) {
              onNavigate(`/wallets/${currentWalletId}/subscriptions`);
            } else {
              // Fallback - should not happen if currentWalletId exists
              onNavigate("/wallets");
            }
          }}
        >
          訂閱清單
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-3 py-2 text-left hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--card-bg)', color: 'var(--card-text)' }}
          onClick={() => onNavigate("/wallets/settings")}
        >
          設定
        </button>
        <div className="border-t border-gray-200 my-1" />
        <button
          type="button"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-left text-red-700 hover:bg-red-100"
          onClick={handleLogout}
        >
          登出
        </button>
      </nav>
    </aside>
  );
}

