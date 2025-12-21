/**
 * Hook for wallet selector dropdown state and position
 * 
 * Manages the open/close state of the wallet selector dropdown
 * and calculates its position based on the button reference.
 */

"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { usePathname } from "next/navigation";

export function useWalletSelector() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const walletButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isOpen && walletButtonRef.current) {
      const buttonRect = walletButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.bottom + 8, // 8px margin
        left: buttonRect.left + buttonRect.width / 2, // Center of button
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    dropdownPosition,
    walletButtonRef,
  };
}

