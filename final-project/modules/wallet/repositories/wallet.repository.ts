/**
 * Wallet repository
 * 
 * This module encapsulates all database operations related to Wallet entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import { SYSTEM_USER_ID } from "@/config/constants";
import type { CreateWalletData, UpdateWalletData } from "../domain/wallet.types";
import { WalletUserStatus } from "../domain/wallet.types";

/**
 * Wallet repository interface
 */
export const walletRepository = {
  /**
   * Find wallet by ID with members
   * System user can access all wallets
   */
  async findById(id: string, userId?: string) {
    const where: any = {
      id,
      isDeleted: false,
    };

    // System user can access all wallets
    if (userId && userId !== SYSTEM_USER_ID) {
      where.members = {
        some: {
          userId,
          isDeleted: false,
          status: {
            in: ["OWNER", "ACCEPTED"],
          },
        },
      };
    }

    return prisma.wallet.findFirst({
      where,
      include: {
        members: {
          where: { 
            isDeleted: false,
            status: {
              in: ["OWNER", "ACCEPTED"],
            },
          },
          include: {
            user: true,
          },
        },
      },
    });
  },

  /**
   * Find wallets by user ID
   * System user can see all wallets
   * Only returns wallets where user has OWNER or ACCEPTED status
   */
  async findByUserId(userId: string) {
    const where: any = {
      isDeleted: false,
    };

    // System user can see all wallets
    if (userId !== SYSTEM_USER_ID) {
      where.members = {
        some: {
          userId,
          isDeleted: false,
            status: {
              in: ["OWNER", "ACCEPTED"],
            },
        },
      };
    }

    return prisma.wallet.findMany({
      where,
      include: {
        members: {
          where: { 
            isDeleted: false,
            status: {
              in: ["OWNER", "ACCEPTED"],
            },
          },
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
        description: data.description || null,
        note: data.note || null,
      },
    });
  },

  /**
   * Create wallet membership
   */
  async createMembership(
    walletId: string,
    userId: string,
    role: "OWNER" | "MEMBER" | "VIEWER" = "OWNER",
    status: WalletUserStatus = WalletUserStatus.OWNER
  ) {
    return prisma.walletUser.create({
      data: {
        walletId,
        userId,
        role,
        status,
      },
    });
  },

  /**
   * Create wallet membership with status
   */
  async createMembershipWithStatus(
    walletId: string,
    userId: string,
    role: "OWNER" | "MEMBER" | "VIEWER",
    status: WalletUserStatus
  ) {
    return prisma.walletUser.create({
      data: {
        walletId,
        userId,
        role,
        status,
      },
    });
  },

  /**
   * Find membership by wallet and user
   */
  async findMembershipByWalletAndUser(walletId: string, userId: string) {
    return prisma.walletUser.findUnique({
      where: {
        walletId_userId: {
          walletId,
          userId,
        },
      },
    });
  },

  /**
   * Update membership status
   */
  async updateMembershipStatus(
    walletId: string,
    userId: string,
    status: WalletUserStatus
  ) {
    return prisma.walletUser.update({
      where: {
        walletId_userId: {
          walletId,
          userId,
        },
      },
      data: {
        status,
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
    if (data.description !== undefined) {
      updateData.description = data.description.trim() || null;
    }
    if (data.note !== undefined) {
      updateData.note = data.note.trim() || null;
    }

    return prisma.wallet.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Check if user is wallet owner
   * System user is considered owner of all wallets
   */
  async isOwner(walletId: string, userId: string) {
    // System user is considered owner of all wallets
    if (userId === SYSTEM_USER_ID) {
      return true;
    }

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

  /**
   * Clear user's default wallet
   */
  async clearDefaultWallet(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { defaultWalletId: null },
    });
  },

  /**
   * Get user's pinned wallets
   */
  async getPinnedWallets(userId: string) {
    return prisma.userPinnedWallet.findMany({
      where: { userId },
      include: {
        wallet: {
          include: {
            members: {
              where: {
                isDeleted: false,
                status: {
                  in: ["OWNER", "ACCEPTED"],
                },
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  },

  /**
   * Count user's pinned wallets
   * @param excludeMyWallet - If true, exclude "我的錢包" from the count
   */
  async countPinnedWallets(userId: string, excludeMyWallet: boolean = false) {
    const where: any = { userId };
    
    if (excludeMyWallet) {
      // Exclude "我的錢包" from count
      where.wallet = {
        name: { not: "我的錢包" },
      };
    }
    
    return prisma.userPinnedWallet.count({
      where,
    });
  },

  /**
   * Pin a wallet for user
   * Returns true if successful, false if limit reached
   * @param excludeMyWalletFromLimit - If true, exclude "我的錢包" from limit check
   * @param skipLimitCheck - If true, skip limit check entirely (for "我的錢包")
   */
  async pinWallet(
    userId: string, 
    walletId: string, 
    excludeMyWalletFromLimit: boolean = false,
    skipLimitCheck: boolean = false
  ): Promise<boolean> {
    // Check if already pinned
    const existing = await prisma.userPinnedWallet.findUnique({
      where: {
        userId_walletId: {
          userId,
          walletId,
        },
      },
    });

    if (existing) {
      return true; // Already pinned
    }

    // Check limit (max 5, but "我的錢包" doesn't count toward limit if excludeMyWalletFromLimit is true)
    // Skip limit check entirely if skipLimitCheck is true (for "我的錢包")
    if (!skipLimitCheck) {
      const count = await this.countPinnedWallets(userId, excludeMyWalletFromLimit);
      if (count >= 5) {
        return false; // Limit reached
      }
    }

    // Get max order
    const maxOrder = await prisma.userPinnedWallet.findFirst({
      where: { userId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (maxOrder?.order ?? -1) + 1;

    // Create pinned wallet
    await prisma.userPinnedWallet.create({
      data: {
        userId,
        walletId,
        order: newOrder,
      },
    });

    return true;
  },

  /**
   * Unpin a wallet for user
   */
  async unpinWallet(userId: string, walletId: string) {
    return prisma.userPinnedWallet.delete({
      where: {
        userId_walletId: {
          userId,
          walletId,
        },
      },
    });
  },

  /**
   * Check if wallet is pinned by user
   */
  async isWalletPinned(userId: string, walletId: string): Promise<boolean> {
    const pinned = await prisma.userPinnedWallet.findUnique({
      where: {
        userId_walletId: {
          userId,
          walletId,
        },
      },
    });
    return !!pinned;
  },
};

