// Framer Motion 動畫變體
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

// Hero 輪播動畫變體
export const heroVariants = {
  enter: () => ({
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    opacity: 1,
    scale: 1,
  },
  exit: () => ({
    opacity: 0,
    scale: 0.95,
  }),
}

// 滑動動畫變體
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
}

// 漸入動畫配置
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// 常用的過渡配置
export const smoothTransition = {
  duration: 0.6,
  ease: "easeInOut"
}

export const fastTransition = {
  duration: 0.3,
  ease: "easeInOut"
}

export const slowTransition = {
  duration: 0.8,
  ease: "easeInOut"
}
