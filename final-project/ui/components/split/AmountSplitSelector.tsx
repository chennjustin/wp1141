"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import type { WalletMember } from "@/modules/wallet/domain/wallet.types";
import type { CreateTransactionPayerData, CreateTransactionShareData } from "@/modules/transaction/domain/transaction.types";

interface AmountSplitSelectorProps {
  members: WalletMember[];
  totalAmount: number;
  currency: string;
  title: string;
  transactionName?: string;
  tagName?: string;
  initialData?: { userId: string; amount: number }[];
  initialMethod?: "even" | "custom";
  onConfirm: (data: { userId: string; amount: number }[], method: "even" | "custom") => void;
  onCancel: () => void;
}

/**
 * Unified component for selecting payers or shares
 * 
 * This component handles both payer selection (who paid) and share selection (how to split).
 * All wallet members are always visible and available for amount entry.
 */
export function AmountSplitSelector({
  members,
  totalAmount,
  currency,
  title,
  transactionName,
  tagName,
  initialData = [],
  initialMethod = "custom",
  onConfirm,
  onCancel,
}: AmountSplitSelectorProps) {
  // Get current user session
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  // Split method: "even" for average split, "custom" for custom amounts
  const [splitMethod, setSplitMethod] = useState<"even" | "custom">(initialMethod);

  // Amounts map: userId -> amount
  const [amounts, setAmounts] = useState<Map<string, number>>(() => {
    const map = new Map<string, number>();
    if (initialData.length > 0) {
      initialData.forEach((item) => {
        map.set(item.userId, item.amount);
      });
    } else if (currentUserId && totalAmount > 0) {
      // Default to current user paying/sharing the full amount if no initial data
      const currentUserMember = members.find((member) => member.user.id === currentUserId);
      if (currentUserMember) {
        map.set(currentUserMember.userId, totalAmount);
      }
    }
    return map;
  });

  // Use ref to track custom amounts before switching to even mode
  const customAmountsBeforeEvenRef = useRef<Map<string, number>>(new Map());

  // Update amounts when initial data changes
  useEffect(() => {
    if (initialData.length > 0) {
      const map = new Map<string, number>();
      initialData.forEach((item) => {
        map.set(item.userId, item.amount);
      });
      setAmounts(map);
    }
  }, [initialData]);

  // Set default to current user when session loads and no initial data
  useEffect(() => {
    if (initialData.length === 0 && currentUserId && totalAmount > 0) {
      setAmounts((prev) => {
        if (prev.size === 0) {
          const currentUserMember = members.find((member) => member.user.id === currentUserId);
          if (currentUserMember) {
            const map = new Map<string, number>();
            map.set(currentUserMember.userId, totalAmount);
            return map;
          }
        }
        return prev;
      });
    }
  }, [currentUserId, totalAmount, members, initialData.length]);

  // Calculate total
  const calculateTotal = (): number => {
    if (splitMethod === "even") {
      return totalAmount;
    }
    return Array.from(amounts.values()).reduce((sum, amount) => sum + amount, 0);
  };

  const total = calculateTotal();
  const remaining = totalAmount - total;

  // Format amount for display
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  // Handle amount change
  const handleAmountChange = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newAmounts = new Map(amounts);
    newAmounts.set(userId, Math.max(0, numValue));
    setAmounts(newAmounts);
    customAmountsBeforeEvenRef.current = new Map(newAmounts);
  };

  // Handle method change
  const handleMethodChange = (method: "even" | "custom") => {
    if (method === "even") {
      // Save current custom amounts before switching to even mode
      if (splitMethod === "custom" && amounts.size > 0) {
        customAmountsBeforeEvenRef.current = new Map(amounts);
      }
      setSplitMethod("even");
    } else {
      // Switching to custom mode
      if (splitMethod === "even" && customAmountsBeforeEvenRef.current.size > 0) {
        setAmounts(new Map(customAmountsBeforeEvenRef.current));
      } else if (amounts.size === 0) {
        // Initialize with average among all members if empty
        const amountPerPerson = members.length > 0 ? totalAmount / members.length : 0;
        const newAmounts = new Map<string, number>();
        members.forEach((member) => {
          newAmounts.set(member.userId, amountPerPerson);
        });
        setAmounts(newAmounts);
      }
      setSplitMethod("custom");
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    const data: { userId: string; amount: number }[] = 
      splitMethod === "even"
        ? members.map((member) => ({
            userId: member.userId,
            amount: totalAmount / members.length,
          }))
        : Array.from(amounts.entries())
            .filter(([_, amount]) => amount > 0)
            .map(([userId, amount]) => ({
              userId,
              amount,
            }));
    onConfirm(data, splitMethod);
  };

  // Validate before confirming
  const isValid = total > 0 && Math.abs(remaining) < 0.01;

  // Get amount to display for a member
  const getMemberAmount = (member: WalletMember): number => {
    if (splitMethod === "even") {
      return totalAmount / members.length;
    } else {
      return amounts.get(member.userId) || 0;
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--wallet-bg)' }}>
      {/* Header with back button */}
      <div className="bg-orange-100 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/10 transition-colors"
            aria-label="返回"
          >
            <svg
              className="h-5 w-5 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-base font-medium" style={{ color: 'var(--card-text)' }}>{title}</h2>
        </div>
        {/* Amount summary */}
        <div className="px-4 py-3 flex flex-col items-center justify-center">
          {(transactionName || tagName) && (
            <div className="text-xl font-medium text-black text-center mb-3">
              {transactionName || tagName}
            </div>
          )}
          <div className="text-2xl font-medium text-black text-center">
            {currency} {formatAmount(total)} / {currency} {formatAmount(totalAmount)}
          </div>
          {Math.abs(remaining) > 0.01 && (
            <div className="text-sm mt-2 text-black opacity-60">
              剩下 {currency} {formatAmount(Math.max(0, remaining))}
            </div>
          )}
        </div>
      </div>

      {/* Method selection buttons */}
      <div className="px-4 py-3 border-b border-gray-200 flex gap-2" style={{ backgroundColor: 'var(--card-bg)' }}>
        <button
          type="button"
          onClick={() => handleMethodChange("custom")}
          className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
            splitMethod === "custom"
              ? "bg-black text-white border-black"
              : "border-gray-200 hover:border-gray-400"
          }`}
          style={splitMethod !== "custom" ? {
            backgroundColor: 'var(--card-bg)',
            color: 'var(--card-text)',
          } : {}}
        >
          自訂金額
        </button>
        <button
          type="button"
          onClick={() => handleMethodChange("even")}
          className={`flex-1 h-9 px-3 text-sm rounded border transition-colors ${
            splitMethod === "even"
              ? "bg-black text-white border-black"
              : "border-gray-200 hover:border-gray-400"
          }`}
          style={splitMethod !== "even" ? {
            backgroundColor: 'var(--card-bg)',
            color: 'var(--card-text)',
          } : {}}
        >
          平均分攤
        </button>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ backgroundColor: 'var(--wallet-bg)' }}>
        {members.map((member) => {
          const amount = getMemberAmount(member);

          return (
            <div 
              key={member.userId} 
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--card-bg)' }}
            >
              {/* Avatar */}
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name}
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-black flex-shrink-0">
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Member name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--card-text)' }}>
                  {member.user.name}
                </div>
              </div>

              {/* Amount display/input */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>{currency}</span>
                {splitMethod === "even" ? (
                  <div className="w-24 h-9 px-2 text-sm flex items-center" style={{ color: 'var(--card-text)' }}>
                    {formatAmount(amount)}
                  </div>
                ) : (
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(member.userId, e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-24 h-9 px-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      color: 'var(--card-text)',
                      MozAppearance: 'textfield'
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div className="px-4 pt-3 pb-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isValid}
          className="w-full h-10 px-4 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: isValid ? '#000000' : '#9ca3af',
            color: isValid ? 'white' : 'white',
          }}
        >
          完成
        </button>
      </div>
    </div>
  );
}
