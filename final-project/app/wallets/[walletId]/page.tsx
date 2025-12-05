"use client";

import { useParams } from "next/navigation";
import { useWalletHome } from "@/hooks/useWalletHome";
import { MonthlySummarySection } from "@/ui/components/wallet/MonthlySummarySection";
import { CarrierSection } from "@/ui/components/wallet/CarrierSection";
import { DailyTransactionsSection } from "@/ui/components/wallet/DailyTransactionsSection";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
import { WalletHomeLoading } from "@/ui/components/wallet/WalletHomeLoading";

/**
 * Wallet detail page
 * 
 * This page displays a specific wallet's overview including monthly summary,
 * carrier section, and daily transactions list.
 * 
 * Uses the same hook and component structure as the wallet home page for consistency.
 */
export default function WalletDetailPage() {
  const params = useParams();
  const walletId = params?.walletId as string | null;

  const {
    // Monthly summary data
    year,
    month,
    incomeTotal,
    expenseTotal,
    summaryLoading,
    summaryError,
    
    // Carrier data
    carrierCode,
    hasRealCarrier,
    carrierLoading,
    
    // Daily transactions data
    displayTransactions,
    transactionsLoading,
    transactionsError,
    
    // UI state
    showAmounts,
    setShowAmounts,
    brightCarrier,
    setBrightCarrier,
    
    // Loading state
    isInitialLoading,
    
    // Handlers
    handleAddTransaction,
    
    // Wallet data
    activeWallet,
  } = useWalletHome(walletId);

  // Show loading state while initial data is being fetched
  if (isInitialLoading) {
    return <WalletHomeLoading />;
  }

  // Show error state if wallet doesn't exist or user doesn't have access
  if (!activeWallet) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">錢包不存在或無權限存取</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <MonthlySummarySection
        year={year}
        month={month}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        loading={summaryLoading}
        error={summaryError}
        showAmounts={showAmounts}
        onToggleAmounts={() => setShowAmounts((prev) => !prev)}
      />

      <CarrierSection
        carrierCode={carrierCode}
        hasRealCarrier={hasRealCarrier}
        carrierLoading={carrierLoading}
        brightCarrier={brightCarrier}
        onToggleBrightness={() => setBrightCarrier((prev) => !prev)}
      />

      <DailyTransactionsSection
        transactions={displayTransactions}
        loading={transactionsLoading}
        error={transactionsError}
      />

      <FloatingAddButton
        onClick={handleAddTransaction}
        disabled={!activeWallet}
      />
    </div>
  );
}
