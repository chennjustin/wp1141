/**
 * Carrier domain types and interfaces
 * 
 * This module defines the core domain types for the DeviceCarrier entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Carrier domain.
 */

/**
 * DeviceCarrier entity
 */
export interface DeviceCarrier {
  id: string;
  userId: string;
  carrierCode: string;
  isDeleted: boolean;
  createdAt: Date;
}

/**
 * Create carrier data
 */
export interface CreateCarrierData {
  carrierCode: string;
}

/**
 * Update carrier data
 */
export interface UpdateCarrierData {
  carrierCode?: string;
}

/**
 * Service result wrapper
 */
export interface CarrierServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

