/**
 * Tag icon utility functions
 * 
 * This module provides utilities for rendering tag icons based on iconKey.
 * Currently uses emoji mapping, but can be extended to use icon libraries.
 */

/**
 * Map iconKey to emoji
 * 
 * This function maps tag iconKey values to corresponding emoji icons.
 * If the iconKey is not recognized, returns a default tag emoji.
 * 
 * @param iconKey - The icon key from the tag (e.g., "shopping-cart", "coffee")
 * @returns Emoji string representing the icon
 * 
 * @example
 * ```tsx
 * const icon = getTagIcon("coffee"); // Returns "☕"
 * ```
 */
export function getTagIcon(iconKey: string): string {
  const iconMap: Record<string, string> = {
    // Common icons
    tag: "🏷️",
    "shopping-cart": "🛒",
    coffee: "☕",
    food: "🍽️",
    restaurant: "🍴",
    "fast-food": "🍔",
    drink: "🥤",
    grocery: "🛍️",
    transportation: "🚗",
    car: "🚗",
    bus: "🚌",
    train: "🚆",
    taxi: "🚕",
    gas: "⛽",
    parking: "🅿️",
    entertainment: "🎬",
    movie: "🎬",
    music: "🎵",
    game: "🎮",
    book: "📚",
    shopping: "🛍️",
    clothes: "👕",
    shoes: "👟",
    electronics: "📱",
    phone: "📱",
    computer: "💻",
    health: "🏥",
    hospital: "🏥",
    medicine: "💊",
    gym: "💪",
    fitness: "💪",
    education: "📖",
    school: "🏫",
    tuition: "🎓",
    bill: "📄",
    utility: "💡",
    electricity: "⚡",
    water: "💧",
    internet: "🌐",
    phone_bill: "📞",
    insurance: "🛡️",
    travel: "✈️",
    flight: "✈️",
    hotel: "🏨",
    vacation: "🏖️",
    income: "💰",
    salary: "💵",
    bonus: "🎁",
    gift: "🎁",
    investment: "📈",
    stock: "📊",
    savings: "💳",
    bank: "🏦",
    atm: "🏧",
    transfer: "💸",
    payment: "💳",
    credit: "💳",
    cash: "💵",
    other: "📝",
    default: "🏷️",
  };

  // Return mapped icon or default
  return iconMap[iconKey] || iconMap.default;
}

/**
 * Tag icon component
 * 
 * Renders an emoji icon based on the tag's iconKey.
 * 
 * @param iconKey - The icon key from the tag
 * @param className - Optional CSS class name
 * @returns JSX element with the emoji icon
 */
export function TagIcon({ 
  iconKey, 
  className = "" 
}: { 
  iconKey: string; 
  className?: string;
}) {
  return (
    <span className={className} role="img" aria-label={`Tag icon: ${iconKey}`}>
      {getTagIcon(iconKey)}
    </span>
  );
}

