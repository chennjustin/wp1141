import { useState } from 'react';
import type { Folder, Place } from '../types';
import MapHeader from '../components/MapHeader';
import MapContainer from '../components/MapContainer';
import PlaceModal from '../components/PlaceModal';
import FolderSidebar from '../components/FolderSidebar';

function MapPage() {
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [showFolderSidebar, setShowFolderSidebar] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapClickData, setMapClickData] = useState<{
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    types?: string[];
  } | null>(null);

  // 處理地圖點擊
  const handleMapClick = (lat: number, lng: number, placeInfo?: any) => {
    setMapClickData({
      lat,
      lng,
      name: placeInfo?.name,
      address: placeInfo?.address,
      placeId: placeInfo?.placeId,
      rating: placeInfo?.rating,
      types: placeInfo?.types
    });
    setShowPlaceModal(true);
  };

  // 處理地點選擇
  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
  };

  // 處理地點建立完成
  const handlePlaceCreated = (place: Place) => {
    setSelectedPlace(place);
    // 這裡可以觸發地圖更新
    console.log('新地點已建立:', place);
  };

  // 處理資料夾選擇
  const handleFolderSelect = (folder: Folder | null) => {
    if (folder) {
      setSelectedFolders([folder.id]);
    } else {
      setSelectedFolders([]);
    }
  };

  // 處理篩選器變更
  const handleFoldersChange = (folderIds: number[]) => {
    setSelectedFolders(folderIds);
  };

  // 關閉彈窗
  const handleCloseModal = () => {
    setShowPlaceModal(false);
    setMapClickData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <MapHeader
        selectedFolders={selectedFolders}
        onFoldersChange={handleFoldersChange}
        onShowFolders={() => setShowFolderSidebar(true)}
      />

      {/* 主地圖區域 */}
      <div className="h-[calc(100vh-80px)]">
        <MapContainer
          selectedFolders={selectedFolders}
          onPlaceClick={handlePlaceClick}
          onMapClick={handleMapClick}
          selectedPlace={selectedPlace}
        />
      </div>

      {/* 地點新增/編輯彈窗 */}
      <PlaceModal
        isOpen={showPlaceModal}
        onClose={handleCloseModal}
        onPlaceCreated={handlePlaceCreated}
        initialData={mapClickData || undefined}
      />

      {/* 資料夾管理側邊欄 */}
      <FolderSidebar
        isOpen={showFolderSidebar}
        onClose={() => setShowFolderSidebar(false)}
        selectedFolderId={selectedFolders[0]}
        onFolderSelect={handleFolderSelect}
      />

      {/* 地點詳細資訊面板 */}
      {selectedPlace && (
        <div className="fixed bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-4 max-w-md mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{selectedPlace.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedPlace.name}</h3>
                  {selectedPlace.address && (
                    <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                  )}
                </div>
              </div>
              
              {selectedPlace.description && (
                <p className="text-sm text-gray-700 mb-2">{selectedPlace.description}</p>
              )}
              
              <div className="text-xs text-gray-500">
                <p>座標: {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}</p>
                {selectedPlace.folder && (
                  <p className="text-blue-600">📁 {selectedPlace.folder.name}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedPlace(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapPage;