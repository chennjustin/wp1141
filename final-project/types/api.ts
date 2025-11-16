/**
 * API response type definitions
 * 
 * This module defines TypeScript types for API responses,
 * ensuring type safety across the application.
 */

import type { Wallet } from "@/modules/wallet/domain/wallet.types";
import type { UserProfile } from "@/modules/user/domain/user.types";

/**
 * Wallet API responses
 */
export interface WalletListResponse {
  wallets: Wallet[];
}

export interface WalletResponse {
  wallet: Wallet;
}

export interface WalletCreateResponse {
  wallet: Wallet;
}

export interface WalletUpdateResponse {
  wallet: Wallet;
}

export interface WalletDeleteResponse {
  success: boolean;
}

/**
 * User API responses
 */
export interface UserProfileResponse {
  profile: UserProfile;
}

export interface UserSearchResponse {
  users: Array<{
    id: string;
    userId: string;
    name: string;
    imageUrl?: string;
  }>;
}

export interface UserRegistrationResponse {
  success: boolean;
  user?: {
    id: string;
    userID: string;
  };
  error?: string;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: string;
  statusCode?: number;
}

