import React, { useState, useEffect } from 'react';
import type { Folder } from '../types';
import { foldersApi } from '../services/data';

interface MapHeaderProps {
  selectedFolders: number[];
  onFoldersChange: (folderIds: number[]) => void;
  onShowFolders: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({
  selectedFolders,
  onFoldersChange,
  onShowFolders
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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
    <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左側：標題和篩選器 */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">🗺️ TravelSpot Journal</h1>
          
          {/* 篩選器下拉選單 */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700">
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
              <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">篩選資料夾</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedFolders.length === folders.length ? '取消全選' : '全選'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {folders.map(folder => (
                      <label
                        key={folder.id}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFolders.includes(folder.id)}
                          onChange={() => handleFolderToggle(folder.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg">{folder.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{folder.name}</div>
                          {folder._count && (
                            <div className="text-sm text-gray-500">
                              {folder._count.places} 個地點
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {folders.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>尚無資料夾</p>
                      <p className="text-sm">請先建立資料夾來組織您的地點</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右側：操作按鈕 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onShowFolders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            <span>管理資料夾</span>
          </button>
        </div>
      </div>

      {/* 篩選狀態顯示 */}
      {selectedFolders.length > 0 && (
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-sm text-gray-600">篩選條件：</span>
          <div className="flex flex-wrap gap-2">
            {selectedFolders.map(folderId => {
              const folder = folders.find(f => f.id === folderId);
              return folder ? (
                <span
                  key={folderId}
                  className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
    </div>
  );
};

export default MapHeader;
