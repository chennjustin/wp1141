"use client";

import { useParams, useRouter } from "next/navigation";
import { useWalletHome } from "@/hooks/useWalletHome";
import { MonthlySummarySection } from "@/ui/components/wallet/MonthlySummarySection";
import { CarrierSection } from "@/ui/components/wallet/CarrierSection";
import { DailyTransactionsSection } from "@/ui/components/wallet/DailyTransactionsSection";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
import { Loading } from "@/ui/components/common/Loading";

export default function WalletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = (params?.walletId as string) ?? "";
  

  // Fetch all wallet home data using the hook
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

  // Get currency from wallet or monthly summary
  const currency = activeWallet?.defaultCurrency || "TWD";

  // Show loading state while initial data is being fetched
  if (isInitialLoading) {
    return <Loading />;
  }

  if (!activeWallet) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-red-500">錢包不存在或無權限存取</span>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <MonthlySummarySection
        year={year}
        month={month}
        incomeTotal={incomeTotal}
        expenseTotal={expenseTotal}
        currency={currency}
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
        walletId={activeWallet.id}
      />

      <FloatingAddButton
        onClick={handleAddTransaction}
        disabled={!activeWallet}
      />
    </div>
  );
}
