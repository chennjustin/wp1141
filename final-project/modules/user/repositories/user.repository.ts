/**
 * User repository
 * 
 * This module encapsulates all database operations related to User entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";

/**
 * User repository interface
 */
export const userRepository = {
  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Find user by userID
   */
  async findByUserId(userId: string) {
    return (prisma.user as any).findUnique({
      where: { userID: userId },
    });
  },

  /**
   * Find user by userID with counts
   */
  async findByUserIdWithCounts(userId: string) {
    return (prisma.user as any).findUnique({
      where: { userID: userId },
      include: {
        _count: {
          select: {
            posts: { where: { deletedAt: null, isDraft: false } },
            followers: true,
            following: true,
          },
        },
      },
    });
  },

  /**
   * Check if userID exists
   */
  async checkUserIdExists(userId: string) {
    const user = await (prisma.user as any).findUnique({
      where: { userID: userId },
      select: { id: true },
    });
    return !!user;
  },

  /**
   * Update user by ID
   */
  async updateById(id: string, data: Record<string, unknown>) {
    return (prisma.user as any).update({
      where: { id },
      data,
    });
  },

  /**
   * Search users by query (userID or name)
   */
  async searchUsers(query: string, limit: number = 10) {
    const searchTerm = query.trim().toLowerCase();

    return (prisma.user as any).findMany({
      where: {
        OR: [
          { userID: { contains: searchTerm, mode: "insensitive" } },
          { name: { contains: searchTerm, mode: "insensitive" } },
        ],
        userID: { not: null },
      },
      select: {
        id: true,
        userID: true,
        name: true,
        image: true,
      },
      take: limit,
    });
  },
};

