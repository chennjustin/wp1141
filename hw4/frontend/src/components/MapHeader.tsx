import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Folder, PlacesSearchResult } from '../types';
import { foldersApi } from '../services/data';
import SearchBar from './SearchBar';
import AdvancedSearch from './AdvancedSearch';

interface MapHeaderProps {
  selectedFolders: number[];
  onFoldersChange: (folderIds: number[]) => void;
  onShowFolders: () => void;
  onPlaceSearch: (place: PlacesSearchResult) => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  selectedFolders,
  onFoldersChange,
  onShowFolders,
  onPlaceSearch
}) => {
  const { user, logout } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

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
    loadFolders();
  }, []);

  // 處理資料夾選擇
  const handleFolderToggle = (folderId: number) => {
    if (selectedFolders.includes(folderId)) {
      onFoldersChange(selectedFolders.filter(id => id !== folderId));
    } else {
      onFoldersChange([...selectedFolders, folderId]);
    }
  };

  // 全選/取消全選
  const handleSelectAll = () => {
    if (selectedFolders.length === folders.length) {
      onFoldersChange([]);
    } else {
      onFoldersChange(folders.map(f => f.id));
    }
  };

  // 取得選中的資料夾名稱
  const getSelectedFolderNames = () => {
    if (selectedFolders.length === 0) return '顯示所有地點';
    if (selectedFolders.length === folders.length) return '所有資料夾';
    if (selectedFolders.length === 1) {
      const folder = folders.find(f => f.id === selectedFolders[0]);
      return folder ? `${folder.icon} ${folder.name}` : '1 個資料夾';
    }
    return `${selectedFolders.length} 個資料夾`;
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 左側：標題和搜尋 */}
        <div className="flex items-center space-x-4 flex-1">
          <h1 className="text-xl font-bold text-gray-800">🗺️ TravelSpot Journal</h1>
          
          {/* 搜尋欄 */}
          <div className="flex-1 max-w-md">
            <SearchBar
              onPlaceSelect={onPlaceSearch}
              onSearch={(query) => console.log('搜尋:', query)}
            />
          </div>
          
          {/* 進階搜尋按鈕 */}
          <button
            onClick={() => setShowAdvancedSearch(true)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            🔍 進階
          </button>
          
          {/* 篩選器下拉選單 */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              <span className="text-gray-700">
                📁 {getSelectedFolderNames()}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 下拉選單內容 */}
            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 text-sm">篩選資料夾</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {selectedFolders.length === folders.length ? '取消全選' : '全選'}
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {folders.map(folder => (
                      <label
                        key={folder.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFolders.includes(folder.id)}
                          onChange={() => handleFolderToggle(folder.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">{folder.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">{folder.name}</div>
                          {folder._count && (
                            <div className="text-xs text-gray-500">
                              {folder._count.places} 個地點
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {folders.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">尚無資料夾</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側：操作按鈕 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowFolders}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            <span>管理資料夾</span>
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>歡迎，{user?.username}</span>
            <button
              onClick={logout}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              登出
            </button>
          </div>
        </div>
      </div>

      {/* 篩選狀態顯示 */}
      {selectedFolders.length > 0 && (
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-xs text-gray-600">篩選條件：</span>
          <div className="flex flex-wrap gap-1">
            {selectedFolders.map(folderId => {
              const folder = folders.find(f => f.id === folderId);
              return folder ? (
                <span
                  key={folderId}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  <span>{folder.icon}</span>
                  <span>{folder.name}</span>
                  <button
                    onClick={() => handleFolderToggle(folderId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* 進階搜尋彈窗 */}
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onPlaceSelect={onPlaceSearch}
      />
    </div>
  );
};

export default MapHeader;