import React, { useState, useEffect } from 'react';
import type { Folder } from '../types';
// import { foldersApi } from '../services/data';

interface FilterPanelProps {
  folders: Folder[];
  selectedFolders: number[];
  onFolderSelect: (folderIds: number[]) => void;
  onShowAllPlaces: () => void;
  onTypeFilter?: (types: string[]) => void;
  selectedTypes?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  folders,
  selectedFolders,
  onFolderSelect,
  onShowAllPlaces,
  onTypeFilter,
  selectedTypes = []
}) => {
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);
  const [localSelectedTypes, setLocalSelectedTypes] = useState<string[]>(selectedTypes);

  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  useEffect(() => {
    setLocalSelectedTypes(selectedTypes);
  }, [selectedTypes]);


  const handleTypeToggle = (type: string) => {
    const newTypes = localSelectedTypes.includes(type)
      ? localSelectedTypes.filter(t => t !== type)
      : [...localSelectedTypes, type];
    
    setLocalSelectedTypes(newTypes);
    onTypeFilter?.(newTypes);
  };

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

  const placeTypes = [
    { value: 'restaurant', label: '🍴 餐廳', icon: '🍴' },
    { value: 'tourist_attraction', label: '🏛️ 景點', icon: '🏛️' },
    { value: 'lodging', label: '🏨 住宿', icon: '🏨' },
    { value: 'shopping_mall', label: '🛍️ 購物', icon: '🛍️' },
    { value: 'gas_station', label: '⛽ 加油站', icon: '⛽' },
    { value: 'hospital', label: '🏥 醫院', icon: '🏥' },
    { value: 'school', label: '🏫 學校', icon: '🏫' },
    { value: 'park', label: '🌳 公園', icon: '🌳' }
  ];


  return (
    <div className="h-full flex flex-col bg-white">
      {/* 標題 */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">篩選與顯示</h3>
      </div>

      {/* 內容 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 資料夾篩選 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">資料夾篩選</h4>
          <div className="space-y-2">
            <button
              onClick={handleSelectAll}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedFolders.length === 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌍 顯示所有地點
            </button>
            
            {localFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderToggle(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFolders.includes(folder.id)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{folder.icon}</span>
                  <span>{folder.name}</span>
                  {folder._count && (
                    <span className="text-xs text-gray-500">
                      ({folder._count.places})
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 地點類型篩選 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">地點類型</h4>
          <div className="grid grid-cols-2 gap-2">
            {placeTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeToggle(type.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  localSelectedTypes.includes(type.value)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 快速操作 */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">快速操作</h4>
          <div className="space-y-2">
            <button
              onClick={onShowAllPlaces}
              className="w-full text-left px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              🌍 顯示所有收藏地點
            </button>
            
            <button
              onClick={handleSelectNone}
              className="w-full text-left px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              🚫 清除所有篩選
            </button>
          </div>
        </div>
      </div>

      {/* 底部統計 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>已選擇資料夾:</span>
            <span>{selectedFolders.length}</span>
          </div>
          <div className="flex justify-between">
            <span>已選擇類型:</span>
            <span>{selectedTypes.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
