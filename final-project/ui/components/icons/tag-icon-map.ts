/**
 * Tag icon mapping
 * 
 * Maps iconKey strings to lucide-react icon components.
 * This allows tags to display appropriate SVG icons based on their iconKey field.
 */

import {
  Tag,
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Film,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  GraduationCap,
  Plane,
  Wallet,
  DollarSign,
  TrendingUp,
  Gift,
  MoreHorizontal,
  // Additional icons for common use cases
  Home,
  Gamepad2,
  Music,
  Dumbbell,
  Briefcase,
  BookOpen,
  Shirt,
  Phone,
  Wifi,
  Zap,
  // Income-related icons
  HandCoins,
  Percent,
  RotateCcw,
  PieChart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Mapping of iconKey to lucide-react icon components
 * 
 * Maps system tag IDs to their corresponding icons.
 * Uses full system tag IDs (e.g., "system-tag-food") for system tags.
 */
export const tagIconMap: Record<string, LucideIcon> = {
  // Default
  tag: Tag,
  
  // System expense tags (Full IDs only)
  "system-tag-food": UtensilsCrossed,
  "system-tag-drinks": Coffee,
  "system-tag-entertainment": Film,
  "system-tag-transportation": Car,
  "system-tag-shopping": ShoppingCart,
  "system-tag-bills": Receipt,
  "system-tag-healthcare": HeartPulse,
  "system-tag-education": GraduationCap,
  "system-tag-travel": Plane,
  "system-tag-other": MoreHorizontal,
  
  // System income tags (Full IDs only)
  "system-tag-salary": Wallet,
  "system-tag-bonus": DollarSign,
  "system-tag-investment": TrendingUp,
  "system-tag-gift": Gift,
  
  // Additional common icons (for user-created tags)
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  coffee: Coffee,
  restaurant: UtensilsCrossed,
  home: Home,
  gaming: Gamepad2,
  music: Music,
  fitness: Dumbbell,
  work: Briefcase,
  study: BookOpen,
  clothing: Shirt,
  phone: Phone,
  internet: Wifi,
  utilities: Zap,
};

/**
 * Type export for LucideIcon
 */
export type { LucideIcon };

/**
 * Default icon component (Tag)
 */
export { Tag };

