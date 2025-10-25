import { useState, useCallback, useEffect } from 'react';
import type { Folder, Place, PlacesSearchResult } from '../types';
import MapContainer from '../components/MapContainer';
import FilterDropdown from '../components/FilterDropdown';
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
  const [filterMode, setFilterMode] = useState<'all' | 'folders' | 'types'>('all');
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
  const { user, logout } = useAuth();
  const { folders, createPlace, updatePlace, deletePlace, loadData } = usePlaces();
  const { results: searchResults, search } = useSearch();

  // 初始化：登入後自動載入使用者資料
  useEffect(() => {
    if (user) {
      console.log('使用者已登入，載入資料...', user);
      loadData();
    }
  }, [user, loadData]);


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
  const handleFolderUpdate = useCallback(() => {
    // 觸發重新載入資料
    loadData();
  }, [loadData]);

  // 處理篩選模式變更
  const handleFilterModeChange = useCallback((mode: 'all' | 'folders' | 'types') => {
    setFilterMode(mode);
    if (mode === 'all') {
      setSelectedFolders([]);
      setSelectedTypes([]);
    }
  }, []);

  // 處理類型篩選
  const handleTypeFilter = useCallback((types: string[]) => {
    setSelectedTypes(types);
    setFilterMode('types');
  }, []);

  // 處理顯示所有地點
  const handleShowAllPlaces = useCallback(() => {
    setFilterMode('all');
    setSelectedFolders([]);
    setSelectedTypes([]);
  }, []);

  // 處理登出
  const handleLogout = useCallback(() => {
    try {
      logout(); // 調用 AuthContext 的 logout 函數
      console.log('使用者已登出');
      // 可以選擇重定向到登入頁面
      // window.location.href = '/login';
    } catch (error) {
      console.error('登出失敗:', error);
    }
  }, [logout]);



    return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 現代化頂部導航列 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* 左側：Logo 和標題 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-maroon to-maroon/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🗺️</span>
          </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">TravelSpot Journal</h1>
                <p className="text-sm text-gray-500">探索世界，記錄回憶</p>
          </div>
        </div>
      </div>
          
          {/* 中間：搜尋列 */}
          <div className="flex-1 max-w-2xl mx-8">
            <SearchBar 
              onPlaceSelect={handlePlaceSearch}
              onSearch={handleSearchSubmit}
            />
      </div>
          
          {/* 右側：控制按鈕和用戶資訊 */}
          <div className="flex items-center space-x-4">
            <FilterDropdown
              folders={folders}
              selectedFolders={selectedFolders}
              selectedTypes={selectedTypes}
              filterMode={filterMode}
              onFilterModeChange={handleFilterModeChange}
              onFolderSelect={setSelectedFolders}
              onTypeFilter={handleTypeFilter}
              onShowAllPlaces={handleShowAllPlaces}
            />
            
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                showFilterPanel 
                  ? 'bg-maroon text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>📁</span>
              <span className="font-medium">我的資料夾</span>
            </button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-maroon/20 to-maroon/10 rounded-full flex items-center justify-center">
                <span className="text-maroon font-bold text-lg">C</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">chccc_0824</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-maroon transition-colors cursor-pointer px-2 py-1 rounded hover:bg-maroon/10"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 - 現代化佈局 */}
      <div className="flex-1 flex relative bg-gray-50">
        {/* 左側篩選面板 - 現代化設計 */}
        {showFilterPanel && (
          <div className="w-80 h-full bg-white shadow-2xl z-30 transform transition-transform duration-300 ease-in-out">
            <FilterPanel 
              folders={folders}
              selectedFolders={selectedFolders}
              onFolderSelect={setSelectedFolders}
              onShowAllPlaces={handleShowAllPlaces}
            />
          </div>
        )}
        
        {/* 地圖區域 - 現代化容器 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
          <MapContainer
            selectedFolders={selectedFolders}
            selectedTypes={selectedTypes}
            filterMode={filterMode}
            onPlaceClick={handlePlaceClick}
            onMapClick={handleMapClick}
            selectedPlace={selectedPlace}
            searchResults={searchResults}
            onSearchResultClick={handlePlaceSearch}
        />
      </div>
    </div>
        
        {/* 右側地點資訊卡片 - 現代化設計 */}
        {selectedPlace && (
          <div className="w-96 h-full bg-white shadow-2xl z-20 transform transition-transform duration-300 ease-in-out">
            <div className="h-full flex flex-col">
              {/* 標題區域 */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-maroon to-maroon/90">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">{selectedPlace.emoji || '📍'}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{selectedPlace.name}</h3>
                    <p className="text-sm text-white/80">收藏地點詳情</p>
                  </div>
                </div>
              </div>
              
              {/* 內容區域 */}
              <div className="flex-1 p-6 space-y-4">
                {selectedPlace.address && (
                  <div className="flex items-start space-x-3">
                    <span className="text-maroon text-lg">📍</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">地址</p>
                      <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                    </div>
                  </div>
                )}
                
                {selectedPlace.rating && (
                  <div className="flex items-start space-x-3">
                    <span className="text-maroon text-lg">⭐</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">我的評分</p>
                      <p className="text-sm text-gray-600">{selectedPlace.rating}/5 星</p>
                    </div>
                  </div>
                )}
                
                {selectedPlace.description && (
                  <div className="flex items-start space-x-3">
                    <span className="text-maroon text-lg">📝</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700">心得備註</p>
                      <p className="text-sm text-gray-600">{selectedPlace.description}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 操作按鈕區域 */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEditPlace(selectedPlace)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-maroon to-maroon/90 text-white rounded-xl hover:from-maroon/90 hover:to-maroon/80 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span>✏️</span>
                    <span className="font-medium">編輯</span>
                  </button>
                  <button
                    onClick={() => handlePlaceDeleted(selectedPlace)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span>🗑️</span>
                    <span className="font-medium">刪除</span>
                  </button>
                </div>
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