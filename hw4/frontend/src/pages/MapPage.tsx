import { useState, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api'
import SpotList from '../components/SpotList'

// 地圖容器樣式
const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// 預設地圖中心（台北）
const center = {
  lat: 25.0330,
  lng: 121.5654
}

// 地圖選項
const options = {
  disableDefaultUI: false,
  zoomControl: true,
}

// 地點介面
export interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  description?: string
}

function MapPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // 載入 Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
  })

  // 地圖載入完成
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  // 地圖卸載
  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // 點擊地圖新增標記
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      const newSpot: Spot = {
        id: Date.now().toString(),
        name: `地點 ${spots.length + 1}`,
        lat,
        lng,
        description: `座標: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
      
      setSpots(prev => [...prev, newSpot])
    }
  }, [spots.length])

  // 點擊標記
  const onMarkerClick = useCallback((spot: Spot) => {
    setSelectedSpot(spot)
  }, [])

  // 關閉 InfoWindow
  const onInfoWindowClose = useCallback(() => {
    setSelectedSpot(null)
  }, [])

  // 從列表點擊地點
  const onSpotSelect = useCallback((spot: Spot) => {
    setSelectedSpot(spot)
    if (map) {
      map.panTo({ lat: spot.lat, lng: spot.lng })
      map.setZoom(15)
    }
  }, [map])

  // 刪除地點
  const onSpotDelete = useCallback((spotId: string) => {
    setSpots(prev => prev.filter(spot => spot.id !== spotId))
    if (selectedSpot?.id === spotId) {
      setSelectedSpot(null)
    }
  }, [selectedSpot])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">地圖載入失敗</h2>
          <p className="text-gray-600 mb-4">請檢查 Google Maps API Key 是否正確設定</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
            <p className="text-sm text-yellow-800">
              請確認 .env 檔案中的 VITE_GOOGLE_MAPS_JS_KEY 已設定正確的 API Key
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入地圖中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* 地圖區域 */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={options}
        >
          {/* 標記 */}
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => onMarkerClick(spot)}
            />
          ))}

          {/* InfoWindow */}
          {selectedSpot && (
            <InfoWindow
              position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
              onCloseClick={onInfoWindowClose}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">{selectedSpot.name}</h3>
                <p className="text-sm text-gray-600">{selectedSpot.description}</p>
                <button
                  onClick={() => onSpotDelete(selectedSpot.id)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  刪除
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* 地圖說明 */}
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            點擊地圖新增標記
          </p>
        </div>
      </div>

      {/* 地點列表 */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <SpotList 
          spots={spots}
          selectedSpot={selectedSpot}
          onSpotSelect={onSpotSelect}
          onSpotDelete={onSpotDelete}
        />
      </div>
    </div>
  )
}

export default MapPage
