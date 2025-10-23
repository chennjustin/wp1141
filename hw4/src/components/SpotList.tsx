import type { Spot } from '../pages/MapPage'

interface SpotListProps {
  spots: Spot[]
  selectedSpot: Spot | null
  onSpotSelect: (spot: Spot) => void
  onSpotDelete: (spotId: string) => void
}

function SpotList({ spots, selectedSpot, onSpotSelect, onSpotDelete }: SpotListProps) {
  return (
    <div className="h-full flex flex-col">
      {/* 標題 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">景點列表</h2>
        <p className="text-sm text-gray-600 mt-1">
          共 {spots.length} 個景點
        </p>
      </div>

      {/* 景點列表 */}
      <div className="flex-1 overflow-y-auto">
        {spots.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">尚未新增任何景點</p>
            <p className="text-gray-400 text-xs mt-1">點擊地圖新增景點標記</p>
          </div>
        ) : (
          <div className="p-2">
            {spots.map((spot) => (
              <div
                key={spot.id}
                className={`p-3 mb-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedSpot?.id === spot.id
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
                onClick={() => onSpotSelect(spot)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {spot.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      座標: {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}
                    </p>
                    {spot.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {spot.description}
                      </p>
                    )}
                  </div>
                  
                  {/* 刪除按鈕 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSpotDelete(spot.id)
                    }}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="刪除景點"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部資訊 */}
      {spots.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            點擊景點查看詳細資訊
          </div>
        </div>
      )}
    </div>
  )
}

export default SpotList
