/**
 * Application constants
 * 
 * Centralized location for all application-wide constants
 * that are not environment-specific.
 */

/**
 * User ID validation constants
 */
export const USER_ID_PATTERN = /^[a-z0-9](?:_?[a-z0-9]){2,19}$/;

export const RESERVED_WORDS = [
  "admin",
  "api",
  "settings",
  "post",
  "home",
  "profile",
  "login",
  "register",
  "logout",
  "edit",
] as const;

/**
 * Wallet-related constants
 */
export const DEFAULT_CURRENCY = "TWD" as const;

/**
 * Pagination constants
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Validation constants
 */
export const MAX_USER_ID_LENGTH = 20;
export const MIN_USER_ID_LENGTH = 3;
export const MAX_NAME_LENGTH = 50;

/**
 * Tag-related constants
 */
export const SYSTEM_USER_ID = "system" as const;

export const DEFAULT_SYSTEM_TAGS = [
  "food",
  "drinks",
  "entertainment",
  "transportation",
  "shopping",
  "bills",
  "healthcare",
  "education",
  "travel",
  "other",
] as const;

/**
 * System tag ID mapping
 * Maps system tag names to their fixed IDs
 */
export const SYSTEM_TAG_IDS: Record<(typeof DEFAULT_SYSTEM_TAGS)[number], string> = {
  food: "system-tag-food",
  drinks: "system-tag-drinks",
  entertainment: "system-tag-entertainment",
  transportation: "system-tag-transportation",
  shopping: "system-tag-shopping",
  bills: "system-tag-bills",
  healthcare: "system-tag-healthcare",
  education: "system-tag-education",
  travel: "system-tag-travel",
  other: "system-tag-other",
} as const;

