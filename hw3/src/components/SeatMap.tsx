import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface SeatMapProps {
  seatmapId: string
  selectedSeats: string[]
  onSeatClick: (seatId: string) => void
  soldSeats?: string[]
}

export default function SeatMap({
  seatmapId,
  selectedSeats,
  onSeatClick,
  soldSeats = [],
}: SeatMapProps) {
  // 根據 seatmap_id 決定座位配置
  const { rows, cols } = useMemo(() => {
    switch (seatmapId) {
      case 'SMALL_10x8':
        return { rows: 10, cols: 8 }
      case 'MEDIUM_12x10':
        return { rows: 12, cols: 10 }
      case 'LARGE_16x14':
        return { rows: 16, cols: 14 }
      default:
        return { rows: 10, cols: 10 }
    }
  }, [seatmapId])

  // 生成座位 ID
  const seats = useMemo(() => {
    const seatArray: string[] = []
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        seatArray.push(`${rowLabels[i]}${j + 1}`)
      }
    }
    
    return seatArray
  }, [rows, cols])

  const getSeatStatus = (seatId: string) => {
    if (soldSeats.includes(seatId)) return 'sold'
    if (selectedSeats.includes(seatId)) return 'selected'
    return 'available'
  }

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'sold':
        return 'bg-red-100 border border-red-300 text-red-700 cursor-not-allowed opacity-60'
      case 'selected':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white cursor-pointer shadow-md hover:shadow-lg border border-purple-600'
      case 'available':
        return 'bg-gray-100 border border-gray-300 hover:bg-purple-100 hover:border-purple-400 cursor-pointer text-gray-700'
      default:
        return 'bg-gray-100 border border-gray-300 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* 座位圖 */}
      <div className="flex justify-center">
        <div
          className="inline-grid gap-2 p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {seats.map((seatId) => {
            const status = getSeatStatus(seatId)
            const isDisabled = status === 'sold'

            return (
              <button
                key={seatId}
                onClick={() => !isDisabled && onSeatClick(seatId)}
                disabled={isDisabled}
                className={cn(
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-105',
                  getSeatColor(status),
                  status === 'selected' && 'ring-2 ring-purple-300 scale-110'
                )}
                title={`座位 ${seatId} - ${
                  status === 'sold' ? '已售出' : status === 'selected' ? '已選' : '可選'
                }`}
              >
                {status !== 'sold' && (
                  <span className="text-[10px] sm:text-xs">{seatId}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

