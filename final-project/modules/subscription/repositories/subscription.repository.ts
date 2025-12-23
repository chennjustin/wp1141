/**
 * Subscription repository
 * 
 * This module encapsulates all database operations related to Subscription entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import { SYSTEM_USER_ID } from "@/config/constants";
import type {
  CreateSubscriptionData,
  UpdateSubscriptionData,
  SubscriptionFilters,
} from "../domain/subscription.types";

/**
 * Subscription repository interface
 */
export const subscriptionRepository = {
  /**
   * Find subscription by ID with all relations
   */
  async findById(id: string, userId?: string) {
    const where: any = {
      id,
      isDeleted: false,
    };

    // System user can access all subscriptions
    // If userId is provided and not system user, ensure user has access to the wallet
    if (userId && userId !== SYSTEM_USER_ID) {
      where.wallet = {
        members: {
          some: {
            userId,
            isDeleted: false,
          },
        },
      };
    }

    return prisma.subscription.findFirst({
      where,
      include: {
        tag: true,
        wallet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
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
      },
    });
  },

  /**
   * Find subscriptions by wallet with filters
   */
  async findByWalletId(filters: SubscriptionFilters) {
    const where: any = {
      walletId: filters.walletId,
      isDeleted: filters.includeDeleted ? undefined : false,
    };

    // User filter
    if (filters.userId && filters.userId !== SYSTEM_USER_ID) {
      where.userId = filters.userId;
    }

    return prisma.subscription.findMany({
      where,
      include: {
        tag: true,
        wallet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Find all subscriptions by wallet (including deleted) for history page
   */
  async findAllByWalletId(walletId: string, userId?: string) {
    const where: any = {
      walletId,
    };

    // User filter
    if (userId && userId !== SYSTEM_USER_ID) {
      where.userId = userId;
    }

    return prisma.subscription.findMany({
      where,
      include: {
        tag: true,
        wallet: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Find last exchange rate for a currency in a wallet (to default currency)
   */
  async findLastExchangeRateToDefaultCurrency(walletId: string, currency: string) {
    // First try to find from subscriptions
    const lastSubscription = await prisma.subscription.findFirst({
      where: {
        walletId,
        currency,
        rateToDefaultCurrency: {
          not: null,
        },
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        rateToDefaultCurrency: true,
      },
    });

    if (lastSubscription?.rateToDefaultCurrency) {
      return { rateToDefaultCurrency: lastSubscription.rateToDefaultCurrency };
    }

    // Fallback to transactions
    const { transactionRepository } = await import("@/modules/transaction/repositories/transaction.repository");
    return transactionRepository.findLastExchangeRateToDefaultCurrency(walletId, currency);
  },

  /**
   * Create subscription
   */
  async create(userId: string, data: CreateSubscriptionData) {
    return prisma.$transaction(async (tx) => {
      // Create the subscription
      const subscription = await tx.subscription.create({
        data: {
          walletId: data.walletId,
          userId,
          tagId: data.tagId,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          rateToDefaultCurrency: data.rateToDefaultCurrency ?? null,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          intervalMonths: data.intervalMonths ?? 1,
          nextBilling: data.nextBilling ? new Date(data.nextBilling) : new Date(data.startDate),
          name: data.name || null,
        },
      });

      // Create payers if provided
      if (data.payers && data.payers.length > 0) {
        await tx.subscriptionPayer.createMany({
          data: data.payers.map((payer) => ({
            subscriptionId: subscription.id,
            payerId: payer.payerId,
            paidAmount: payer.paidAmount,
          })),
        });
      } else {
        // Default payer is the creator
        await tx.subscriptionPayer.create({
          data: {
            subscriptionId: subscription.id,
            payerId: userId,
            paidAmount: data.amount,
          },
        });
      }

      // Create shares if provided
      if (data.shares && data.shares.length > 0) {
        await tx.subscriptionShare.createMany({
          data: data.shares.map((share) => ({
            subscriptionId: subscription.id,
            userId: share.userId,
            shareAmount: share.shareAmount,
          })),
        });
      } else {
        // Default share is the creator (equal to amount)
        await tx.subscriptionShare.create({
          data: {
            subscriptionId: subscription.id,
            userId: userId,
            shareAmount: data.amount,
          },
        });
      }

      // Return subscription with relations
      return tx.subscription.findUnique({
        where: { id: subscription.id },
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
        },
      });
    });
  },

  /**
   * Update subscription
   */
  async update(id: string, data: UpdateSubscriptionData) {
    return prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (data.tagId !== undefined) {
        updateData.tagId = data.tagId;
      }
      if (data.type !== undefined) {
        updateData.type = data.type;
      }
      if (data.amount !== undefined) {
        updateData.amount = data.amount;
      }
      if (data.currency !== undefined) {
        updateData.currency = data.currency;
      }
      if (data.rateToDefaultCurrency !== undefined) {
        updateData.rateToDefaultCurrency = data.rateToDefaultCurrency;
      }
      if (data.startDate !== undefined) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate ? new Date(data.endDate) : null;
      }
      if (data.intervalMonths !== undefined) {
        updateData.intervalMonths = data.intervalMonths;
      }
      if (data.nextBilling !== undefined) {
        updateData.nextBilling = new Date(data.nextBilling);
      }
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.isDeleted !== undefined) {
        updateData.isDeleted = data.isDeleted;
      }

      // Update subscription
      await tx.subscription.update({
        where: { id },
        data: updateData,
      });

      // Update payers if provided
      if (data.payers !== undefined) {
        // Delete existing payers
        await tx.subscriptionPayer.deleteMany({
          where: { subscriptionId: id },
        });

        // Create new payers
        if (data.payers.length > 0) {
          await tx.subscriptionPayer.createMany({
            data: data.payers.map((payer) => ({
              subscriptionId: id,
              payerId: payer.payerId,
              paidAmount: payer.paidAmount,
            })),
          });
        } else {
          // If no payers provided, create default (creator pays all)
          const subscription = await tx.subscription.findUnique({
            where: { id },
            select: { userId: true, amount: true },
          });
          if (subscription) {
            await tx.subscriptionPayer.create({
              data: {
                subscriptionId: id,
                payerId: subscription.userId,
                paidAmount: subscription.amount,
              },
            });
          }
        }
      }

      // Update shares if provided
      if (data.shares !== undefined) {
        // Delete existing shares
        await tx.subscriptionShare.deleteMany({
          where: { subscriptionId: id },
        });

        // Create new shares
        if (data.shares.length > 0) {
          await tx.subscriptionShare.createMany({
            data: data.shares.map((share) => ({
              subscriptionId: id,
              userId: share.userId,
              shareAmount: share.shareAmount,
            })),
          });
        } else {
          // If no shares provided, create default (creator shares all)
          const subscription = await tx.subscription.findUnique({
            where: { id },
            select: { userId: true, amount: true },
          });
          if (subscription) {
            await tx.subscriptionShare.create({
              data: {
                subscriptionId: id,
                userId: subscription.userId,
                shareAmount: subscription.amount,
              },
            });
          }
        }
      }

      // Return subscription with relations
      return tx.subscription.findUnique({
        where: { id },
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
        },
      });
    });
  },

  /**
   * Soft delete subscription
   */
  async softDelete(id: string) {
    return prisma.subscription.update({
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
   * Check if subscription exists
   */
  async exists(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });
    return subscription !== null && !subscription.isDeleted;
  },
};

