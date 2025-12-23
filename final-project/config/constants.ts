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
  "飲食",
  "飲料",
  "娛樂",
  "交通",
  "購物",
  "帳單",
  "醫療",
  "教育",
  "旅遊",
  "其他",
] as const;

export const DEFAULT_SYSTEM_INCOME_TAGS = [
  "薪水",
  "獎金",
  "投資",
  "禮物"
] as const;

/**
 * System tag ID mapping
 * Maps system tag names to their fixed IDs
 */
export const SYSTEM_TAG_IDS: Record<(typeof DEFAULT_SYSTEM_TAGS)[number], string> = {
  飲食: "system-tag-food",
  飲料: "system-tag-drinks",
  娛樂: "system-tag-entertainment",
  交通: "system-tag-transportation",
  購物: "system-tag-shopping",
  帳單: "system-tag-bills",
  醫療: "system-tag-healthcare",
  教育: "system-tag-education",
  旅遊: "system-tag-travel",
  其他: "system-tag-other",
} as const;

export const SYSTEM_INCOME_TAG_IDS: Record<(typeof DEFAULT_SYSTEM_INCOME_TAGS)[number], string> = {
  薪水: "system-tag-salary",
  獎金: "system-tag-bonus",
  投資: "system-tag-investment",
  禮物: "system-tag-gift"
} as const;

