/**
 * Floating add button component
 * 
 * A floating action button for adding new transactions.
 */

"use client";

interface FloatingAddButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function FloatingAddButton({
  onClick,
  disabled = false,
}: FloatingAddButtonProps) {
  return (
    <button
      type="button"
      className="fixed bottom-8 left-1/2 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#E8E8E8] text-2xl text-black shadow-lg"
      onClick={onClick}
      aria-label="Add new transaction"
      disabled={disabled}
    >
      +
    </button>
  );
}

