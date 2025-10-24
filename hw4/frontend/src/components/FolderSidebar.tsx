import React, { useState, useEffect } from 'react';
import type { Folder, Place } from '../types';
import { foldersApi, placesApi } from '../services/data';

interface FolderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFolderId?: number;
  onFolderSelect: (folder: Folder | null) => void;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  isOpen,
  onClose,
  selectedFolderId,
  onFolderSelect
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    parentId: undefined as number | undefined
  });

  // 載入資料夾
  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await foldersApi.getAll();
      if (response.data) {
        setFolders(response.data);
      }
    } catch (error) {
      console.error('載入資料夾失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 載入地點
  const loadPlaces = async () => {
    try {
      const response = await placesApi.getAll();
      if (response.data) {
        setPlaces(response.data);
      }
    } catch (error) {
      console.error('載入地點失敗:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFolders();
      loadPlaces();
    }
  }, [isOpen]);

  // 建立資料夾
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await foldersApi.create(formData);
      if (response.data) {
        await loadFolders();
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          icon: '📁',
          parentId: undefined
        });
      }
    } catch (error) {
      console.error('建立資料夾失敗:', error);
    }
  };

  // 更新資料夾
  const handleUpdateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder) return;

    try {
      const response = await foldersApi.update(editingFolder.id, formData);
      if (response.data) {
        await loadFolders();
        setEditingFolder(null);
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          icon: '📁',
          parentId: undefined
        });
      }
    } catch (error) {
      console.error('更新資料夾失敗:', error);
    }
  };

  // 刪除資料夾
  const handleDeleteFolder = async (folder: Folder) => {
    if (!confirm(`確定要刪除資料夾「${folder.name}」嗎？`)) return;

    try {
      await foldersApi.delete(folder.id);
      await loadFolders();
      if (selectedFolderId === folder.id) {
        onFolderSelect(null);
      }
    } catch (error) {
      console.error('刪除資料夾失敗:', error);
    }
  };

  // 切換展開/收合
  const toggleExpanded = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  // 開始編輯
  const startEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#3B82F6',
      icon: folder.icon || '📁',
      parentId: folder.parentId
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingFolder(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '📁',
      parentId: undefined
    });
  };

  // 渲染資料夾樹
  const renderFolderTree = (folderList: Folder[], parentId: number | null = null, level: number = 0) => {
    const children = folderList.filter(f => f.parentId === parentId);
    
    return children.map(folder => {
      const folderPlaces = places.filter(p => p.folderId === folder.id);
      
      return (
        <div key={folder.id} className="ml-4">
          <div 
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
              selectedFolderId === folder.id ? 'bg-blue-50 border border-blue-200' : ''
            }`}
            style={{ marginLeft: `${level * 16}px` }}
          >
            <div 
              className="flex items-center flex-1"
              onClick={() => {
                onFolderSelect(folder);
                toggleExpanded(folder.id);
              }}
            >
              <button
                className="mr-2 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(folder.id);
                }}
              >
                {folder.children && folder.children.length > 0 ? 
                  (expandedFolders.has(folder.id) ? '📂' : '📁') : '📄'
                }
              </button>
              <span className="mr-2 text-lg">{folder.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{folder.name}</div>
                <div className="text-sm text-gray-500">
                  {folderPlaces.length} 個地點
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(folder);
                }}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="編輯"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder);
                }}
                className="p-1 text-gray-400 hover:text-red-600"
                title="刪除"
              >
                🗑️
              </button>
            </div>
          </div>
          
          {expandedFolders.has(folder.id) && folder.children && (
            <div>
              {renderFolderTree(folderList, folder.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 側邊欄內容 */}
      <div className="relative bg-white/95 backdrop-blur-md w-96 h-full shadow-2xl overflow-y-auto">
        {/* 標題列 */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">📁 資料夾管理</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新增資料夾
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : (
            <>
              {/* 資料夾樹 */}
              <div className="space-y-1">
                {renderFolderTree(folders)}
                {folders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>尚無資料夾</p>
                    <p className="text-sm">點擊上方按鈕建立第一個資料夾</p>
                  </div>
                )}
              </div>

              {/* 建立/編輯表單 */}
              {(showCreateForm || editingFolder) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 mb-3">
                    {editingFolder ? '編輯資料夾' : '新增資料夾'}
                  </h3>
                  
                  <form onSubmit={editingFolder ? handleUpdateFolder : handleCreateFolder}>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          資料夾名稱 *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="輸入資料夾名稱"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          描述
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="輸入描述（選填）"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            圖示
                          </label>
                          <input
                            type="text"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="📁"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            顏色
                          </label>
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {editingFolder ? '更新' : '建立'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderSidebar;
