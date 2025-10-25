import { useState, useCallback, useEffect } from 'react';
import type { Folder, Place, PlacesSearchResult } from '../types';
import MapContainer from '../components/MapContainer';
import PlaceModal from '../components/PlaceModal';
import FolderSidebar from '../components/FolderSidebar';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import { usePlaces } from '../hooks/usePlaces';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../contexts/AuthContext';

function MapPage() {
  // 狀態管理
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [showFolderSidebar, setShowFolderSidebar] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [mapClickData, setMapClickData] = useState<{
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    types?: string[];
  } | null>(null);

  // 使用自定義 hooks
  const { user } = useAuth();
  const { folders, createPlace, updatePlace, deletePlace, loadData } = usePlaces();
  const { results: searchResults, search } = useSearch();

  // 初始化：登入後自動載入使用者資料
  useEffect(() => {
    if (user) {
      console.log('使用者已登入，載入資料...', user);
      loadData();
    }
  }, [user, loadData]);

  // 顯示所有地點
  const handleShowAllPlaces = useCallback(() => {
    setSelectedFolders([]);
  }, []);

  // 處理地圖點擊
  const handleMapClick = useCallback((lat: number, lng: number, placeInfo?: any) => {
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
  }, []);

  // 處理地點選擇
  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  // 處理地點建立完成
  const handlePlaceCreated = useCallback(async (placeData: any) => {
    try {
      const newPlace = await createPlace(placeData);
      setSelectedPlace(newPlace!);
      setShowPlaceModal(false);
      setMapClickData(null);
    } catch (error) {
      console.error('創建地點失敗:', error);
      alert('創建地點失敗');
    }
  }, [createPlace]);

  // 處理地點更新
  const handlePlaceUpdated = useCallback(async (placeData: any) => {
    if (!editingPlace) return;
    
    try {
      await updatePlace(editingPlace.id, placeData);
      setSelectedPlace(null);
      setEditingPlace(null);
      setShowPlaceModal(false);
    } catch (error) {
      console.error('更新地點失敗:', error);
      alert('更新地點失敗');
    }
  }, [editingPlace, updatePlace]);

  // 處理地點刪除
  const handlePlaceDeleted = useCallback(async (place: Place) => {
    if (window.confirm(`確定要刪除地點「${place.name}」嗎？`)) {
      try {
        await deletePlace(place.id);
        setSelectedPlace(null);
        alert('地點刪除成功');
      } catch (error) {
        console.error('刪除地點失敗:', error);
        alert('刪除地點失敗');
      }
    }
  }, [deletePlace]);

  // 處理搜尋結果選擇
  const handlePlaceSearch = useCallback((place: PlacesSearchResult) => {
    setMapClickData({
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      name: place.name,
      address: place.vicinity,
      placeId: place.place_id,
      rating: place.rating,
      types: place.types
    });
    setShowPlaceModal(true);
  }, []);

  // 處理搜尋提交
  const handleSearchSubmit = useCallback(async (query: string) => {
    try {
      await search(query);
    } catch (error) {
      console.error('搜尋失敗:', error);
    }
  }, [search]);

  // 處理編輯地點
  const handleEditPlace = useCallback((place: Place) => {
    setEditingPlace(place);
    setShowPlaceModal(true);
  }, []);

  // 關閉彈窗
  const handleCloseModal = useCallback(() => {
    setShowPlaceModal(false);
    setMapClickData(null);
    setEditingPlace(null);
  }, []);

  // 處理資料夾選擇
  const handleFolderSelect = useCallback((folder: Folder | null) => {
    setSelectedFolder(folder);
    if (folder) {
      setSelectedFolders([folder.id]);
    } else {
      setSelectedFolders([]);
    }
  }, []);

  // 處理資料夾更新
  const handleFolderUpdate = useCallback((updatedFolders: Folder[]) => {
    // 這裡可以更新本地狀態，但 usePlaces hook 已經處理了
    console.log('資料夾已更新:', updatedFolders);
  }, []);

  // 處理類型篩選
  const handleTypeFilter = useCallback((types: string[]) => {
    setSelectedTypes(types);
  }, []);


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 頂部導航列 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* 左側：Logo 和搜尋 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">🗺️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">TravelSpot Journal</h1>
          </div>
          
          {/* 搜尋列 */}
          <SearchBar 
            onPlaceSelect={handlePlaceSearch}
            onSearch={handleSearchSubmit}
          />
        </div>
        
        {/* 右側：控制按鈕 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleShowAllPlaces}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            🌍 顯示所有地點
          </button>
          
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📁 我的資料夾
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">C</span>
            </div>
            <span className="text-sm text-gray-600">chccc_0824</span>
            <button className="text-sm text-gray-500 hover:text-gray-700">登出</button>
          </div>
        </div>
      </div>
      
      {/* 主要內容區域 */}
      <div className="flex-1 flex">
        {/* 左側篩選面板 */}
        {showFilterPanel && (
          <div className="w-80 bg-white border-r border-gray-200 shadow-lg">
            <FilterPanel 
              folders={folders}
              selectedFolders={selectedFolders}
              onFolderSelect={setSelectedFolders}
              onShowAllPlaces={handleShowAllPlaces}
              onTypeFilter={handleTypeFilter}
              selectedTypes={selectedTypes}
            />
          </div>
        )}
        
        {/* 中間地圖區域 */}
        <div className="flex-1 relative">
          <MapContainer
            selectedFolders={selectedFolders}
            selectedTypes={selectedTypes}
            onPlaceClick={handlePlaceClick}
            onMapClick={handleMapClick}
            selectedPlace={selectedPlace}
            searchResults={searchResults}
            onSearchResultClick={handlePlaceSearch}
          />
        </div>
        
        {/* 右側地點資訊卡片 */}
        {selectedPlace && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-lg">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-800">{selectedPlace.name}</h3>
              {selectedPlace.address && (
                <p className="text-sm text-gray-600 mt-1">📍 {selectedPlace.address}</p>
              )}
              {selectedPlace.rating && (
                <p className="text-sm text-gray-600">⭐ {selectedPlace.rating}</p>
              )}
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleEditPlace(selectedPlace)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  編輯
                </button>
                <button
                  onClick={() => handlePlaceDeleted(selectedPlace)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 彈出式組件 */}
      <PlaceModal
        isOpen={showPlaceModal}
        onClose={handleCloseModal}
        onPlaceCreated={handlePlaceCreated}
        onPlaceUpdated={handlePlaceUpdated}
        initialData={mapClickData || undefined}
        editingPlace={editingPlace}
      />

      <FolderSidebar
        isOpen={showFolderSidebar}
        onClose={() => setShowFolderSidebar(false)}
        folders={folders}
        onFolderSelect={handleFolderSelect}
        onFolderUpdate={handleFolderUpdate}
        selectedFolder={selectedFolder}
      />
    </div>
  );
}

export default MapPage;