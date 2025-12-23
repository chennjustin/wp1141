/**
 * Tag repository
 * 
 * This module encapsulates all database operations related to Tag entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import {
  SYSTEM_USER_ID,
  DEFAULT_SYSTEM_TAGS,
  SYSTEM_TAG_IDS,
  DEFAULT_SYSTEM_INCOME_TAGS,
  SYSTEM_INCOME_TAG_IDS,
} from "@/config/constants";
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
   * Create a single system tag with fixed ID
   */
  async createSystemTag(
    name: (typeof DEFAULT_SYSTEM_TAGS)[number] | (typeof DEFAULT_SYSTEM_INCOME_TAGS)[number],
    type: "EXPENSE" | "INCOME" = "EXPENSE"
  ) {
    const tagId = SYSTEM_TAG_IDS[name as keyof typeof SYSTEM_TAG_IDS] || 
                  SYSTEM_INCOME_TAG_IDS[name as keyof typeof SYSTEM_INCOME_TAG_IDS];
    if (!tagId) {
      throw new Error(`No fixed ID defined for system tag: ${name}`);
    }

    // Check if tag already exists by ID or name
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { id: tagId },
          {
            name,
            createdBy: SYSTEM_USER_ID,
            isDeleted: false,
          },
        ],
      },
    });

    if (existingTag) {
      // If exists but ID doesn't match, update it to use the fixed ID
      if (existingTag.id !== tagId) {
        const iconKey = tagId; // Use tag ID as iconKey (e.g., "system-tag-food")
        return prisma.tag.update({
          where: { id: existingTag.id },
          data: {
            id: tagId,
            name,
            type: type as any,
            iconKey,
            createdBy: SYSTEM_USER_ID,
            isDeleted: false,
          } as any,
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
      // Update type and iconKey if they don't match
      const iconKey = tagId; // Use tag ID as iconKey (e.g., "system-tag-food")
      const needsUpdate = (existingTag as any).type !== type || (existingTag as any).iconKey !== iconKey;
      if (needsUpdate) {
        return prisma.tag.update({
          where: { id: existingTag.id },
          data: { 
            type: type as any,
            iconKey,
          } as any,
          include: {
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
      return existingTag;
    }

    // Use tag ID as iconKey (e.g., "system-tag-food", "system-tag-salary")
    const iconKey = tagId;
    
    // Create new tag with fixed ID
    return prisma.tag.create({
      data: {
        id: tagId,
        name,
        type: type as any,
        iconKey,
        createdBy: SYSTEM_USER_ID,
      } as any,
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
   * Ensure system tags exist
   * Creates default system tags if they don't exist, using fixed IDs
   */
  async ensureSystemTagsExist() {
    // Ensure system user exists first
    await ensureSystemUserExists();

    // Create all expense system tags
    await Promise.all(
      DEFAULT_SYSTEM_TAGS.map((name) => this.createSystemTag(name, "EXPENSE"))
    );

    // Create all income system tags
    await Promise.all(
      DEFAULT_SYSTEM_INCOME_TAGS.map((name) => this.createSystemTag(name, "INCOME"))
    );
  },
};

