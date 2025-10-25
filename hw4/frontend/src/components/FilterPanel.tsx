import React, { useState, useEffect } from 'react';
import type { Folder } from '../types';

interface FilterPanelProps {
  folders: Folder[];
  selectedFolders: number[];
  onFolderSelect: (folderIds: number[]) => void;
  onShowAllPlaces: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  folders,
  selectedFolders,
  onFolderSelect,
  onShowAllPlaces
}) => {
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);

  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  const handleFolderToggle = (folderId: number) => {
    if (selectedFolders.includes(folderId)) {
      onFolderSelect(selectedFolders.filter(id => id !== folderId));
    } else {
      onFolderSelect([...selectedFolders, folderId]);
    }
  };

  const handleSelectAll = () => {
    onFolderSelect([]);
  };

  const handleSelectNone = () => {
    onFolderSelect([]);
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl">
      {/* 標題區域 */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-maroon to-maroon/90">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">📁</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">我的資料夾</h3>
            <p className="text-sm text-white/80">管理您的收藏分類</p>
          </div>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 顯示所有選項 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">顯示選項</h4>
          <button
            onClick={handleSelectAll}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              selectedFolders.length === 0
                ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-lg">🌍</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium">顯示所有地點</p>
              <p className="text-xs opacity-80">查看所有收藏的地點</p>
            </div>
          </button>
        </div>

        {/* 資料夾列表 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">資料夾分類</h4>
          <div className="space-y-2">
            {localFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderToggle(folder.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  selectedFolders.includes(folder.id)
                    ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{folder.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium">{folder.name}</p>
                  {folder._count && (
                    <p className="text-xs opacity-80">{folder._count.places} 個地點</p>
                  )}
                </div>
                {selectedFolders.includes(folder.id) && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">快速操作</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onShowAllPlaces}
              className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">🌍</span>
              <span className="font-medium">顯示所有收藏</span>
            </button>
            <button
              onClick={handleSelectNone}
              className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">❌</span>
              <span className="font-medium">清除篩選</span>
            </button>
          </div>
        </div>
      </div>

      {/* 底部統計 */}
      <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-maroon rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">已選擇</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{selectedFolders.length} 個資料夾</span>
            <span className="text-sm text-gray-600">{localFolders.length} 個總計</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;