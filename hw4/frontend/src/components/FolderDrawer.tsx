import React, { useState } from 'react';
import type { Folder, Place } from '../types';
import CreateFolderModal from './CreateFolderModal';

interface FolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  places: Place[];
  selectedFolder: Folder | null;
  onFolderSelect: (folder: Folder | null) => void;
  onPlaceSelect: (place: Place) => void;
  onCreateFolder: (folderData: { name: string; icon: string }) => void;
  onDeleteFolder: (folder: Folder) => void;
}

const FolderDrawer: React.FC<FolderDrawerProps> = ({
  isOpen,
  onClose,
  folders,
  places,
  selectedFolder,
  onFolderSelect,
  onPlaceSelect,
  onCreateFolder,
  onDeleteFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getPlacesInFolder = (folderId: number) => {
    return places.filter(place => place.folderId === folderId);
  };

  const handleFolderClick = (folder: Folder) => {
    onFolderSelect(folder);
    toggleFolder(folder.id);
  };

  const handleCreateFolder = (folderData: { name: string; icon: string }) => {
    onCreateFolder(folderData);
    setShowCreateModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 抽屜內容 */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-sm shadow-float z-50 transform transition-transform duration-300">
        <div className="h-full flex flex-col">
          {/* 標題區域 */}
          <div className="p-6 border-b border-mist/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-stone">我的資料夾</h2>
                <p className="text-sm text-warm-gray mt-1">管理您的收藏分類</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-mist/30 flex items-center justify-center hover:bg-mist/50 transition-colors"
              >
                <span className="text-warm-gray text-sm">✕</span>
              </button>
            </div>
          </div>

          {/* 內容區域 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4 max-h-[60vh]">
              {/* 資料夾列表 */}
              {folders.map((folder) => {
                const folderPlaces = getPlacesInFolder(folder.id);
                const isExpanded = expandedFolders.has(folder.id);
                const isSelected = selectedFolder?.id === folder.id;

                return (
                  <div key={folder.id} className="space-y-2">
                    {/* 資料夾卡片 */}
                    <button
                      onClick={() => handleFolderClick(folder)}
                      className={`w-full flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'bg-slate-blue/5 border-slate-blue/30'
                          : 'bg-white border-mist/30 hover:border-slate-blue/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center">
                        <span className="text-lg">{folder.icon}</span>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-stone">{folder.name}</p>
                        <p className="text-xs text-warm-gray mt-0.5">{folderPlaces.length} 個地點</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`確定要刪除「${folder.name}」嗎？`)) {
                              onDeleteFolder(folder);
                            }
                          }}
                          className="text-warm-gray hover:text-red-500 transition-colors p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </button>

                    {/* 展開的地點列表 */}
                    {isExpanded && (
                      <div className="ml-4 animate-fade-in">
                        {folderPlaces.length > 0 ? (
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {folderPlaces.map((place) => (
                              <button
                                key={place.id}
                                onClick={() => onPlaceSelect(place)}
                                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-mist/30 transition-colors"
                              >
                                <span className="text-sm">{place.emoji || '📍'}</span>
                                <span className="flex-1 text-left text-sm text-stone">{place.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-warm-gray p-2">此資料夾暫無地點</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部操作區域 */}
          <div className="p-6 border-t border-mist/50 bg-cream/30">
             <div className="flex space-x-3">
               <button
                 onClick={() => setShowCreateModal(true)}
                 className="flex-1 px-4 py-2.5 bg-slate-blue/10 text-slate-blue rounded-full hover:bg-slate-blue/20 transition-all duration-200 text-sm font-medium"
               >
                 ➕ 新增資料夾
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* 新增資料夾 Modal */}
      <CreateFolderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFolder}
      />
    </>
  );
};

export default FolderDrawer;
