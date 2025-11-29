/**
 * Transaction repository
 * 
 * This module encapsulates all database operations related to Transaction entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import type {
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionType,
  MonthlySummaryFilters,
} from "../domain/transaction.types";
import { DEFAULT_TRANSACTION_TYPE } from "../domain/transaction.types";

/**
 * Transaction repository interface
 */
export const transactionRepository = {
  /**
   * Find transaction by ID with all relations
   */
  async findById(id: string, userId?: string) {
    const where: any = {
      id,
      isDeleted: false,
    };

    // If userId is provided, ensure user has access to the wallet
    if (userId) {
      where.wallet = {
        members: {
          some: {
            userId,
            isDeleted: false,
          },
        },
      };
    }

    return prisma.transaction.findFirst({
      where,
      include: {
        tag: true,
        payers: {
          include: {
            payer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /**
   * Find transactions by wallet with filters
   */
  async findByWalletId(filters: TransactionFilters) {
    const where: any = {
      walletId: filters.walletId,
      isDeleted: false,
    };

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    // Tag filter
    if (filters.tagId !== undefined && filters.tagId !== null) {
      where.tagId = filters.tagId;
    }

    // Type filter
    if (filters.type !== undefined && filters.type !== null) {
      where.type = filters.type;
    }

    // User filter (for v2.0 - filter transactions where user is payer or share)
    if (filters.userId) {
      where.OR = [
        {
          payers: {
            some: {
              payerId: filters.userId,
            },
          },
        },
        {
          shares: {
            some: {
              userId: filters.userId,
            },
          },
        },
      ];
    }

    return prisma.transaction.findMany({
      where,
      include: {
        tag: true,
        payers: {
          include: {
            payer: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  },

  /**
   * Find last transaction by wallet ID (for default currency)
   */
  async findLastTransactionByWallet(walletId: string) {
    return prisma.transaction.findFirst({
      where: {
        walletId,
        isDeleted: false,
      },
      orderBy: {
        date: "desc",
      },
      select: {
        currency: true,
        rateToNTD: true,
      },
    });
  },

  /**
   * Find last exchange rate for a currency in a wallet
   */
  async findLastExchangeRate(walletId: string, currency: string) {
    return prisma.transaction.findFirst({
      where: {
        walletId,
        currency,
        rateToNTD: {
          not: null,
        },
        isDeleted: false,
      },
      orderBy: {
        date: "desc",
      },
      select: {
        rateToNTD: true,
      },
    });
  },

  /**
   * Create transaction with payers and shares
   */
  async create(
    userId: string,
    data: CreateTransactionData
  ) {
    return prisma.$transaction(async (tx) => {
      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          walletId: data.walletId,
          createdById: userId,
          date: new Date(data.date),
          amount: data.amount,
          currency: data.currency || "TWD",
          rateToNTD: data.rateToNTD ?? null,
          name: data.name || null,
          note: data.note || null,
          type: (data.type || DEFAULT_TRANSACTION_TYPE) as TransactionType,
          tagId: data.tagId,
        } as any,
      });

      // Create payers if provided
      if (data.payers && data.payers.length > 0) {
        await tx.transactionPayer.createMany({
          data: data.payers.map((payer) => ({
            transactionId: transaction.id,
            payerId: payer.payerId,
            paidAmount: payer.paidAmount,
          })),
        });
      } else {
        // Default payer is the creator
        await tx.transactionPayer.create({
          data: {
            transactionId: transaction.id,
            payerId: userId,
            paidAmount: data.amount,
          },
        });
      }

      // Create shares if provided
      if (data.shares && data.shares.length > 0) {
        await tx.transactionShare.createMany({
          data: data.shares.map((share) => ({
            transactionId: transaction.id,
            userId: share.userId,
            shareAmount: share.shareAmount,
          })),
        });
      } else {
        // Default share is the creator (equal to amount)
        await tx.transactionShare.create({
          data: {
            transactionId: transaction.id,
            userId: userId,
            shareAmount: data.amount,
          },
        });
      }

      return transaction;
    });
  },

  /**
   * Update transaction with payers and shares
   */
  async update(
    id: string,
    data: UpdateTransactionData
  ) {
    return prisma.$transaction(async (tx) => {
      // Update transaction fields
      const updateData: any = {};
      if (data.date !== undefined) {
        updateData.date = new Date(data.date);
      }
      if (data.amount !== undefined) {
        updateData.amount = data.amount;
      }
      if (data.currency !== undefined) {
        updateData.currency = data.currency;
      }
      if (data.rateToNTD !== undefined) {
        updateData.rateToNTD = data.rateToNTD;
      }
      if (data.name !== undefined) {
        updateData.name = data.name || null;
      }
      if (data.note !== undefined) {
        updateData.note = data.note || null;
      }
      if (data.type !== undefined) {
        updateData.type = data.type;
      }
      if (data.tagId !== undefined) {
        updateData.tagId = data.tagId;
      }

      const transaction = await tx.transaction.update({
        where: { id },
        data: updateData,
      });

      // Update payers if provided
      if (data.payers !== undefined) {
        // Delete existing payers
        await tx.transactionPayer.deleteMany({
          where: { transactionId: id },
        });

        // Create new payers
        if (data.payers.length > 0) {
          await tx.transactionPayer.createMany({
            data: data.payers.map((payer) => ({
              transactionId: id,
              payerId: payer.payerId,
              paidAmount: payer.paidAmount,
            })),
          });
        }
      }

      // Update shares if provided
      if (data.shares !== undefined) {
        // Delete existing shares
        await tx.transactionShare.deleteMany({
          where: { transactionId: id },
        });

        // Create new shares
        if (data.shares.length > 0) {
          await tx.transactionShare.createMany({
            data: data.shares.map((share) => ({
              transactionId: id,
              userId: share.userId,
              shareAmount: share.shareAmount,
            })),
          });
        }
      }

      return transaction;
    });
  },

  /**
   * Soft delete transaction
   */
  async softDelete(id: string) {
    return prisma.transaction.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  },

  /**
   * Check if user has access to wallet
   */
  async hasAccess(walletId: string, userId: string) {
    const membership = await prisma.walletUser.findFirst({
      where: {
        walletId,
        userId,
        isDeleted: false,
      },
    });
    return !!membership;
  },

  /**
   * Check if transaction exists
   */
  async exists(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    return transaction !== null && !transaction.isDeleted;
  },

  /**
   * Get transactions for monthly summary
   * Returns transactions within the specified month with basic fields for calculation
   */
  async findMonthlyTransactions(filters: MonthlySummaryFilters) {
    // Calculate start and end dates for the month
    const startDate = new Date(filters.year, filters.month - 1, 1);
    const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59, 999);

    return prisma.transaction.findMany({
      where: {
        walletId: filters.walletId,
        isDeleted: false,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        type: true,
        amount: true,
        currency: true,
        rateToNTD: true,
      } as any,
    });
  },
};


