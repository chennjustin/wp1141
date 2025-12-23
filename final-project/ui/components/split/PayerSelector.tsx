"use client";

import type { WalletMember } from "@/modules/wallet/domain/wallet.types";
import type { CreateTransactionPayerData } from "@/modules/transaction/domain/transaction.types";
import { AmountSplitSelector } from "./AmountSplitSelector";

interface PayerSelectorProps {
  members: WalletMember[];
  totalAmount: number;
  currency: string;
  initialPayers?: CreateTransactionPayerData[];
  transactionName?: string;
  tagName?: string;
  onConfirm: (payers: CreateTransactionPayerData[]) => void;
  onCancel: () => void;
}

/**
 * PayerSelector component
 * 
 * Allows users to select who paid and how much each person paid.
 * This is a wrapper around AmountSplitSelector with mode="payer".
 */
export function PayerSelector({
  members,
  totalAmount,
  currency,
  initialPayers = [],
  transactionName,
  tagName,
  onConfirm,
  onCancel,
}: PayerSelectorProps) {
  return (
    <AmountSplitSelector
      members={members}
      totalAmount={totalAmount}
      currency={currency}
      title="誰先付錢"
      transactionName={transactionName}
      tagName={tagName}
      initialData={initialPayers.map((p) => ({ userId: p.payerId, amount: p.paidAmount }))}
      onConfirm={(data) => {
        onConfirm(
          data.map((item) => ({
            payerId: item.userId,
            paidAmount: item.amount,
          }))
        );
      }}
      onCancel={onCancel}
    />
  );
}

