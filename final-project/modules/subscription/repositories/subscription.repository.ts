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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Create subscription
   */
  async create(userId: string, data: CreateSubscriptionData) {
    return prisma.subscription.create({
      data: {
        walletId: data.walletId,
        userId,
        tagId: data.tagId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        intervalMonths: data.intervalMonths ?? 1,
        nextBilling: data.nextBilling ? new Date(data.nextBilling) : new Date(data.startDate),
        name: data.name || null,
      },
      include: {
        tag: true,
      },
    });
  },

  /**
   * Update subscription
   */
  async update(id: string, data: UpdateSubscriptionData) {
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

    return prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        tag: true,
      },
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

