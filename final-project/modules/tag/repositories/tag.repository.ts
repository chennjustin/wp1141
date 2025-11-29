/**
 * Tag repository
 * 
 * This module encapsulates all database operations related to Tag entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import { SYSTEM_USER_ID, DEFAULT_SYSTEM_TAGS } from "@/config/constants";
import type { CreateTagData, UpdateTagData, TagFilters } from "../domain/tag.types";

/**
 * Ensure system user exists in database
 * Creates system user if it doesn't exist
 */
async function ensureSystemUserExists() {
  const systemUser = await prisma.user.findUnique({
    where: { id: SYSTEM_USER_ID },
  });

  if (!systemUser) {
    await prisma.user.create({
      data: {
        id: SYSTEM_USER_ID,
        name: "System",
        isDeleted: false,
      },
    });
  }

  return SYSTEM_USER_ID;
}

/**
 * Tag repository interface
 */
export const tagRepository = {
  /**
   * Find tag by ID
   */
  async findById(id: string) {
    return prisma.tag.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /**
   * Find all tags with filters
   */
  async findAll(filters: TagFilters = {}) {
    const where: any = {
      isDeleted: false,
    };

    // Apply filter based on tag type
    if (filters.filter === "system") {
      where.createdBy = SYSTEM_USER_ID;
    } else if (filters.filter === "user") {
      if (!filters.userId) {
        throw new Error("userId is required when filter is 'user'");
      }
      where.createdBy = filters.userId;
    } else {
      // 'all' or no filter - return all tags
      // No additional filter needed
    }

    return prisma.tag.findMany({
      where,
      include: {
        creator: {
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
   * Find tag by name (for checking duplicates)
   */
  async findByName(name: string) {
    return prisma.tag.findFirst({
      where: {
        name,
        isDeleted: false,
      },
    });
  },

  /**
   * Create tag
   */
  async create(data: CreateTagData, createdBy: string) {
    return prisma.tag.create({
      data: {
        name: data.name,
        createdBy,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /**
   * Update tag
   */
  async update(id: string, data: UpdateTagData) {
    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    return prisma.tag.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  /**
   * Soft delete tag
   */
  async softDelete(id: string) {
    return prisma.tag.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  },

  /**
   * Check if tag is a system tag
   */
  async isSystemTag(tagId: string): Promise<boolean> {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
      select: { createdBy: true },
    });

    return tag?.createdBy === SYSTEM_USER_ID;
  },

  /**
   * Ensure system tags exist
   * Creates default system tags if they don't exist
   */
  async ensureSystemTagsExist() {
    // Ensure system user exists first
    await ensureSystemUserExists();

    // Check which system tags already exist
    const existingTags = await prisma.tag.findMany({
      where: {
        name: {
          in: [...DEFAULT_SYSTEM_TAGS],
        },
        createdBy: SYSTEM_USER_ID,
        isDeleted: false,
      },
      select: {
        name: true,
      },
    });

    const existingNames = new Set(existingTags.map((tag) => tag.name));
    const tagsToCreate = DEFAULT_SYSTEM_TAGS.filter(
      (name) => !existingNames.has(name)
    );

    // Create missing system tags
    if (tagsToCreate.length > 0) {
      await prisma.tag.createMany({
        data: tagsToCreate.map((name) => ({
          name,
          createdBy: SYSTEM_USER_ID,
        })),
        skipDuplicates: true, // Skip if name conflict occurs
      });
    }
  },
};

