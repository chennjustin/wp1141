/**
 * Wallet service
 * 
 * This module contains business logic for Wallet operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 */

import { walletRepository } from "../repositories/wallet.repository";
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  WalletServiceResult,
} from "../domain/wallet.types";
import { DEFAULT_CURRENCY } from "@/config/constants";
import { prisma } from "@/lib/prisma";

/**
 * Wallet service interface
 */
export const walletService = {
  /**
   * Get user's wallets
   */
  async getUserWallets(userId: string): Promise<Wallet[]> {
    const wallets = await walletRepository.findByUserId(userId);
    return wallets as Wallet[];
  },

  /**
   * Get wallet by ID with authorization check
   */
  async getWalletById(
    walletId: string,
    userId: string
  ): Promise<WalletServiceResult<Wallet>> {
    const wallet = await walletRepository.findById(walletId, userId);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found or access denied",
      };
    }

    return {
      success: true,
      data: wallet as Wallet,
    };
  },

  /**
   * Create wallet for user
   */
  async createWallet(
    userId: string,
    data: CreateWalletData
  ): Promise<WalletServiceResult<Wallet>> {
    // Validate wallet name
    if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
      return {
        success: false,
        error: "Wallet name is required",
      };
    }

    const trimmedName = data.name.trim();
    const defaultCurrency = data.defaultCurrency || DEFAULT_CURRENCY;

    try {
      // Create wallet and membership in a transaction
      const wallet = await prisma.$transaction(async (tx) => {
        // Create the wallet record
        const createdWallet = await tx.wallet.create({
          data: {
            name: trimmedName,
            defaultCurrency,
          },
        });

        // Attach the creator as OWNER in WalletUser
        await tx.walletUser.create({
          data: {
            walletId: createdWallet.id,
            userId,
            role: "OWNER",
          },
        });

        // Optionally set this wallet as the user's default wallet
        if (data.setAsDefault) {
          await tx.user.update({
            where: { id: userId },
            data: { defaultWalletId: createdWallet.id },
          });
        }

        return createdWallet;
      });

      // Fetch wallet with members for response
      const walletWithMembers = await walletRepository.findById(wallet.id);
      return {
        success: true,
        data: walletWithMembers as Wallet,
      };
    } catch (error) {
      console.error("Error creating wallet:", error);
      return {
        success: false,
        error: "Failed to create wallet",
      };
    }
  },

  /**
   * Update wallet (only owner can update)
   */
  async updateWallet(
    walletId: string,
    userId: string,
    data: UpdateWalletData
  ): Promise<WalletServiceResult<Wallet>> {
    // Check authorization
    const isOwner = await walletRepository.isOwner(walletId, userId);
    if (!isOwner) {
      return {
        success: false,
        error: "Only wallet owner can update this wallet",
      };
    }

    // Validate update data
    if (
      (data.name === undefined || data.name === null) &&
      (data.defaultCurrency === undefined || data.defaultCurrency === null)
    ) {
      return {
        success: false,
        error: "No fields provided to update",
      };
    }

    const updateData: UpdateWalletData = {};

    if (typeof data.name === "string" && data.name.trim().length > 0) {
      updateData.name = data.name.trim();
    }

    if (
      typeof data.defaultCurrency === "string" &&
      data.defaultCurrency.trim().length > 0
    ) {
      updateData.defaultCurrency = data.defaultCurrency.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: "No valid fields provided to update",
      };
    }

    try {
      const updatedWallet = await walletRepository.update(walletId, updateData);
      return {
        success: true,
        data: updatedWallet as Wallet,
      };
    } catch (error) {
      console.error("Error updating wallet:", error);
      return {
        success: false,
        error: "Failed to update wallet",
      };
    }
  },

  /**
   * Delete wallet (only owner can delete)
   */
  async deleteWallet(
    walletId: string,
    userId: string
  ): Promise<WalletServiceResult<void>> {
    // Check authorization
    const isOwner = await walletRepository.isOwner(walletId, userId);
    if (!isOwner) {
      return {
        success: false,
        error: "Only wallet owner can delete this wallet",
      };
    }

    // Check wallet existence
    const exists = await walletRepository.exists(walletId);
    if (!exists) {
      return {
        success: false,
        error: "Wallet not found or already deleted",
      };
    }

    // Check for active transactions
    const activeTransactionCount =
      await walletRepository.countActiveTransactions(walletId);
    if (activeTransactionCount > 0) {
      return {
        success: false,
        error: "Cannot delete wallet with existing transactions",
      };
    }

    try {
      // Soft delete wallet and memberships
      await walletRepository.softDelete(walletId);

      // Clear default wallet references
      await walletRepository.clearDefaultWalletReference(walletId);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting wallet:", error);
      return {
        success: false,
        error: "Failed to delete wallet",
      };
    }
  },
};

