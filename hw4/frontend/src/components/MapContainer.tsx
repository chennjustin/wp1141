import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Place, Folder } from '../types';
import { placesApi, foldersApi } from '../services/data';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 25.0330,
  lng: 121.5654
};

interface MapContainerProps {
  selectedFolders?: number[];
  onPlaceClick?: (place: Place) => void;
  onMapClick?: (lat: number, lng: number, placeInfo?: any) => void;
  selectedPlace?: Place | null;
  refreshTrigger?: number; // 新增刷新觸發器
}

const MapContainer: React.FC<MapContainerProps> = ({
  selectedFolders = [],
  onPlaceClick,
  onMapClick,
  selectedPlace,
  refreshTrigger
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Maps API 載入
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
    libraries: ['places', 'geometry']
  });

  // 載入地點資料
  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await placesApi.getAll();
      if (response.data) {
        setPlaces(response.data);
      }
    } catch (error) {
      console.error('載入地點失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 載入資料夾
  const loadFolders = async () => {
    try {
      const response = await foldersApi.getAll();
      if (response.data) {
        setFolders(response.data);
      }
    } catch (error) {
      console.error('載入資料夾失敗:', error);
    }
  };

  useEffect(() => {
    loadPlaces();
    loadFolders();
  }, []);

  // 監聽 refreshTrigger 變化，重新載入地點
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadPlaces();
    }
  }, [refreshTrigger]);

  // 地圖載入完成
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // 地圖卸載
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // 地圖點擊事件 - 整合 Places API
  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng || !map) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    try {
      // 使用 Places API 搜尋附近地點
      const service = new google.maps.places.PlacesService(map);
      const request = {
        location: { lat, lng },
        radius: 100,
        type: 'establishment'
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // 找到最近的地點
          const nearestPlace = results[0];
          const placeInfo = {
            name: nearestPlace.name || '未知地點',
            address: nearestPlace.vicinity || '',
            placeId: nearestPlace.place_id,
            rating: nearestPlace.rating,
            types: nearestPlace.types
          };
          onMapClick?.(lat, lng, placeInfo);
        } else {
          // 使用 Geocoding API 取得地址資訊
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              const result = results[0];
              const placeInfo = {
                name: result.formatted_address,
                address: result.formatted_address,
                placeId: result.place_id,
                types: result.types
              };
              onMapClick?.(lat, lng, placeInfo);
            } else {
              // 如果都找不到，使用座標作為名稱
              const placeInfo = {
                name: `位置 (${lat.toFixed(6)}, ${lng.toFixed(6)})`,
                address: '',
                placeId: null,
                types: []
              };
              onMapClick?.(lat, lng, placeInfo);
            }
          });
        }
      });
    } catch (error) {
      console.error('地圖點擊處理失敗:', error);
      onMapClick?.(lat, lng);
    }
  }, [map, onMapClick]);

  // 標記點擊事件
  const handleMarkerClick = useCallback((place: Place) => {
    setSelectedMarker(place);
    onPlaceClick?.(place);
  }, [onPlaceClick]);

  // 關閉資訊視窗
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // 篩選顯示的地點
  const filteredPlaces = selectedFolders.length > 0 
    ? places.filter(place => selectedFolders.includes(place.folderId || 0))
    : places;

  // 建立自訂標記圖示
  const createMarkerIcon = (emoji: string, color: string = '#3B82F6') => {
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
            ${emoji}
          </text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(32, 32),
      anchor: new google.maps.Point(16, 16)
    };
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入地圖中...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">載入地點中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
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
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* 渲染地點標記 */}
        {filteredPlaces.map(place => {
          const folder = folders.find(f => f.id === place.folderId);
          const iconColor = folder?.color || '#3B82F6';
          
          return (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => handleMarkerClick(place)}
              icon={createMarkerIcon(place.emoji || '📍', iconColor)}
            />
          );
        })}

        {/* 資訊視窗 */}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-xs">
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{selectedMarker.emoji}</span>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{selectedMarker.name}</h4>
                  {selectedMarker.address && (
                    <p className="text-xs text-gray-600">{selectedMarker.address}</p>
                  )}
                </div>
              </div>
              
              {selectedMarker.description && (
                <p className="text-xs text-gray-700 mb-2">{selectedMarker.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                {selectedMarker.folder && (
                  <p className="text-blue-600">📁 {selectedMarker.folder.name}</p>
                )}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* 地圖控制按鈕 - 重新定位避免重疊 */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button
          onClick={() => {
            if (map) {
              const bounds = new google.maps.LatLngBounds();
              filteredPlaces.forEach(place => {
                bounds.extend(new google.maps.LatLng(place.lat, place.lng));
              });
              if (!bounds.isEmpty()) {
                map.fitBounds(bounds);
              }
            }
          }}
          className="px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-xs font-medium text-gray-700"
          disabled={filteredPlaces.length === 0}
        >
          📍 顯示所有地點
        </button>
        
        <button
          onClick={() => {
            if (map) {
              map.setCenter(defaultCenter);
              map.setZoom(10);
            }
          }}
          className="px-3 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-xs font-medium text-gray-700"
        >
          🏠 重置視圖
        </button>
      </div>

      {/* 地點統計 - 重新定位 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
        <p className="text-xs text-gray-600">
          顯示 {filteredPlaces.length} 個地點
        </p>
      </div>
    </div>
  );
};

export default MapContainer;