// 統一的樣式工具函數

// 文字陰影樣式
export const textShadows = {
  large: '0 8px 32px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.9)',
  medium: '0 4px 16px rgba(0,0,0,0.8)',
  small: '0 2px 8px rgba(0,0,0,0.7)',
  tiny: '0 1px 3px rgba(0,0,0,0.5)'
}

// 漸層樣式
export const gradients = {
  red: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800',
  redHover: 'hover:from-red-700 hover:via-red-800 hover:to-red-900',
  blue: 'bg-gradient-to-r from-blue-600 to-blue-400',
  gray: 'bg-gradient-to-b from-gray-50 to-white',
  dark: 'bg-gradient-to-b from-gray-900 to-black'
}

// 按鈕樣式
export const buttonStyles = {
  primary: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white shadow-2xl hover:shadow-red-500/50',
  outline: 'bg-white/15 hover:bg-white/25 text-white border-2 border-white/50 hover:border-white/80 backdrop-blur-lg shadow-xl hover:shadow-white/30',
  ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200'
}

// 卡片樣式
export const cardStyles = {
  movie: 'relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.03]',
  glass: 'bg-white/90 backdrop-blur-sm border border-white/20',
  dark: 'bg-black/50 backdrop-blur-md border border-white/20'
}

// 動畫類別
export const animations = {
  marquee: 'animate-marquee',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin'
}

// 響應式間距
export const spacing = {
  section: 'py-16 sm:py-20 lg:py-24',
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  hero: 'pb-24 sm:pb-28 lg:pb-32'
}

// 字體大小
export const textSizes = {
  heroTitle: 'text-5xl sm:text-6xl lg:text-7xl xl:text-8xl',
  sectionTitle: 'text-3xl sm:text-4xl lg:text-5xl',
  cardTitle: 'text-lg sm:text-xl',
  body: 'text-base sm:text-lg'
}

// 圓角
export const borderRadius = {
  small: 'rounded',
  medium: 'rounded-lg',
  large: 'rounded-xl',
  full: 'rounded-full'
}

// 陰影
export const shadows = {
  small: 'shadow-lg',
  medium: 'shadow-xl',
  large: 'shadow-2xl',
  colored: 'shadow-red-500/50'
}
