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
 * Wallet user status enum
 * 
 * OWNER: Wallet creator (always has OWNER role)
 * PENDING: User has been invited but hasn't responded yet
 * ACCEPTED: User has accepted the invitation
 * REJECTED: User has rejected the invitation
 */
export enum WalletUserStatus {
  OWNER = "OWNER",
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

/**
 * Wallet member information
 */
export interface WalletMember {
  id: string;
  userId: string;
  role: WalletRole;
  status: WalletUserStatus;
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
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  members: WalletMember[];
}

/**
 * Wallet type for creation
 */
export type WalletType = "PERSONAL" | "GROUP";

/**
 * Create wallet data
 */
export interface CreateWalletData {
  name: string;
  defaultCurrency?: string;
  description?: string;
  setAsDefault?: boolean;
  walletType?: WalletType;
  invitedUserIds?: string[];
}

/**
 * Update wallet data
 */
export interface UpdateWalletData {
  name?: string;
  defaultCurrency?: string;
  description?: string;
}

/**
 * Service result wrapper
 */
export interface WalletServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

