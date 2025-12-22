/**
 * Wallet service
 * 
 * This module contains business logic for Wallet operations.
 * It orchestrates repository calls and implements domain rules
 * such as authorization, validation, and data transformation.
 */

import { walletRepository } from "../repositories/wallet.repository";
import { notificationRepository } from "@/modules/notification/repositories/notification.repository";
import { userRepository } from "@/modules/user/repositories/user.repository";
import type {
  Wallet,
  CreateWalletData,
  UpdateWalletData,
  WalletServiceResult,
} from "../domain/wallet.types";
import { WalletUserStatus } from "../domain/wallet.types";
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
    const description = data.description?.trim() || null;
    const note = data.note?.trim() || null;
    const invitedUserIds = data.invitedUserIds || [];

    // Validate note length if provided
    if (note !== null && note.length > 50) {
      return {
        success: false,
        error: "Note must not exceed 50 characters",
      };
    }

    // Validate invited users if provided
    if (invitedUserIds.length > 0) {
      // Verify all invited users exist
      for (const invitedUserId of invitedUserIds) {
        const user = await userRepository.findById(invitedUserId);
        if (!user || user.isDeleted) {
          return {
            success: false,
            error: `User ${invitedUserId} not found`,
          };
        }
        // Don't allow inviting yourself
        if (invitedUserId === userId) {
          return {
            success: false,
            error: "Cannot invite yourself to a wallet",
          };
        }
      }
    }

    try {
      // Get creator user info for notification messages
      const creatorUser = await userRepository.findById(userId);
      if (!creatorUser) {
        return {
          success: false,
          error: "Creator user not found",
        };
      }

      // Create wallet and membership in a transaction
      const wallet = await prisma.$transaction(async (tx) => {
        // Create the wallet record
        const createdWallet = await tx.wallet.create({
          data: {
            name: trimmedName,
            defaultCurrency,
            description,
            note,
          },
        });

        // Attach the creator as OWNER in WalletUser with OWNER status
        await tx.walletUser.create({
          data: {
            walletId: createdWallet.id,
            userId,
            role: "OWNER",
            status: WalletUserStatus.OWNER,
          },
        });

        // Invite users if provided
        if (invitedUserIds.length > 0) {
          for (const invitedUserId of invitedUserIds) {
            // Check if user is already in the wallet
            const existingMembership = await tx.walletUser.findUnique({
              where: {
                walletId_userId: {
                  walletId: createdWallet.id,
                  userId: invitedUserId,
                },
              },
            });

            if (existingMembership) {
              // If already exists and not deleted, skip
              if (!existingMembership.isDeleted) {
                continue;
              }
              // If soft deleted, update it
              await tx.walletUser.update({
                where: {
                  walletId_userId: {
                    walletId: createdWallet.id,
                    userId: invitedUserId,
                  },
                },
                data: {
                  role: "MEMBER",
                  status: WalletUserStatus.PENDING,
                  isDeleted: false,
                },
              });
            } else {
              // Create new membership with PENDING status
              await tx.walletUser.create({
                data: {
                  walletId: createdWallet.id,
                  userId: invitedUserId,
                  role: "MEMBER",
                  status: WalletUserStatus.PENDING,
                },
              });
            }

            // Create notification for invited user
            const invitedUser = await tx.user.findUnique({
              where: { id: invitedUserId },
              select: { name: true },
            });

            await tx.notification.create({
              data: {
                userId: invitedUserId,
                type: "WALLET_INVITATION",
                message: `${creatorUser.name} 邀請您加入錢包「${trimmedName}」`,
              },
            });
          }
        }

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
      (data.defaultCurrency === undefined || data.defaultCurrency === null) &&
      (data.description === undefined || data.description === null) &&
      (data.note === undefined || data.note === null)
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

    if (data.description !== undefined) {
      updateData.description = typeof data.description === "string" 
        ? data.description.trim() || undefined 
        : undefined;
    }

    if (data.note !== undefined) {
      const trimmedNote = typeof data.note === "string" ? data.note.trim() : "";
      // Validate note length if provided
      if (trimmedNote.length > 50) {
        return {
          success: false,
          error: "Note must not exceed 50 characters",
        };
      }
      updateData.note = trimmedNote || undefined;
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

  /**
   * Invite users to an existing wallet
   * Only wallet owner can invite users
   */
  async inviteUsersToWallet(
    walletId: string,
    userId: string,
    invitedUserIds: string[]
  ): Promise<WalletServiceResult<Wallet>> {
    // Check authorization - only owner can invite
    const isOwner = await walletRepository.isOwner(walletId, userId);
    if (!isOwner) {
      return {
        success: false,
        error: "Only wallet owner can invite users",
      };
    }

    // Check wallet exists
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) {
      return {
        success: false,
        error: "Wallet not found",
      };
    }

    // Validate invited users
    if (!Array.isArray(invitedUserIds) || invitedUserIds.length === 0) {
      return {
        success: false,
        error: "At least one user ID is required",
      };
    }

    // Get inviter user info
    const inviterUser = await userRepository.findById(userId);
    if (!inviterUser) {
      return {
        success: false,
        error: "Inviter user not found",
      };
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const invitedUserId of invitedUserIds) {
          // Verify user exists
          const invitedUser = await tx.user.findUnique({
            where: { id: invitedUserId },
          });

          if (!invitedUser || invitedUser.isDeleted) {
            throw new Error(`User ${invitedUserId} not found`);
          }

          // Don't allow inviting yourself
          if (invitedUserId === userId) {
            throw new Error("Cannot invite yourself to a wallet");
          }

          // Check if user is already in the wallet
          const existingMembership = await tx.walletUser.findUnique({
            where: {
              walletId_userId: {
                walletId,
                userId: invitedUserId,
              },
            },
          });

          if (existingMembership) {
            // If already exists and status is ACCEPTED, skip
            if (!existingMembership.isDeleted && existingMembership.status === WalletUserStatus.ACCEPTED) {
              continue;
            }
            // If PENDING or REJECTED, update to PENDING
            if (!existingMembership.isDeleted) {
              await tx.walletUser.update({
                where: {
                  walletId_userId: {
                    walletId,
                    userId: invitedUserId,
                  },
                },
                data: {
                  role: "MEMBER",
                  status: WalletUserStatus.PENDING,
                  isDeleted: false,
                },
              });
            } else {
              // If soft deleted, restore and set to PENDING
              await tx.walletUser.update({
                where: {
                  walletId_userId: {
                    walletId,
                    userId: invitedUserId,
                  },
                },
                data: {
                  role: "MEMBER",
                  status: WalletUserStatus.PENDING,
                  isDeleted: false,
                },
              });
            }
          } else {
            // Create new membership with PENDING status
            await tx.walletUser.create({
              data: {
                walletId,
                userId: invitedUserId,
                role: "MEMBER",
                status: WalletUserStatus.PENDING,
              },
            });
          }

          // Create notification for invited user
          await tx.notification.create({
            data: {
              userId: invitedUserId,
              type: "WALLET_INVITATION",
              message: `${inviterUser.name} 邀請您加入錢包「${wallet.name}」`,
            },
          });
        }
      });

      // Fetch updated wallet with members
      const updatedWallet = await walletRepository.findById(walletId);
      return {
        success: true,
        data: updatedWallet as Wallet,
      };
    } catch (error) {
      console.error("Error inviting users to wallet:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to invite users to wallet",
      };
    }
  },

  /**
   * Accept wallet invitation
   * Only the invited user can accept their own invitation
   */
  async acceptWalletInvitation(
    walletId: string,
    userId: string
  ): Promise<WalletServiceResult<Wallet>> {
    // Check membership exists and is PENDING
    const membership = await walletRepository.findMembershipByWalletAndUser(walletId, userId);
    if (!membership) {
      return {
        success: false,
        error: "Wallet invitation not found",
      };
    }

    if (membership.isDeleted) {
      return {
        success: false,
        error: "Wallet invitation has been deleted",
      };
    }

    if (membership.status !== WalletUserStatus.PENDING) {
      return {
        success: false,
        error: `Cannot accept invitation with status ${membership.status}`,
      };
    }

    try {
      // Update membership status to ACCEPTED
      await walletRepository.updateMembershipStatus(walletId, userId, WalletUserStatus.ACCEPTED);

      // Mark related notifications as read
      await notificationRepository.markWalletInvitationAsRead(userId, walletId);

      // Fetch updated wallet
      const updatedWallet = await walletRepository.findById(walletId, userId);
      return {
        success: true,
        data: updatedWallet as Wallet,
      };
    } catch (error) {
      console.error("Error accepting wallet invitation:", error);
      return {
        success: false,
        error: "Failed to accept wallet invitation",
      };
    }
  },

  /**
   * Reject wallet invitation
   * Only the invited user can reject their own invitation
   */
  async rejectWalletInvitation(
    walletId: string,
    userId: string
  ): Promise<WalletServiceResult<void>> {
    // Check membership exists and is PENDING
    const membership = await walletRepository.findMembershipByWalletAndUser(walletId, userId);
    if (!membership) {
      return {
        success: false,
        error: "Wallet invitation not found",
      };
    }

    if (membership.isDeleted) {
      return {
        success: false,
        error: "Wallet invitation has been deleted",
      };
    }

    if (membership.status !== WalletUserStatus.PENDING) {
      return {
        success: false,
        error: `Cannot reject invitation with status ${membership.status}`,
      };
    }

    try {
      // Update membership status to REJECTED
      await walletRepository.updateMembershipStatus(walletId, userId, WalletUserStatus.REJECTED);

      // Mark related notifications as read
      await notificationRepository.markWalletInvitationAsRead(userId, walletId);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error rejecting wallet invitation:", error);
      return {
        success: false,
        error: "Failed to reject wallet invitation",
      };
    }
  },
};

