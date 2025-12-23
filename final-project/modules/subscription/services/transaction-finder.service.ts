/**
 * Transaction Finder Service
 * 
 * Utility functions for finding transactions related to subscriptions.
 */

import { prisma } from "@/lib/prisma";
import { SubscriptionHistory, Transaction } from "@prisma/client";

/**
 * Find all transactions created by a subscription
 * Uses SubscriptionHistory to identify the relationship
 */
export async function findTransactionsBySubscription(
  subscriptionId: string,
  tx?: any
): Promise<(Transaction & { payers: any[]; shares: any[] })[]> {
  const client = tx || prisma;
  
  const histories = await client.subscriptionHistory.findMany({
    where: {
      subscriptionId,
      transactionId: { not: null },
      status: "SUCCESS", // Only sync successful transactions
    },
    include: {
      transaction: {
        where: {
          isDeleted: false, // Only sync non-deleted transactions
        },
        include: {
          payers: true,
          shares: true,
        },
      },
    },
  });

  // Filter out histories where transaction is null or deleted
  return histories
    .filter((h: SubscriptionHistory & { transaction: (Transaction & { payers: any[]; shares: any[] }) | null }) => 
      h.transaction && !h.transaction.isDeleted
    )
    .map((h: SubscriptionHistory & { transaction: (Transaction & { payers: any[]; shares: any[] }) | null }) => 
      h.transaction!
    );
}

