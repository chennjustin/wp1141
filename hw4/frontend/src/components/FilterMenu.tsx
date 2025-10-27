import React, { useState } from 'react';
import type { Folder } from '../types';

interface FilterMenuProps {
  folders: Folder[];
  selectedFolders: number[];
  selectedTypes: string[];
  filterMode: 'all' | 'folders' | 'types';
  onFilterModeChange: (mode: 'all' | 'folders' | 'types') => void;
  onFolderSelect: (folderIds: number[]) => void;
  onTypeFilter: (types: string[]) => void;
}

const FilterMenu: React.FC<FilterMenuProps> = ({
  folders,
  selectedFolders,
  selectedTypes,
  filterMode,
  onFilterModeChange,
  onFolderSelect,
  onTypeFilter
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 地點類型選項
  const placeTypeOptions = [
    { value: 'food', label: '美食', icon: '🍴', color: 'bg-orange-50 text-orange-600' },
    { value: 'attraction', label: '景點', icon: '🏞️', color: 'bg-green-50 text-green-600' },
    { value: 'accommodation', label: '住宿', icon: '🏨', color: 'bg-blue-50 text-blue-600' },
    { value: 'shopping', label: '購物', icon: '🛍️', color: 'bg-purple-50 text-purple-600' },
    { value: 'hospital', label: '醫院', icon: '🏥', color: 'bg-red-50 text-red-600' },
    { value: 'school', label: '學校', icon: '🏫', color: 'bg-yellow-50 text-yellow-600' },
    { value: 'park', label: '公園', icon: '🌳', color: 'bg-emerald-50 text-emerald-600' },
    { value: 'other', label: '其他', icon: '📍', color: 'bg-gray-50 text-gray-600' }
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
        return `📁 依資料夾篩選 (${selectedFolders.length})`;
      case 'types':
        return `🏷️ 依類型篩選 (${selectedTypes.length})`;
      default:
        return '🌍 顯示所有地點';
    }
  };

  return (
    <div className="relative">
      {/* 觸發按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-white/90 backdrop-blur-sm text-stone rounded-xl shadow-soft hover:shadow-float transition-all duration-300 flex items-center space-x-2"
      >
        <span className="text-sm font-medium">{getFilterText()}</span>
        <span className={`text-xs transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 選單內容 */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-float border border-mist/30 z-50 animate-fade-in">
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {/* 篩選模式選擇 */}
              <div>
                <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">篩選模式</h4>
                <div className="space-y-2">
                  {[
                    { mode: 'all' as const, icon: '🌍', label: '顯示所有地點', desc: '查看所有收藏' },
                    { mode: 'folders' as const, icon: '📁', label: '依資料夾篩選', desc: '按資料夾分類' },
                    { mode: 'types' as const, icon: '🏷️', label: '依類型篩選', desc: '按地點類型' }
                  ].map(({ mode, icon, label, desc }) => (
                    <button
                      key={mode}
                      onClick={() => {
                        onFilterModeChange(mode);
                        if (mode === 'all') {
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                        filterMode === mode
                          ? 'bg-slate-blue/5 border-slate-blue/30'
                          : 'border-mist/30 hover:border-slate-blue/30'
                      }`}
                    >
                      <span className="text-base">{icon}</span>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-stone">{label}</p>
                        <p className="text-xs text-warm-gray">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 資料夾篩選 */}
              {filterMode === 'folders' && (
                <div>
                  <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">選擇資料夾</h4>
                  <div className="space-y-2">
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => handleFolderToggle(folder.id)}
                        className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-300 ${
                          selectedFolders.includes(folder.id)
                            ? 'bg-slate-blue/5'
                            : 'hover:bg-mist/30'
                        }`}
                      >
                        <span>{folder.icon}</span>
                        <span className="flex-1 text-left text-sm text-stone">{folder.name}</span>
                        {selectedFolders.includes(folder.id) && (
                          <div className="w-1.5 h-1.5 bg-slate-blue rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 類型篩選 */}
              {filterMode === 'types' && (
                <div>
                  <h4 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">選擇類型</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {placeTypeOptions.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeToggle(type.value)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                          selectedTypes.includes(type.value)
                            ? 'bg-slate-blue/10 text-slate-blue'
                            : 'bg-mist/30 text-stone hover:bg-mist/50'
                        }`}
                      >
                        <span>{type.icon}</span>
                        <span className="text-xs">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterMenu;
