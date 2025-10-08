import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'

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
        return 'bg-red-400 cursor-not-allowed'
      case 'selected':
        return 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600'
      case 'available':
        return 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
      default:
        return 'bg-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* 銀幕 */}
      <div className="relative">
        <div className="mx-auto w-full max-w-3xl h-4 bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 rounded-t-[24px] shadow-[0_8px_24px_rgba(0,0,0,0.25)]"></div>
        <div className="mx-auto w-[92%] max-w-3xl h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full -mt-1"></div>
        <p className="text-center text-sm text-gray-600 mt-2 tracking-widest">銀幕</p>
      </div>

      {/* 座位圖 */}
      <div className="flex justify-center">
        <div
          className="inline-grid gap-2 p-4 bg-white rounded-lg shadow-inner"
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
                  'w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200',
                  getSeatColor(status),
                  status === 'selected' && 'ring-2 ring-blue-300 scale-110'
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

      {/* 圖例 */}
      <div className="flex justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
          <span className="text-sm text-gray-600">可選</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-md"></div>
          <span className="text-sm text-gray-600">已選</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-400 rounded-md"></div>
          <span className="text-sm text-gray-600">已售</span>
        </div>
      </div>

      {/* 已選座位顯示 */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            已選座位 ({selectedSeats.length} 個)：
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seatId) => (
              <Badge key={seatId} variant="default" className="text-sm">
                {seatId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

