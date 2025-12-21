/**
 * Tag icon utility functions
 * 
 * This module provides utilities for rendering tag icons based on iconKey.
 * Uses lucide-react SVG icons for better visual consistency and customization.
 */

import { tagIconMap, Tag } from "@/ui/components/icons/tag-icon-map";
import type { LucideIcon } from "@/ui/components/icons/tag-icon-map";

/**
 * Get the icon component for a given iconKey
 * 
 * @param iconKey - The icon key from the tag (e.g., "shopping-cart", "coffee")
 * @returns The corresponding lucide-react icon component, or Tag as default
 * 
 * @example
 * ```tsx
 * const IconComponent = getTagIconComponent("coffee"); // Returns Coffee icon component
 * ```
 */
export function getTagIconComponent(iconKey: string): LucideIcon {
  return tagIconMap[iconKey] || Tag;
}

/**
 * Tag icon component
 * 
 * Renders an SVG icon based on the tag's iconKey using lucide-react.
 * 
 * @param iconKey - The icon key from the tag
 * @param className - Optional CSS class name
 * @param size - Optional icon size in pixels (default: 20)
 * @param color - Optional icon color (default: "currentColor")
 * @returns JSX element with the SVG icon
 */
export function TagIcon({ 
  iconKey, 
  className = "",
  size = 20,
  color = "currentColor"
}: { 
  iconKey: string; 
  className?: string;
  size?: number;
  color?: string;
}) {
  const IconComponent = getTagIconComponent(iconKey);
  
  return (
    <IconComponent 
      className={className} 
      size={size} 
      color={color}
      aria-label={`Tag icon: ${iconKey}`}
    />
  );
}
