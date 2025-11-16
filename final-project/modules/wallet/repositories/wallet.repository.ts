/**
 * Wallet repository
 * 
 * This module encapsulates all database operations related to Wallet entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import type { CreateWalletData, UpdateWalletData } from "../domain/wallet.types";

/**
 * Wallet repository interface
 */
export const walletRepository = {
  /**
   * Find wallet by ID with members
   */
  async findById(id: string, userId?: string) {
    const where: any = {
      id,
      isDeleted: false,
    };

    if (userId) {
      where.members = {
        some: {
          userId,
          isDeleted: false,
        },
      };
    }

    return prisma.wallet.findFirst({
      where,
      include: {
        members: {
          where: { isDeleted: false },
          include: {
            user: true,
          },
        },
      },
    });
  },

  /**
   * Find wallets by user ID
   */
  async findByUserId(userId: string) {
    return prisma.wallet.findMany({
      where: {
        isDeleted: false,
        members: {
          some: {
            userId,
            isDeleted: false,
          },
        },
      },
      include: {
        members: {
          where: { isDeleted: false },
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  /**
   * Create wallet
   */
  async create(data: CreateWalletData) {
    return prisma.wallet.create({
      data: {
        name: data.name,
        defaultCurrency: data.defaultCurrency || "TWD",
      },
    });
  },

  /**
   * Create wallet membership
   */
  async createMembership(
    walletId: string,
    userId: string,
    role: "OWNER" | "MEMBER" | "VIEWER" = "OWNER"
  ) {
    return prisma.walletUser.create({
      data: {
        walletId,
        userId,
        role,
      },
    });
  },

  /**
   * Update wallet
   */
  async update(id: string, data: UpdateWalletData) {
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.defaultCurrency !== undefined) {
      updateData.defaultCurrency = data.defaultCurrency.trim();
    }

    return prisma.wallet.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Check if user is wallet owner
   */
  async isOwner(walletId: string, userId: string) {
    const membership = await prisma.walletUser.findFirst({
      where: {
        walletId,
        userId,
        role: "OWNER",
        isDeleted: false,
      },
    });
    return !!membership;
  },

  /**
   * Check wallet existence
   */
  async exists(id: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { id },
    });
    return wallet !== null && !wallet.isDeleted;
  },

  /**
   * Count active transactions for wallet
   */
  async countActiveTransactions(walletId: string) {
    return prisma.transaction.count({
      where: {
        walletId,
        isDeleted: false,
      },
    });
  },

  /**
   * Soft delete wallet and all memberships
   */
  async softDelete(walletId: string) {
    return prisma.$transaction(async (tx) => {
      // Soft delete all wallet membership records
      await tx.walletUser.updateMany({
        where: {
          walletId,
          isDeleted: false,
        },
        data: {
          isDeleted: true,
        },
      });

      // Soft delete the wallet itself
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          isDeleted: true,
        },
      });
    });
  },

  /**
   * Clear default wallet reference for users
   */
  async clearDefaultWalletReference(walletId: string) {
    return prisma.user.updateMany({
      where: {
        defaultWalletId: walletId,
      },
      data: {
        defaultWalletId: null,
      },
    });
  },

  /**
   * Set user's default wallet
   */
  async setDefaultWallet(userId: string, walletId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { defaultWalletId: walletId },
    });
  },
};

