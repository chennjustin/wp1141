import { useState, useCallback, useEffect } from 'react';
import type { Folder, Place, PlacesSearchResult } from '../types';
import MapContainer from '../components/MapContainer';
import PlaceInfoCard from '../components/PlaceInfoCard';
import FilterMenu from '../components/FilterMenu';
import FolderDrawer from '../components/FolderDrawer';
import PlaceModal from '../components/PlaceModal';
import SearchBar from '../components/SearchBar';
import { usePlaces } from '../hooks/usePlaces';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../contexts/AuthContext';

function MapPage() {
  // 狀態管理
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const [showFolderDrawer, setShowFolderDrawer] = useState(false);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [selectedFolder] = useState<Folder | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'folders' | 'types'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [resetZoomTrigger, setResetZoomTrigger] = useState(0);
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
  const { places, folders, updatePlace, deletePlace, createFolder, deleteFolder, loadData } = usePlaces();
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
    console.log('MapPage handleMapClick 收到資料:', JSON.stringify(placeInfo, null, 2));
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

  // 處理地點點擊
  const handlePlaceClick = useCallback((place: Place) => {
    setSelectedPlace(place);
  }, []);

  // 處理地點儲存
  const handlePlaceSave = useCallback(async (place: Place, updatedData: any) => {
    try {
      await updatePlace(place.id, updatedData);
      setSelectedPlace({ ...place, ...updatedData });
      // 觸發重新載入
      setRefreshTrigger(prev => prev + 1);
      await loadData();
    } catch (error) {
      console.error('更新地點失敗:', error);
    }
  }, [updatePlace, loadData]);

  // 處理搜尋結果選擇（點擊搜尋結果標記）
  const handlePlaceSearch = useCallback((result: PlacesSearchResult) => {
    console.log('選擇搜尋結果:', result);
    // 只將搜尋結果傳給 MapContainer 進行 zoom in，不打開 Modal
    if (result.geometry && result.geometry.location) {
      // 通知 MapContainer 進行 zoom in
      setMapClickData({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        name: result.name,
        address: result.vicinity || '',
        placeId: result.place_id,
        rating: result.rating,
        types: result.types
      });
      // 不自動打開 Modal，讓使用者確認後自己點擊地點
    }
  }, []);

  // 處理搜尋提交
  const handleSearchSubmit = useCallback(async (query: string) => {
    try {
      console.log('處理搜尋提交:', query);
      
      // 重置 zoom 狀態，允許新的搜尋進行 zoom in
      setResetZoomTrigger(prev => prev + 1);
      
      const response = await search(query);
      
      // 如果有搜尋結果，自動選擇第一個結果並 zoom in
      if (response && response.length > 0) {
        console.log('搜尋到結果，自動 zoom in 到第一個結果:', response[0]);
        handlePlaceSearch(response[0]);
      } else {
        console.log('沒有搜尋到結果');
      }
    } catch (error) {
      console.error('搜尋提交失敗:', error);
    }
  }, [search, handlePlaceSearch]);

  // 處理地點創建 - 注意：API 已經在 PlaceModal 中調用，這裡只需要更新 UI
  const handlePlaceCreated = useCallback(async (place: any) => {
    try {
      setSelectedPlace(place);
      setShowPlaceModal(false);
      setMapClickData(null);
      // 觸發 MapContainer 重新載入
      setRefreshTrigger(prev => prev + 1);
      // 同時重新載入 MapPage 的資料夾列表
      await loadData();
    } catch (error) {
      console.error('處理地點創建失敗:', error);
    }
  }, [loadData]);

  // 處理地點更新 - 注意：API 已經在 PlaceModal 中調用，這裡只需要更新 UI
  const handlePlaceUpdated = useCallback(async (place: any) => {
    try {
      setSelectedPlace(place);
      setShowPlaceModal(false);
      setEditingPlace(null);
      // 觸發 MapContainer 重新載入
      setRefreshTrigger(prev => prev + 1);
      // 同時重新載入 MapPage 的資料夾列表
      await loadData();
    } catch (error) {
      console.error('處理地點更新失敗:', error);
    }
  }, [loadData]);

  // 處理地點刪除
  const handlePlaceDeleted = useCallback(async (place: Place) => {
    if (!confirm(`確定要刪除「${place.name}」嗎？`)) {
      return;
    }
    try {
      await deletePlace(place.id);
      setSelectedPlace(null);
      // 觸發 MapContainer 重新載入
      setRefreshTrigger(prev => prev + 1);
      // 同時重新載入 MapPage 的資料夾列表
      await loadData();
    } catch (error) {
      console.error('刪除地點失敗:', error);
    }
  }, [deletePlace, loadData]);

  // 處理編輯地點
  const handleEditPlace = useCallback((place: Place) => {
    setEditingPlace(place);
    setShowPlaceModal(true);
  }, []);

  // 處理關閉 Modal
  const handleCloseModal = useCallback(() => {
    setShowPlaceModal(false);
    setMapClickData(null);
    setEditingPlace(null);
  }, []);

  // 處理資料夾選擇
  const handleFolderSelect = useCallback((folder: Folder | null) => {
    if (folder) {
      setSelectedFolders([folder.id]);
    } else {
      setSelectedFolders([]);
    }
  }, []);


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


  // 處理登出
  const handleLogout = useCallback(() => {
    try {
      logout();
      console.log('使用者已登出');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  }, [logout]);

    return (
    <div className="fixed inset-0 flex flex-col bg-cream overflow-hidden">
      {/* 極簡頂部導覽列 */}
      <header className="relative h-16 bg-white/80 backdrop-blur-smooth border-b border-mist/50 shadow-soft z-50">
        <div className="h-full px-6 flex items-center justify-between">
          {/* 左側 Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-blue/10 flex items-center justify-center">
              <span className="text-lg">🗺️</span>
            </div>
            <h1 className="text-lg font-light text-stone tracking-wide">TravelSpot Journal</h1>
          </div>
          
          {/* 中央搜尋列 */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <SearchBar 
                onPlaceSelect={handlePlaceSearch}
                onSearch={handleSearchSubmit}
              />
            </div>
          </div>
          
          {/* 右側使用者區域 */}
          <div className="flex items-center space-x-4">
            <div className="group relative">
              <button className="w-9 h-9 rounded-full bg-slate-blue/20 flex items-center justify-center hover:bg-slate-blue/30 transition-colors duration-300">
                <span className="text-sm font-medium text-slate-blue">C</span>
              </button>
              {/* 使用者選單 */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-smooth rounded-lg shadow-float opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="p-3 border-b border-mist">
                  <p className="text-sm font-medium text-stone">chccc_0824</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-warm-gray hover:text-stone hover:bg-mist/30 transition-colors"
                >
                  登出
                </button>
          </div>
          </div>
        </div>
      </div>
      </header>

      {/* 主要內容區域 */}
      <main className="flex-1 relative">
        {/* 地圖容器 */}
        <div className="absolute inset-0">
          <MapContainer
            selectedFolders={selectedFolders}
            selectedTypes={selectedTypes}
            filterMode={filterMode}
            onPlaceClick={handlePlaceClick}
            onMapClick={handleMapClick}
            selectedPlace={selectedPlace}
            searchResults={searchResults}
            refreshTrigger={refreshTrigger}
            mapClickData={mapClickData}
            resetZoomTrigger={resetZoomTrigger}
          />
      </div>

        {/* 右上角功能群 */}
        <div className="absolute top-6 right-6 flex flex-col space-y-3 z-40">
          <FilterMenu
            folders={folders}
            selectedFolders={selectedFolders}
            selectedTypes={selectedTypes}
            filterMode={filterMode}
            onFilterModeChange={handleFilterModeChange}
            onFolderSelect={setSelectedFolders}
            onTypeFilter={handleTypeFilter}
          />
          
                <button
            onClick={() => setShowFolderDrawer(true)}
            className="px-4 py-2.5 bg-white/90 backdrop-blur-sm text-stone rounded-xl shadow-soft hover:shadow-float transition-all duration-300"
                >
            <span className="text-sm font-medium">📁 資料夾</span>
                </button>
              </div>

        {/* 地點資訊卡 - 左側固定 */}
        {selectedPlace && (
          <PlaceInfoCard
            place={selectedPlace}
            folders={folders}
            onClose={() => setSelectedPlace(null)}
            onEdit={handleEditPlace}
            onDelete={handlePlaceDeleted}
            onSave={handlePlaceSave}
          />
        )}

        {/* 資料夾抽屜 */}
        <FolderDrawer
          isOpen={showFolderDrawer}
          onClose={() => setShowFolderDrawer(false)}
          folders={folders}
          places={places}
          selectedFolder={selectedFolder}
          onFolderSelect={handleFolderSelect}
          onPlaceSelect={handlePlaceClick}
           onCreateFolder={async (folderData: { name: string; icon: string }) => {
             try {
               await createFolder(folderData);
               await loadData();
               setRefreshTrigger(prev => prev + 1);
             } catch (error) {
               console.error('創建資料夾失敗:', error);
             }
           }}
          onDeleteFolder={async (folder) => {
            try {
              await deleteFolder(folder.id);
              await loadData();
              setRefreshTrigger(prev => prev + 1);
            } catch (error) {
              console.error('刪除資料夾失敗:', error);
            }
          }}
        />
      </main>

      {/* 彈出式組件 */}
      <PlaceModal
        isOpen={showPlaceModal}
        onClose={handleCloseModal}
        onPlaceCreated={handlePlaceCreated}
        onPlaceUpdated={handlePlaceUpdated}
        initialData={editingPlace || mapClickData || undefined}
        editingPlace={editingPlace}
      />

      </div>
  );
}

export default MapPage;