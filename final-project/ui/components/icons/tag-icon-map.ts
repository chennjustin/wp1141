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
 * Common mappings:
 * - "tag" -> Tag (default)
 * - "food" -> UtensilsCrossed
 * - "drinks" -> Coffee
 * - "shopping" -> ShoppingCart
 * - etc.
 */
export const tagIconMap: Record<string, LucideIcon> = {
  // Default
  tag: Tag,
  
  // System expense tags
  food: UtensilsCrossed,
  drinks: Coffee,
  entertainment: Film,
  transportation: Car,
  shopping: ShoppingCart,
  bills: Receipt,
  healthcare: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  other: MoreHorizontal,
  
  // System income tags
  salary: Wallet,
  bonus: DollarSign,
  investment: TrendingUp,
  gift: Gift,
  freelance: HandCoins,
  interest: Percent,
  refund: RotateCcw,
  dividend: PieChart,
  
  // Additional common icons
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

