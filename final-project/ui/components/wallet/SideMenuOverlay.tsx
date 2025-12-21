/**
 * Side menu overlay component
 * 
 * Displays a semi-transparent overlay behind the side menu.
 */

"use client";

interface SideMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenuOverlay({ isOpen, onClose }: SideMenuOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/40 md:absolute md:rounded-[3rem] transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    />
  );
}

