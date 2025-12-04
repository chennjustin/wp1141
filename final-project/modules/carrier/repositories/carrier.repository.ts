/**
 * Carrier repository
 * 
 * This module encapsulates all database operations related to DeviceCarrier entity.
 * It provides a clean interface for data access, isolating Prisma-specific
 * logic from the service layer.
 */

import { prisma } from "@/lib/prisma";
import type { CreateCarrierData, UpdateCarrierData } from "../domain/carrier.types";

/**
 * Carrier repository interface
 */
export const carrierRepository = {
  /**
   * Find carrier by ID with user check
   */
  async findById(id: string, userId?: string) {
    const where: any = {
      id,
      isDeleted: false,
    };

    if (userId) {
      where.userId = userId;
    }

    return prisma.deviceCarrier.findFirst({
      where,
    });
  },

  /**
   * Find carriers by user ID
   */
  async findByUserId(userId: string) {
    return prisma.deviceCarrier.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Find all carriers (for system user)
   */
  async findAll() {
    return prisma.deviceCarrier.findMany({
      where: {
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Find user's default or first carrier
   */
  async findUserCarrier(userId: string) {
    return prisma.deviceCarrier.findFirst({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Create carrier
   */
  async create(userId: string, data: CreateCarrierData) {
    return prisma.deviceCarrier.create({
      data: {
        userId,
        carrierCode: data.carrierCode.trim(),
      },
    });
  },

  /**
   * Update carrier
   */
  async update(id: string, data: UpdateCarrierData) {
    const updateData: any = {};
    if (data.carrierCode !== undefined) {
      updateData.carrierCode = data.carrierCode.trim();
    }

    return prisma.deviceCarrier.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Check if carrier belongs to user
   */
  async belongsToUser(carrierId: string, userId: string) {
    const carrier = await prisma.deviceCarrier.findFirst({
      where: {
        id: carrierId,
        userId,
        isDeleted: false,
      },
    });
    return !!carrier;
  },

  /**
   * Check carrier existence
   */
  async exists(id: string) {
    const carrier = await prisma.deviceCarrier.findUnique({
      where: { id },
    });
    return carrier !== null && !carrier.isDeleted;
  },

  /**
   * Soft delete carrier
   */
  async softDelete(id: string) {
    return prisma.deviceCarrier.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });
  },
};

