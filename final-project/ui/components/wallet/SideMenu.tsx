/**
 * Side menu component
 * 
 * Displays the side navigation menu with user profile, menu items, and logout button.
 */

"use client";

import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { 
  Bell, 
  FileText, 
  BarChart3, 
  Calendar, 
  Settings,
  LogOut,
  BookOpen,
  Home
} from "lucide-react";

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
  const pathname = usePathname();
  const { count: unreadCount } = useUnreadNotificationCount();

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
      className={`fixed inset-y-0 left-0 z-50 w-2/3 max-w-[280px] h-full shadow-xl md:absolute md:inset-y-0 md:left-0 md:top-0 md:bottom-0 md:h-full md:rounded-l-[3rem] md:rounded-r-none transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      style={{ backgroundColor: 'var(--wallet-bg)' }}
    >
      {/* User block with home icon */}
      <div className="mt-2 mb-6 px-5">
        <div className="flex items-center justify-between mb-3">
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
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            onClick={handleHomeClick}
            aria-label="Go to wallet home"
          >
            <Home className="h-4 w-4 text-gray-500" strokeWidth={2} />
          </button>
        </div>
        <div className="border-t border-gray-200" />
      </div>

      {/* Menu buttons */}
      <nav className="flex flex-col text-sm">
        {/* Menu item component */}
        {[
          {
            id: "accounting",
            path: currentWalletId ? `/wallets/${currentWalletId}` : "/wallets",
            label: "記帳",
            icon: BookOpen,
          },
          {
            id: "notifications",
            path: "/wallets/notifications",
            label: "通知",
            icon: Bell,
            badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : null,
          },
          {
            id: "history",
            path: currentWalletId ? `/wallets/${currentWalletId}/history` : "/wallets/history",
            label: "收支明細",
            icon: FileText,
          },
          {
            id: "statistics",
            path: currentWalletId ? `/wallets/${currentWalletId}/statistics` : "/wallets/statistics",
            label: "統計",
            icon: BarChart3,
          },
          {
            id: "subscriptions",
            path: currentWalletId ? `/wallets/${currentWalletId}/subscriptions` : "/wallets",
            label: "訂閱清單",
            icon: Calendar,
          },
          {
            id: "settings",
            path: "/wallets/settings",
            label: "設定",
            icon: Settings,
          },
        ].map((item) => {
          const Icon = item.icon;
          
          // Determine if this menu item is active based on current pathname
          let isActive = false;
          if (item.id === "notifications") {
            isActive = pathname === "/wallets/notifications";
          } else if (item.id === "history") {
            // Match both /wallets/history and /wallets/[walletId]/history
            isActive = pathname === item.path || pathname?.includes("/history");
          } else if (item.id === "statistics") {
            // Match both /wallets/statistics and /wallets/[walletId]/statistics
            isActive = pathname === item.path || pathname?.includes("/statistics");
          } else if (item.id === "settings") {
            isActive = pathname === "/wallets/settings";
          } else if (item.id === "subscriptions") {
            isActive = pathname?.includes("/subscriptions") && !pathname?.includes("/new") && !pathname?.includes("/edit");
          } else if (item.id === "accounting") {
            // Active only when pathname exactly matches the wallet detail page path
            // This ensures it's only active on /wallets/[walletId], not on sub-routes
            isActive = pathname === item.path;
          }
          
          return (
            <button
              key={item.id}
              type="button"
              className={`relative flex items-center justify-between px-5 py-2.5 text-left transition-colors ${
                isActive 
                  ? "bg-orange-50" 
                  : "hover:bg-gray-100"
              }`}
              style={isActive ? {} : { color: 'var(--card-text)' }}
              onClick={() => onNavigate(item.path)}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? "text-amber-700" : "text-black/60"}`} />
                <span className={isActive ? "text-amber-700 font-medium" : ""}>
                  {item.label}
                </span>
                {item.badge && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <svg
                className={`h-4 w-4 ${isActive ? "text-amber-700" : "text-black/40"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          );
        })}
        
        <div className="border-t border-gray-200 my-1" />
        <button
          type="button"
          className="flex items-center gap-3 px-5 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>登出</span>
        </button>
      </nav>
    </aside>
  );
}

