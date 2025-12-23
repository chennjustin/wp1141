"use client";

import type { WalletMember } from "@/modules/wallet/domain/wallet.types";
import type { CreateTransactionShareData } from "@/modules/transaction/domain/transaction.types";
import { AmountSplitSelector } from "./AmountSplitSelector";

interface ShareSelectorProps {
  members: WalletMember[];
  totalAmount: number;
  currency: string;
  initialPayers?: CreateTransactionShareData[]; // Using same prop name as PayerSelector for consistency
  transactionName?: string;
  tagName?: string;
  initialMethod?: "even" | "custom";
  onConfirm: (shares: CreateTransactionShareData[], method: "even" | "custom") => void;
  onCancel: () => void;
}

/**
 * ShareSelector component
 * 
 * Allows users to select how to split the expense.
 * Supports two modes:
 * - Even split: All selected members split equally
 * - Custom amounts: Each member can input a specific amount
 * 
 * This is a wrapper around AmountSplitSelector with mode="share".
 * Uses the same prop naming as PayerSelector for consistency.
 */
export function ShareSelector({
  members,
  totalAmount,
  currency,
  initialPayers = [],
  transactionName,
  tagName,
  initialMethod = "custom",
  onConfirm,
  onCancel,
}: ShareSelectorProps) {
  return (
    <AmountSplitSelector
      members={members}
      totalAmount={totalAmount}
      currency={currency}
      title="如何分"
      transactionName={transactionName}
      tagName={tagName}
      initialData={initialPayers.map((s) => ({ userId: s.userId, amount: s.shareAmount }))}
      initialMethod={initialMethod}
      onConfirm={(data, method) => {
        onConfirm(
          data.map((item) => ({
            userId: item.userId,
            shareAmount: item.amount,
          })),
          method
        );
      }}
      onCancel={onCancel}
    />
  );
}

