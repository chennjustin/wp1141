"use client";

import { useWalletHome } from "@/hooks/useWalletHome";
import { MonthlySummarySection } from "@/ui/components/wallet/MonthlySummarySection";
import { CarrierSection } from "@/ui/components/wallet/CarrierSection";
import { DailyTransactionsSection } from "@/ui/components/wallet/DailyTransactionsSection";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
import { WalletHomeLoading } from "@/ui/components/wallet/WalletHomeLoading";

/**
 * Wallet home page.
 *
 * This page renders the main wallet overview according to the mobile-first
 * wireframe: monthly summary, carrier section, and daily transactions list
 * with a floating action button to add a new transaction.
 */
export default function WalletHomePage() {
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
  } = useWalletHome();

  // Show loading state while initial data is being fetched
  if (isInitialLoading) {
    return <WalletHomeLoading />;
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
