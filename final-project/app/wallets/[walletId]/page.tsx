"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useWalletHome } from "@/hooks/useWalletHome";
import { useUser } from "@/hooks/useUser";
import { MonthlySummarySection } from "@/ui/components/wallet/MonthlySummarySection";
import { CarrierSection } from "@/ui/components/wallet/CarrierSection";
import { DailyTransactionsSection } from "@/ui/components/wallet/DailyTransactionsSection";
import { FloatingAddButton } from "@/ui/components/wallet/FloatingAddButton";
import { WalletHomeLoading } from "@/ui/components/wallet/WalletHomeLoading";
import { WalletRole } from "@/modules/wallet/domain/wallet.types";

export default function WalletDetailPage() {
  const params = useParams();
  const walletId = (params?.walletId as string) ?? "";
  const { profile } = useUser();

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

  // Check if this is a personal wallet
  const isPersonalWallet = useMemo(() => {
    if (!activeWallet || !profile) return false;
    return (
      activeWallet.name === "我的錢包" ||
      (activeWallet.members.length === 1 &&
        activeWallet.members[0].userId === profile.id &&
        activeWallet.members[0].role === WalletRole.OWNER)
    );
  }, [activeWallet, profile]);

  // Show loading state while initial data is being fetched
  if (isInitialLoading) {
    return <WalletHomeLoading />;
  }

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

      {/* Carrier section - only for personal wallets */}
      {isPersonalWallet && (
        <CarrierSection
          carrierCode={carrierCode}
          hasRealCarrier={hasRealCarrier}
          carrierLoading={carrierLoading}
          brightCarrier={brightCarrier}
          onToggleBrightness={() => setBrightCarrier((prev) => !prev)}
        />
      )}

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
