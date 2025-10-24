import React, { useState, useEffect } from 'react';
import type { Folder, CreateFolderRequest, UpdateFolderRequest } from '../types';
import { foldersApi } from '../services/data';

interface FolderManagerProps {
  onFolderSelect?: (folder: Folder | null) => void;
  selectedFolderId?: number;
}

const FolderManager: React.FC<FolderManagerProps> = ({ 
  onFolderSelect, 
  selectedFolderId 
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  // 表單狀態
  const [formData, setFormData] = useState<CreateFolderRequest>({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁',
    parentId: undefined
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

  useEffect(() => {
    loadFolders();
  }, []);

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
      const updateData: UpdateFolderRequest = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        parentId: formData.parentId
      };

      const response = await foldersApi.update(editingFolder.id, updateData);
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
    
    return children.map(folder => (
      <div key={folder.id} className="ml-4">
        <div 
          className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${
            selectedFolderId === folder.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ marginLeft: `${level * 16}px` }}
        >
          <div 
            className="flex items-center flex-1"
            onClick={() => {
              onFolderSelect?.(folder);
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
            <span className="mr-2">{folder.icon}</span>
            <span className="font-medium text-gray-800">{folder.name}</span>
            {folder._count && (
              <span className="ml-2 text-xs text-gray-500">
                ({folder._count.places} 個地點)
              </span>
            )}
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
    ));
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">載入中...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">資料夾管理</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + 新增資料夾
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 資料夾樹 */}
        <div className="space-y-1">
          {renderFolderTree(folders)}
          {folders.length === 0 && (
            <p className="text-gray-500 text-center py-4">尚無資料夾</p>
          )}
        </div>

        {/* 建立/編輯表單 */}
        {(showCreateForm || editingFolder) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              {editingFolder ? '編輯資料夾' : '新增資料夾'}
            </h4>
            
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
      </div>
    </div>
  );
};

export default FolderManager;
