import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Place, Folder } from '../types';
import { placesApi, foldersApi } from '../services/data';
import AddToCollectionModal from './AddToCollectionModal';

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
  selectedTypes?: string[];
  filterMode?: 'all' | 'folders' | 'types';
  onPlaceClick?: (place: Place) => void;
  onMapClick?: (lat: number, lng: number, placeInfo?: any) => void;
  selectedPlace?: Place | null;
  refreshTrigger?: number;
  searchResults?: any[];
  onSearchResultClick?: (result: any) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  selectedFolders = [],
  selectedTypes = [],
  filterMode = 'all',
  onPlaceClick,
  onMapClick,
  selectedPlace,
  refreshTrigger,
  searchResults = [],
  onSearchResultClick
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [lastSearchLocation, setLastSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastSearchTime, setLastSearchTime] = useState<number>(0);
  
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<any>(null);
  
  

  // 靜態 libraries 配置，避免重新載入警告
  const GOOGLE_MAPS_LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

  // Google Maps API 載入
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
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

  // 監聽 refreshTrigger 變化，重新載入地點和資料夾
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadPlaces();
      loadFolders();
    }
  }, [refreshTrigger]);

  // 載入附近地點（自動探索）
  const loadNearbyPlaces = useCallback(async (lat: number, lng: number, radius: number = 2000) => {
    const now = Date.now();
    
    // 避免重複搜尋相同位置（增加容差）
    if (lastSearchLocation && 
        Math.abs(lastSearchLocation.lat - lat) < 0.005 && 
        Math.abs(lastSearchLocation.lng - lng) < 0.005) {
      return;
    }

    // API 配額保護：至少間隔 10 秒才能再次搜尋
    if (now - lastSearchTime < 10000) {
      console.log('⏰ API 配額保護：請稍後再試');
      return;
    }

    try {
      setIsLoadingNearby(true);
      const response = await fetch('http://localhost:3000/search/nearby-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { lat, lng },
          radius
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          console.log(`📍 找到 ${data.data.length} 個附近地點`);
          setNearbyPlaces(data.data);
          setLastSearchLocation({ lat, lng });
          setLastSearchTime(now);
        }
      } else {
        const errorData = await response.json();
        console.error('附近搜尋失敗:', errorData.error);
        
        // 如果是配額超限，顯示友好提示
        if (errorData.error?.includes('Quota exceeded')) {
          console.log('⏰ Google API 配額已用完，請稍後再試');
          setNearbyPlaces([]);
        }
      }
    } catch (error) {
      console.error('載入附近地點失敗:', error);
    } finally {
      setIsLoadingNearby(false);
    }
  }, [lastSearchLocation, lastSearchTime]);

  // 地圖載入完成
  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    let searchTimeout: number | null = null;

    // 監聽地圖閒置事件（使用者停止移動或縮放後觸發）
    mapInstance.addListener('idle', () => {
      // 清除之前的搜尋計時器
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // 延遲 1 秒後才搜尋，避免過度搜尋
      searchTimeout = window.setTimeout(() => {
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        
        // 只在 zoom level 15 以上才自動探索（更嚴格的條件）
        if (center && zoom && zoom >= 15) {
          const radius = Math.floor(1000 / Math.pow(2, zoom - 15));
          loadNearbyPlaces(center.lat(), center.lng(), Math.max(radius, 200));
        } else if (zoom && zoom < 15) {
          // zoom level 太小時清空附近地點
          setNearbyPlaces([]);
        }
      }, 1000);
    });
  }, [loadNearbyPlaces]);

  // 地圖卸載
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);




  // 處理收藏儲存
  const handleSaveCollection = useCallback(async (collectionData: any) => {
    try {
      const response = await placesApi.create(collectionData);
      if (response.data) {
        // 更新本地狀態
        setPlaces(prev => [...prev, response.data!]);
        setShowAddToCollection(false);
        setSelectedPlaceInfo(null);
        console.log('地點已成功加入收藏！');
      }
    } catch (error) {
      console.error('加入收藏失敗:', error);
      alert('加入收藏失敗，請稍後再試');
    }
  }, []);

  // 處理創建新資料夾
  const handleCreateFolder = useCallback(async (folderData: any) => {
    try {
      const response = await foldersApi.create(folderData);
      if (response.data) {
        setFolders(prev => [...prev, response.data!]);
        return response.data;
      }
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      throw error;
    }
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

  // 關閉資訊視窗
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // 篩選顯示的地點
  const filteredPlaces = places.filter(place => {
    // 根據篩選模式決定篩選邏輯
    switch (filterMode) {
      case 'all':
        return true; // 顯示所有地點
      case 'folders':
        return selectedFolders.length === 0 || selectedFolders.includes(place.folderId || 0);
      case 'types':
        // 暫時跳過類型篩選，因為 Place 類型中沒有 types 欄位
        return selectedTypes.length === 0;
      default:
        return true;
    }
  });

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
          fullscreenControl: false,
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
              onClick={() => {
                onPlaceClick?.(place);
              }}
              icon={createMarkerIcon(place.emoji || '📍', iconColor)}
            />
          );
        })}

        {/* 渲染搜尋結果標記（橙色） */}
        {searchResults.map((result, index) => (
          <Marker
            key={`search-${result.place_id || index}`}
            position={{
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            }}
            onClick={() => onSearchResultClick?.(result)}
            icon={createMarkerIcon('🔍', '#F59E0B')}
            zIndex={1000}
          />
        ))}

        {/* 渲染附近探索地點標記（灰色，半透明） */}
        {nearbyPlaces.map((place, index) => (
          <Marker
            key={`nearby-${place.place_id || index}`}
            position={{
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            }}
            onClick={() => {
              // 點擊附近地點時，顯示加入收藏 Modal
              setSelectedPlaceInfo({
                name: place.name,
                address: place.vicinity,
                rating: place.rating,
                opening_hours: place.opening_hours,
                photos: place.photos,
                types: place.types,
                place_id: place.place_id,
                geometry: place.geometry
              });
              setShowAddToCollection(true);
            }}
            icon={createMarkerIcon('📍', '#9CA3AF')}
            opacity={0.6}
            zIndex={1}
            title={place.name} // 添加 hover 提示
          />
        ))}

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

      {/* 載入附近地點的指示器 */}
        {isLoadingNearby && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md flex items-center space-x-2 z-50">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-700">探索附近地點...</span>
          </div>
        )}

      {/* 地點統計 - 重新定位 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-2">
        <p className="text-xs text-gray-600">
          顯示 {filteredPlaces.length} 個地點
        </p>
      </div>


      {/* 加入收藏 Modal */}
      {showAddToCollection && selectedPlaceInfo && (
        <AddToCollectionModal
          isOpen={showAddToCollection}
          onClose={() => {
            setShowAddToCollection(false);
            setSelectedPlaceInfo(null);
          }}
          onSave={handleSaveCollection}
          placeData={{
            name: selectedPlaceInfo.name,
            address: selectedPlaceInfo.address,
            lat: selectedPlaceInfo.geometry.location.lat,
            lng: selectedPlaceInfo.geometry.location.lng,
            rating: selectedPlaceInfo.rating,
            place_id: selectedPlaceInfo.place_id,
            types: selectedPlaceInfo.types
          }}
          folders={folders}
          onCreateFolder={handleCreateFolder}
        />
      )}

    </div>
  );
};

export default MapContainer;