import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { Place, Folder } from '../types';
import { placesApi, foldersApi } from '../services/data';
import api from '../services/api';
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
  mapClickData?: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    types?: string[];
  } | null;
  resetZoomTrigger?: number;
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
  mapClickData,
  resetZoomTrigger
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<Place | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  // 移除附近地點相關狀態，直接使用 Google Maps 內建 POI
  
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<any>(null);
  const [hasZoomedToSearch, setHasZoomedToSearch] = useState(false);
  
  

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

  // 搜尋結果自動 zoom in，並自動點擊第一個結果以顯示 Google Maps 原生資訊
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && map) {
      // 如果只有一個結果，直接 zoom in 到該地點
      if (searchResults.length === 1) {
        const result = searchResults[0];
        if (result.geometry && result.geometry.location) {
          const location = new google.maps.LatLng(
            result.geometry.location.lat,
            result.geometry.location.lng
          );
          map.panTo(location);
          map.setZoom(18); // zoom in 更近，以便看到 Google Maps 原生 POI
          
          // 延遲一下，等待地圖載入完成，然後模擬點擊以顯示 POI 資訊
          setTimeout(() => {
            // 觸發地圖點擊事件，讓系統去搜尋該位置的 POI
            google.maps.event.trigger(map, 'click', {
              latLng: location,
              stop: null
            });
          }, 500);
        }
      } else {
        // 如果有多個結果，調整視野包含所有結果
        const bounds = new google.maps.LatLngBounds();
        searchResults.forEach((result) => {
          if (result.geometry && result.geometry.location) {
            bounds.extend({
              lat: result.geometry.location.lat,
              lng: result.geometry.location.lng
            });
          }
        });
        map.fitBounds(bounds);
      }
    }
  }, [searchResults, map]);

  // 處理搜尋結果的 zoom in（來自 MapPage 的 mapClickData）
  useEffect(() => {
    if (mapClickData && map && !hasZoomedToSearch) {
      console.log('收到 mapClickData，進行 zoom in:', mapClickData);
      const location = new google.maps.LatLng(mapClickData.lat, mapClickData.lng);
      
      // 平滑移動到該位置
      map.panTo(location);
      map.setZoom(18); // zoom in 到適當的級別
      
      // 標記已經 zoom in 過
      setHasZoomedToSearch(true);
      
      console.log('已 zoom in 到位置:', mapClickData.name || '未知地點');
    }
  }, [mapClickData, map, hasZoomedToSearch]);

  // 監聽 resetZoomTrigger 變化，重置 zoom 狀態
  useEffect(() => {
    if (resetZoomTrigger !== undefined) {
      setHasZoomedToSearch(false);
      console.log('重置 zoom 狀態，允許下次搜尋時 zoom in');
    }
  }, [resetZoomTrigger]);

  // 不再需要自定義搜尋參數，Google Maps 會自動處理

  // 不再需要載入附近地點，直接使用 Google Maps 內建的 POI
  // Google Maps 會根據 zoom level 自動顯示/隱藏地點

  // 監聽地圖點擊事件 - 使用 Google Maps JavaScript API 獲取 POI 資訊
  const setupMapClickListener = useCallback(() => {
    if (!map) return;

    // 移除舊的監聽器
    google.maps.event.clearListeners(map, 'click');

    // 添加新的監聽器
    map.addListener('click', async (event: any) => {
      console.log('=== 地圖點擊事件觸發 ===', event);
      
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        console.log('點擊座標:', { lat, lng });
        console.log('placeId:', event.placeId);
        
        if (event.placeId) {
          // 點擊了 Google Maps POI
          console.log('點擊了 Google Maps POI，placeId:', event.placeId);
          
          // 阻止預設的 InfoWindow
          event.stop?.();
          
          // 使用後端 API 獲取 POI 詳細資訊
          try {
            const response = await api.get(`/search/place-details/${event.placeId}`);
            console.log('後端 getPlaceDetails 完整回應:', JSON.stringify(response.data, null, 2));
            
            // 後端回傳的資料結構是 { success: true, data: {...} }
            const place = response.data.data || response.data;
            const placeInfo = {
              name: place.name || '',
              address: place.formatted_address || '',
              lat: place.geometry?.location?.lat || lat,
              lng: place.geometry?.location?.lng || lng,
              rating: place.rating || 0,
              types: place.types || [],
              photos: place.photos || [],
              opening_hours: place.opening_hours || null,
              placeId: event.placeId
            };
            
            console.log('調用 onMapClick，傳入 POI 資訊:', placeInfo);
            onMapClick?.(placeInfo.lat, placeInfo.lng, placeInfo);
          } catch (error) {
            console.log('無法獲取 POI 詳細資訊，使用基本資訊:', error);
            // 如果無法獲取詳細資訊，使用基本資訊
            const placeInfo = {
              name: '',
              address: '',
              lat,
              lng,
              rating: 0,
              types: [],
              photos: [],
              opening_hours: null,
              placeId: event.placeId
            };
            onMapClick?.(lat, lng, placeInfo);
          }
        } else {
          // 點擊的是空白區域，也打開 Modal 讓用戶可以手動輸入
          console.log('點擊了空白區域，打開 Modal 讓用戶手動輸入');
          const placeInfo = {
            name: '',
            address: '',
            lat,
            lng,
            rating: 0,
            types: [],
            photos: [],
            opening_hours: null,
            placeId: null
          };
          onMapClick?.(lat, lng, placeInfo);
        }
      }
    });
  }, [map, onMapClick]);

  useEffect(() => {
    setupMapClickListener();
  }, [setupMapClickListener]);

  // 地圖載入完成
  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);

    // 啟用 Google Maps 內建的 POI 點擊功能，但禁用原生 InfoWindow
    mapInstance.setOptions({
      clickableIcons: true // 允許點擊 Google Maps 內建的 POI
    });

    // 禁用所有 InfoWindow
    mapInstance.addListener('click', () => {
      // 關閉任何開啟的 InfoWindow
      const infoWindows = mapInstance.get('infoWindows') || [];
      infoWindows.forEach((iw: any) => iw.close());
    });
  }, []);

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






  // 標記點擊事件

  // 關閉資訊視窗
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // 根據圖示判斷地點類型
  const getPlaceTypeFromEmoji = (emoji: string): string => {
    const emojiToType: { [key: string]: string } = {
      '🍴': 'food',
      '🏞️': 'attraction', 
      '🏨': 'accommodation',
      '🛍️': 'shopping',
      '🏥': 'hospital',
      '🏫': 'school',
      '🌳': 'park'
    };
    return emojiToType[emoji] || 'other';
  };

  // 篩選顯示的地點
  const filteredPlaces = places.filter(place => {
    // 根據篩選模式決定篩選邏輯
    switch (filterMode) {
      case 'all':
        return true; // 顯示所有地點
      case 'folders':
        return selectedFolders.length === 0 || selectedFolders.includes(place.folderId || 0);
      case 'types':
        if (selectedTypes.length === 0) return true;
        const placeType = getPlaceTypeFromEmoji(place.emoji || '📍');
        return selectedTypes.includes(placeType);
      default:
        return true;
    }
  });

  // 建立自訂標記圖示 - 簡約設計，無背景色
  const createMarkerIcon = (emoji: string) => {
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
          <!-- 白色陰影 -->
          <path d="M20 8 L20 8 C20 8, 20 8, 20 8" fill="white" stroke="white" stroke-width="2" opacity="0.3"/>
          
          <!-- 圖標容器 - 白色半透明圓形 -->
          <circle cx="20" cy="18" r="14" fill="white" fill-opacity="0.95" stroke="rgba(148, 163, 184, 0.3)" stroke-width="1.5"/>
          
          <!-- 圖標外框 - 深色邊框 -->
          <circle cx="20" cy="18" r="13" fill="none" stroke="rgba(100, 116, 139, 0.4)" stroke-width="1"/>
          
          <!-- 圖標文字 -->
          <text x="20" y="22" text-anchor="middle" font-size="16" font-family="Segoe UI Emoji, Apple Color Emoji, Arial">${emoji}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 48),
      anchor: new google.maps.Point(20, 48)
    };
  };

  // 不再需要自定義地點標記圖示，完全使用 Google Maps 原生 POI

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
        options={{
          gestureHandling: 'greedy',
          clickableIcons: true, // 啟用 Google Maps 內建 POI 點擊
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: false,
          zoomControl: true,
          disableDefaultUI: false,
          styles: [
            // 保持 Google Maps 預設的 POI 標籤顯示
            // 這樣機場、車站、景點等都會正常顯示
          ]
        }}
      >
        {/* 渲染地點標記 */}
        {filteredPlaces.map(place => {
          return (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => {
                onPlaceClick?.(place);
              }}
              icon={createMarkerIcon(place.emoji || '📍')}
            />
          );
        })}

        {/* 不再渲染自定義搜尋結果標記，完全使用 Google Maps 原生 POI */}
        {/* Google Maps 內建 POI 會自動顯示，點擊後會自動觸發我們的處理邏輯 */}

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

      {/* Google Maps 內建 POI 不需要載入指示器 */}

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