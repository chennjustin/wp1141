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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 標題區域 */}
      <div className="p-6 border-b border-mist">
        <h2 className="text-xl font-light text-stone">我的資料夾</h2>
        <p className="text-sm text-warm-gray mt-1">管理您的收藏分類</p>
      </div>

      {/* 內容區域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* 顯示所有選項 */}
        <button
          onClick={handleSelectAll}
          className={`w-full flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 ${
            selectedFolders.length === 0
              ? 'bg-slate-blue/5 border-slate-blue/30 shadow-soft'
              : 'bg-white border-mist hover:border-slate-blue/30'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center">
            <span className="text-lg">🌍</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-stone">顯示所有地點</p>
            <p className="text-xs text-warm-gray mt-0.5">查看所有收藏的地點</p>
          </div>
        </button>

        {/* 資料夾列表 */}
        {localFolders.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">資料夾分類</h3>
            {localFolders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderToggle(folder.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                  selectedFolders.includes(folder.id)
                    ? 'bg-slate-blue/5 border-slate-blue/30 shadow-soft'
                    : 'bg-white border-mist hover:border-slate-blue/30'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-cream flex items-center justify-center">
                  <span className="text-base">{folder.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-stone">{folder.name}</p>
                  {folder._count && (
                    <p className="text-xs text-warm-gray mt-0.5">{folder._count.places} 個地點</p>
                  )}
                </div>
                {selectedFolders.includes(folder.id) && (
                  <div className="w-2 h-2 bg-slate-blue rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 快速操作 */}
        <div className="pt-4 border-t border-mist">
          <h3 className="text-xs font-medium text-warm-gray uppercase tracking-wider mb-3">快速操作</h3>
          <div className="space-y-2">
            <button
              onClick={onShowAllPlaces}
              className="w-full px-4 py-2.5 bg-moss/10 text-moss rounded-lg hover:bg-moss/20 transition-colors text-sm font-light"
            >
              🌍 顯示所有收藏
            </button>
            <button
              onClick={handleSelectAll}
              className="w-full px-4 py-2.5 bg-warm-gray/10 text-warm-gray rounded-lg hover:bg-warm-gray/20 transition-colors text-sm font-light"
            >
              ❌ 清除篩選
            </button>
          </div>
        </div>
      </div>

      {/* 底部統計 */}
      <div className="p-4 border-t border-mist bg-cream/30">
        <div className="flex items-center justify-between text-xs">
          <span className="text-warm-gray">已選擇</span>
          <span className="text-stone font-medium">
            {selectedFolders.length} / {localFolders.length} 個資料夾
          </span>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;