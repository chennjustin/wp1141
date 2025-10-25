import React, { useState } from 'react';
import type { Folder } from '../types';

interface FilterDropdownProps {
  folders: Folder[];
  selectedFolders: number[];
  selectedTypes: string[];
  filterMode: 'all' | 'folders' | 'types';
  onFilterModeChange: (mode: 'all' | 'folders' | 'types') => void;
  onFolderSelect: (folderIds: number[]) => void;
  onTypeFilter: (types: string[]) => void;
  onShowAllPlaces: () => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  folders,
  selectedFolders,
  selectedTypes,
  filterMode,
  onFilterModeChange,
  onFolderSelect,
  onTypeFilter,
  onShowAllPlaces
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 地點類型選項
  const placeTypeOptions = [
    { value: 'food', label: '🍴 美食', icon: '🍴' },
    { value: 'attraction', label: '🏞️ 景點', icon: '🏞️' },
    { value: 'accommodation', label: '🏨 住宿', icon: '🏨' },
    { value: 'shopping', label: '🛍️ 購物', icon: '🛍️' },
    { value: 'hospital', label: '🏥 醫院', icon: '🏥' },
    { value: 'school', label: '🏫 學校', icon: '🏫' },
    { value: 'park', label: '🌳 公園', icon: '🌳' },
    { value: 'other', label: '📍 其他', icon: '📍' }
  ];

  const handleFolderToggle = (folderId: number) => {
    if (selectedFolders.includes(folderId)) {
      onFolderSelect(selectedFolders.filter(id => id !== folderId));
    } else {
      onFolderSelect([...selectedFolders, folderId]);
    }
  };

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeFilter(selectedTypes.filter(t => t !== type));
    } else {
      onTypeFilter([...selectedTypes, type]);
    }
  };

  const getFilterText = () => {
    switch (filterMode) {
      case 'all':
        return '🌍 顯示所有地點';
      case 'folders':
        return `📁 資料夾篩選 (${selectedFolders.length})`;
      case 'types':
        return `🏷️ 類型篩選 (${selectedTypes.length})`;
      default:
        return '🌍 顯示所有地點';
    }
  };

  return (
    <div className="relative">
      {/* 下拉式選單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-maroon to-maroon/90 text-white rounded-lg hover:from-maroon/90 hover:to-maroon/80 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <span>🔍</span>
        <span className="font-medium">{getFilterText()}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 下拉式選單內容 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
          <div className="p-4">
            {/* 篩選模式選擇 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">篩選模式</h4>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => {
                    onFilterModeChange('all');
                    onShowAllPlaces();
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    filterMode === 'all'
                      ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">🌍</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">顯示所有地點</p>
                    <p className="text-xs opacity-80">查看所有收藏的地點</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onFilterModeChange('folders');
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    filterMode === 'folders'
                      ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">📁</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">資料夾篩選</p>
                    <p className="text-xs opacity-80">按資料夾分類顯示</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onFilterModeChange('types');
                    setIsOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    filterMode === 'types'
                      ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">🏷️</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">類型篩選</p>
                    <p className="text-xs opacity-80">按地點類型顯示</p>
                  </div>
                </button>
              </div>
            </div>

            {/* 資料夾篩選 */}
            {filterMode === 'folders' && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">選擇資料夾</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderToggle(folder.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        selectedFolders.includes(folder.id)
                          ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg">{folder.icon}</span>
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
            )}

            {/* 類型篩選 */}
            {filterMode === 'types' && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">選擇類型</h4>
                <div className="grid grid-cols-2 gap-2">
                  {placeTypeOptions.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeToggle(type.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        selectedTypes.includes(type.value)
                          ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 快速操作 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onShowAllPlaces();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  <span>🌍</span>
                  <span>顯示所有</span>
                </button>
                <button
                  onClick={() => {
                    onFilterModeChange('all');
                    onShowAllPlaces();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  <span>❌</span>
                  <span>清除篩選</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
