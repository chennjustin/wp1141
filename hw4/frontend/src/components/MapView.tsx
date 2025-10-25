import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Place, Entry } from '../types';
import { placesApi, entriesApi } from '../services/data';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 25.0330,
  lng: 121.5654
};

interface MapViewProps {
  selectedFolderId?: number;
  onPlaceClick?: (place: Place) => void;
  onMapClick?: (lat: number, lng: number) => void;
  selectedPlace?: Place | null;
  refreshTrigger?: number; // 新增刷新觸發器
}

const MapView: React.FC<MapViewProps> = ({
  selectedFolderId,
  onPlaceClick,
  onMapClick,
  selectedPlace,
  refreshTrigger
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Maps API 載入
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
    libraries: ['places']
  });

  // 載入地點資料
  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await placesApi.getAll(selectedFolderId);
      if (response.data) {
        setPlaces(response.data);
      }
    } catch (error) {
      console.error('載入地點失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 監聽 refreshTrigger 變化，重新載入地點
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadPlaces();
    }
  }, [refreshTrigger, selectedFolderId]);

  // 載入造訪紀錄
  const loadEntries = async () => {
    try {
      const response = await entriesApi.getAll();
      if (response.data) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('載入造訪紀錄失敗:', error);
    }
  };

  useEffect(() => {
    loadPlaces();
    loadEntries();
  }, [selectedFolderId]);

  // 地圖載入完成
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // 地圖卸載
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 地圖點擊事件
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onMapClick?.(lat, lng);
    }
  };

  // 標記點擊事件
  const handleMarkerClick = (place: Place) => {
    setSelectedMarker(place);
    onPlaceClick?.(place);
  };

  // 取得地點的造訪紀錄
  const getPlaceEntries = (placeId: number) => {
    return entries.filter(entry => entry.placeId === placeId);
  };

  // 計算地點的平均評分
  const getAverageRating = (placeId: number) => {
    const placeEntries = getPlaceEntries(placeId);
    if (placeEntries.length === 0) return 0;
    
    const totalRating = placeEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0);
    return (totalRating / placeEntries.length).toFixed(1);
  };

  // 取得地點的最新造訪日期
  // const getLatestVisit = (placeId: number) => {
  //   const placeEntries = getPlaceEntries(placeId);
  //   if (placeEntries.length === 0) return null;
  //   
  //   const sortedEntries = placeEntries.sort((a, b) => 
  //     new Date(b.visitedAt || b.createdAt).getTime() - new Date(a.visitedAt || a.createdAt).getTime()
  //   );
  //   
  //   return sortedEntries[0];
  // };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入地圖中...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">載入地點中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">地圖檢視</h3>
        <p className="text-sm text-gray-600">
          共 {places.length} 個地點
        </p>
      </div>
      
      <div className="p-4">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : defaultCenter}
          zoom={selectedPlace ? 15 : 10}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            gestureHandling: 'greedy',
            clickableIcons: false,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
          }}
        >
          {/* 渲染地點標記 */}
          {places.map(place => {
            // const latestEntry = getLatestVisit(place.id);
            // const averageRating = getAverageRating(place.id);
            
            return (
              <Marker
                key={place.id}
                position={{ lat: place.lat, lng: place.lng }}
                onClick={() => handleMarkerClick(place)}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
                        ${place.emoji || '📍'}
                      </text>
                    </svg>
                  `)}`,
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 20)
                }}
              />
            );
          })}

          {/* 資訊視窗 */}
          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 max-w-xs">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{selectedMarker.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{selectedMarker.name}</h4>
                    {selectedMarker.address && (
                      <p className="text-sm text-gray-600">{selectedMarker.address}</p>
                    )}
                  </div>
                </div>
                
                {selectedMarker.description && (
                  <p className="text-sm text-gray-700 mb-2">{selectedMarker.description}</p>
                )}
                
                <div className="text-xs text-gray-500">
                  <p>座標: {selectedMarker.lat.toFixed(6)}, {selectedMarker.lng.toFixed(6)}</p>
                  {selectedMarker.folder && (
                    <p>資料夾: {selectedMarker.folder.name}</p>
                  )}
                  {getPlaceEntries(selectedMarker.id).length > 0 && (
                    <p>造訪次數: {getPlaceEntries(selectedMarker.id).length}</p>
                  )}
                  {getAverageRating(selectedMarker.id) !== '0.0' && (
                    <p>平均評分: {getAverageRating(selectedMarker.id)} ⭐</p>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        
        {/* 地圖控制按鈕 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (map) {
                const bounds = new google.maps.LatLngBounds();
                places.forEach(place => {
                  bounds.extend(new google.maps.LatLng(place.lat, place.lng));
                });
                map.fitBounds(bounds);
              }
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            disabled={places.length === 0}
          >
            顯示所有地點
          </button>
          
          <button
            onClick={() => {
              if (map) {
                map.setCenter(defaultCenter);
                map.setZoom(10);
              }
            }}
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
          >
            重置視圖
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapView;
