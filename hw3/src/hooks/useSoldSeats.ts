import { useMemo } from 'react'

/**
 * 生成隨機已售出座位
 * @param screeningId - 場次 ID
 * @param totalSeats - 總座位數
 * @param percentage - 已售出比例（預設 10-15%）
 */
export function useSoldSeats(
  screeningId: string,
  totalSeats: number,
  percentage: number = 0.12
): string[] {
  return useMemo(() => {
    // 使用 screeningId 作為隨機種子，確保同一場次的座位狀態一致
    const seed = screeningId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    // 簡單的偽隨機生成器
    const random = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    const soldCount = Math.floor(totalSeats * percentage)
    const soldSeats: string[] = []
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // 根據座位配置決定行列數
    let cols = 10
    
    if (totalSeats === 120) { cols = 10 }
    else if (totalSeats === 80) { cols = 8 }
    else if (totalSeats === 200) { cols = 14 }

    // 隨機選擇座位
    const usedIndices = new Set<number>()
    let attempts = 0
    
    while (soldSeats.length < soldCount && attempts < totalSeats * 2) {
      const index = Math.floor(random(attempts) * totalSeats)
      
      if (!usedIndices.has(index)) {
        const row = Math.floor(index / cols)
        const col = index % cols
        const seatId = `${rowLabels[row]}${col + 1}`
        soldSeats.push(seatId)
        usedIndices.add(index)
      }
      
      attempts++
    }

    return soldSeats
  }, [screeningId, totalSeats, percentage])
}

