/**
 * Wallet domain types and interfaces
 * 
 * This module defines the core domain types for the Wallet entity,
 * separate from the database schema. These types represent the
 * business logic layer of the Wallet domain.
 */

/**
 * Wallet role enum
 */
export enum WalletRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

/**
 * Wallet member information
 */
export interface WalletMember {
  id: string;
  userId: string;
  role: WalletRole;
  user: {
    id: string;
    name: string;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * Wallet entity
 */
export interface Wallet {
  id: string;
  name: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  members: WalletMember[];
}

/**
 * Create wallet data
 */
export interface CreateWalletData {
  name: string;
  defaultCurrency?: string;
  setAsDefault?: boolean;
}

/**
 * Update wallet data
 */
export interface UpdateWalletData {
  name?: string;
  defaultCurrency?: string;
}

/**
 * Service result wrapper
 */
export interface WalletServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

