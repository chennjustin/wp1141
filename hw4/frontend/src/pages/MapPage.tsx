import { useState } from 'react';
import type { Folder, Place, Entry } from '../types';
import FolderManager from '../components/FolderManager';
import PlaceManager from '../components/PlaceManager';
import MapView from '../components/MapView';
import EntryManager from '../components/EntryManager';

function MapPage() {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [activeTab, setActiveTab] = useState<'folders' | 'places' | 'entries'>('folders');

  // 處理資料夾選擇
  const handleFolderSelect = (folder: Folder | null) => {
    setSelectedFolder(folder);
    setSelectedPlace(null);
    setSelectedEntry(null);
  };

  // 處理地點選擇
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setSelectedEntry(null);
  };

  // 處理造訪紀錄選擇
  const handleEntrySelect = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  // 處理地圖點擊
  const handleMapClick = (lat: number, lng: number) => {
    // 這裡可以開啟新增地點的表單
    console.log('地圖點擊:', lat, lng);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">TravelSpot Journal</h1>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('folders')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'folders'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📁 資料夾
                </button>
                <button
                  onClick={() => setActiveTab('places')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'places'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📍 地點
                </button>
                <button
                  onClick={() => setActiveTab('entries')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'entries'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ⭐ 造訪紀錄
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 左側面板 - 管理功能 */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {activeTab === 'folders' && (
              <FolderManager 
                onFolderSelect={handleFolderSelect}
                selectedFolderId={selectedFolder?.id}
              />
            )}
            
            {activeTab === 'places' && (
              <PlaceManager 
                selectedFolderId={selectedFolder?.id}
                onPlaceSelect={handlePlaceSelect}
              />
            )}
            
            {activeTab === 'entries' && (
              <EntryManager 
                selectedPlaceId={selectedPlace?.id}
                onEntrySelect={handleEntrySelect}
              />
            )}
          </div>
        </div>

        {/* 右側面板 - 地圖和詳細資訊 */}
        <div className="flex-1 flex flex-col">
          {/* 地圖區域 */}
          <div className="flex-1 p-4">
            <MapView
              selectedFolderId={selectedFolder?.id}
              onPlaceClick={handlePlaceSelect}
              onMapClick={handleMapClick}
              selectedPlace={selectedPlace}
            />
          </div>

          {/* 詳細資訊面板 */}
          {(selectedFolder || selectedPlace || selectedEntry) && (
            <div className="h-64 bg-white border-t border-gray-200 overflow-y-auto">
              <div className="p-4">
                {selectedFolder && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedFolder.icon} {selectedFolder.name}
                    </h3>
                    {selectedFolder.description && (
                      <p className="text-gray-600 mb-2">{selectedFolder.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>建立時間: {new Date(selectedFolder.createdAt).toLocaleDateString()}</p>
                      {selectedFolder._count && (
                        <p>包含 {selectedFolder._count.places} 個地點</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedPlace && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedPlace.emoji} {selectedPlace.name}
                    </h3>
                    {selectedPlace.address && (
                      <p className="text-gray-600 mb-2">{selectedPlace.address}</p>
                    )}
                    {selectedPlace.description && (
                      <p className="text-gray-600 mb-2">{selectedPlace.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>座標: {selectedPlace.lat.toFixed(6)}, {selectedPlace.lng.toFixed(6)}</p>
                      {selectedPlace.folder && (
                        <p>資料夾: {selectedPlace.folder.name}</p>
                      )}
                      {selectedPlace._count && (
                        <p>造訪次數: {selectedPlace._count.entries}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedEntry && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedEntry.emoji} 造訪紀錄
                    </h3>
                    {selectedEntry.rating && (
                      <p className="text-yellow-500 mb-2">
                        {'⭐'.repeat(selectedEntry.rating)}
                      </p>
                    )}
                    {selectedEntry.note && (
                      <p className="text-gray-600 mb-2">{selectedEntry.note}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>造訪日期: {selectedEntry.visitedAt ? new Date(selectedEntry.visitedAt).toLocaleDateString() : '未設定'}</p>
                      {selectedEntry.weather && (
                        <p>天氣: {selectedEntry.weather}</p>
                      )}
                      {selectedEntry.photoUrl && (
                        <p>照片: <a href={selectedEntry.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">查看照片</a></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapPage;