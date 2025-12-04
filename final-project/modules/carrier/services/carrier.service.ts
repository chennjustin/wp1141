/**
 * Carrier service
 * 
 * This module contains business logic for DeviceCarrier operations.
 * It orchestrates repository calls and implements domain rules
 * such as validation, authorization, and data transformation.
 */

import { carrierRepository } from "../repositories/carrier.repository";
import { SYSTEM_USER_ID } from "@/config/constants";
import type {
  DeviceCarrier,
  CreateCarrierData,
  UpdateCarrierData,
  CarrierServiceResult,
} from "../domain/carrier.types";

/**
 * Validate carrier code format
 * Taiwan electronic invoice carrier codes must be exactly 8 characters:
 * "/" + 7 alphanumeric characters
 */
function validateCarrierCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Carrier code cannot be empty" };
  }

  // Must be exactly 8 characters: "/" + 7 alphanumeric
  if (trimmed.length !== 8) {
    return {
      valid: false,
      error: "Carrier code must be exactly 8 characters (format: / + 7 alphanumeric characters)",
    };
  }

  // Must start with "/" followed by 7 alphanumeric characters
  const validPattern = /^\/[A-Za-z0-9]{7}$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: "Carrier code format must be: / + 7 alphanumeric characters (e.g., /ABCDEF1)",
    };
  }

  return { valid: true };
}

/**
 * Carrier service interface
 */
export const carrierService = {
  /**
   * Get user's carriers
   */
  async getUserCarriers(userId: string): Promise<DeviceCarrier[]> {
    const carriers = await carrierRepository.findByUserId(userId);
    return carriers as DeviceCarrier[];
  },

  /**
   * Get all carriers (only for system user)
   */
  async getAllCarriers(): Promise<DeviceCarrier[]> {
    const carriers = await carrierRepository.findAll();
    return carriers as DeviceCarrier[];
  },

  /**
   * Get user's default or first carrier
   */
  async getUserCarrier(userId: string): Promise<DeviceCarrier | null> {
    const carrier = await carrierRepository.findUserCarrier(userId);
    return carrier as DeviceCarrier | null;
  },

  /**
   * Get carrier by ID with authorization check
   */
  async getCarrierById(
    carrierId: string,
    userId: string
  ): Promise<CarrierServiceResult<DeviceCarrier>> {
    // First check if carrier exists
    const exists = await carrierRepository.exists(carrierId);
    if (!exists) {
      return {
        success: false,
        error: "Carrier not found",
      };
    }

    // Then check if carrier belongs to user
    const carrier = await carrierRepository.findById(carrierId, userId);
    if (!carrier) {
      return {
        success: false,
        error: "Access denied",
      };
    }

    return {
      success: true,
      data: carrier as DeviceCarrier,
    };
  },

  /**
   * Get current user's carrier
   * Returns null if user doesn't have a carrier
   */
  async getCurrentUserCarrier(
    userId: string
  ): Promise<CarrierServiceResult<DeviceCarrier>> {
    const carrier = await carrierRepository.findUserCarrier(userId);

    if (!carrier) {
      return {
        success: false,
        error: "Carrier not found for this user",
      };
    }

    return {
      success: true,
      data: carrier as DeviceCarrier,
    };
  },

  /**
   * Create carrier for user
   * System user can create carrier for any user and bypass duplicate check
   */
  async createCarrier(
    userId: string,
    data: CreateCarrierData,
    targetUserId?: string
  ): Promise<CarrierServiceResult<DeviceCarrier>> {
    // Validate carrier code
    if (!data.carrierCode || typeof data.carrierCode !== "string") {
      return {
        success: false,
        error: "Carrier code is required",
      };
    }

    const validation = validateCarrierCode(data.carrierCode);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Invalid carrier code format",
      };
    }

    // Determine target user ID (system user can specify, otherwise use current user)
    const isSystemUser = userId === SYSTEM_USER_ID;
    const finalTargetUserId = targetUserId || userId;

    // Check if user already has a carrier (system user can bypass this check)
    if (!isSystemUser) {
      const existingCarrier = await carrierRepository.findUserCarrier(finalTargetUserId);
      if (existingCarrier) {
        return {
          success: false,
          error: "User already has a carrier",
        };
      }
    }

    try {
      const carrier = await carrierRepository.create(finalTargetUserId, {
        carrierCode: data.carrierCode.trim(),
      });

      return {
        success: true,
        data: carrier as DeviceCarrier,
      };
    } catch (error) {
      console.error("Error creating carrier:", error);
      return {
        success: false,
        error: "Failed to create carrier",
      };
    }
  },

  /**
   * Update carrier (only owner can update)
   */
  async updateCarrier(
    carrierId: string,
    userId: string,
    data: UpdateCarrierData
  ): Promise<CarrierServiceResult<DeviceCarrier>> {
    // First check if carrier exists
    const exists = await carrierRepository.exists(carrierId);
    if (!exists) {
      return {
        success: false,
        error: "Carrier not found",
      };
    }

    // Then check authorization
    const belongsToUser = await carrierRepository.belongsToUser(carrierId, userId);
    if (!belongsToUser) {
      return {
        success: false,
        error: "Only carrier owner can update this carrier",
      };
    }

    // Validate update data
    if (data.carrierCode === undefined || data.carrierCode === null) {
      return {
        success: false,
        error: "No fields provided to update",
      };
    }

    // Validate carrier code if provided
    if (typeof data.carrierCode === "string") {
      const validation = validateCarrierCode(data.carrierCode);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || "Invalid carrier code format",
        };
      }
    }

    const updateData: UpdateCarrierData = {};

    if (typeof data.carrierCode === "string" && data.carrierCode.trim().length > 0) {
      updateData.carrierCode = data.carrierCode.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        error: "No valid fields provided to update",
      };
    }

    try {
      const updatedCarrier = await carrierRepository.update(carrierId, updateData);
      return {
        success: true,
        data: updatedCarrier as DeviceCarrier,
      };
    } catch (error) {
      console.error("Error updating carrier:", error);
      return {
        success: false,
        error: "Failed to update carrier",
      };
    }
  },

  /**
   * Update current user's carrier
   * Since each user has only one carrier, this method updates the user's carrier directly
   */
  async updateCurrentUserCarrier(
    userId: string,
    data: UpdateCarrierData
  ): Promise<CarrierServiceResult<DeviceCarrier>> {
    // Get user's carrier
    const userCarrier = await carrierRepository.findUserCarrier(userId);
    if (!userCarrier) {
      return {
        success: false,
        error: "Carrier not found for this user",
      };
    }

    // Use the existing updateCarrier method
    return this.updateCarrier(userCarrier.id, userId, data);
  },

  /**
   * Delete carrier (only owner can delete, system user can delete any carrier)
   */
  async deleteCarrier(
    carrierId: string,
    userId: string
  ): Promise<CarrierServiceResult<void>> {
    // First check if carrier exists
    const exists = await carrierRepository.exists(carrierId);
    if (!exists) {
      return {
        success: false,
        error: "Carrier not found",
      };
    }

    // System user can delete any carrier
    const isSystemUser = userId === SYSTEM_USER_ID;
    
    if (!isSystemUser) {
      // Then check authorization for non-system users
      const belongsToUser = await carrierRepository.belongsToUser(carrierId, userId);
      if (!belongsToUser) {
        return {
          success: false,
          error: "Only carrier owner can delete this carrier",
        };
      }
    }

    try {
      // Soft delete carrier
      await carrierRepository.softDelete(carrierId);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting carrier:", error);
      return {
        success: false,
        error: "Failed to delete carrier",
      };
    }
  },

  /**
   * Delete current user's carrier
   * Since each user has only one carrier, this method deletes the user's carrier directly
   */
  async deleteCurrentUserCarrier(
    userId: string
  ): Promise<CarrierServiceResult<void>> {
    // Get user's carrier
    const userCarrier = await carrierRepository.findUserCarrier(userId);
    if (!userCarrier) {
      return {
        success: false,
        error: "Carrier not found for this user",
      };
    }

    // Use the existing deleteCarrier method
    return this.deleteCarrier(userCarrier.id, userId);
  },
};

