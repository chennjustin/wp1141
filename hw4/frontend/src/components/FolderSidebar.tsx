import React, { useState } from 'react';
import { foldersApi } from '../services/data';

interface FolderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  folders: any[];
  onFolderSelect: (folder: any) => void;
  onFolderUpdate: (folders: any[]) => void;
  selectedFolder?: any;
}

const FolderSidebar: React.FC<FolderSidebarProps> = ({
  isOpen,
  onClose,
  folders,
  onFolderSelect,
  onFolderUpdate,
  selectedFolder
}) => {
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '📁'
  });

  // 顏色選項
  const colorOptions = [
    { value: '#3B82F6', name: '藍色', color: 'bg-blue-500' },
    { value: '#EF4444', name: '紅色', color: 'bg-red-500' },
    { value: '#10B981', name: '綠色', color: 'bg-green-500' },
    { value: '#F59E0B', name: '橙色', color: 'bg-orange-500' },
    { value: '#8B5CF6', name: '紫色', color: 'bg-purple-500' },
    { value: '#EC4899', name: '粉色', color: 'bg-pink-500' }
  ];

  // emoji 選項
  const emojiOptions = [
    '📁', '🗂️', '📂', '💼', '🎒', '👜', '💼', '📋', '📝', '📄',
    '🏞️', '🍴', '🏨', '🛍️', '🎭', '🏛️', '⛪', '🏖️', '🏔️', '🌊'
  ];

  const handleCreateFolder = async () => {
    if (!formData.name.trim()) {
      alert('請輸入資料夾名稱');
      return;
    }

    try {
      const response = await foldersApi.create(formData);
      if (response.data) {
        onFolderUpdate([...folders, response.data]);
        setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });
        setShowCreateFolder(false);
      }
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      alert('創建資料夾失敗');
    }
  };

  const handleEditFolder = async () => {
    if (!formData.name.trim()) {
      alert('請輸入資料夾名稱');
      return;
    }

    try {
      const response = await foldersApi.update(editingFolder.id, formData);
      if (response.data) {
        const updatedFolders = folders.map(f => 
          f.id === editingFolder.id ? response.data : f
        );
        onFolderUpdate(updatedFolders);
        setShowEditFolder(false);
        setEditingFolder(null);
        setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });
      }
    } catch (error) {
      console.error('更新資料夾失敗:', error);
      alert('更新資料夾失敗');
    }
  };

  const handleDeleteFolder = async (folder: any) => {
    if (!confirm(`確定要刪除資料夾「${folder.name}」嗎？\n\n這將同時刪除資料夾內的所有地點。`)) {
      return;
    }

    try {
      await foldersApi.delete(folder.id);
      const updatedFolders = folders.filter(f => f.id !== folder.id);
      onFolderUpdate(updatedFolders);
      
      // 如果刪除的是當前選中的資料夾，清空選擇
      if (selectedFolder?.id === folder.id) {
        onFolderSelect(null);
      }
    } catch (error) {
      console.error('刪除資料夾失敗:', error);
      alert('刪除資料夾失敗');
    }
  };

  const startEdit = (folder: any) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || '',
      color: folder.color || '#3B82F6',
      icon: folder.icon || '📁'
    });
    setShowEditFolder(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
      <div className="bg-white w-80 h-full overflow-y-auto">
        {/* 標題列 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">📁 我的資料夾</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 資料夾列表 */}
        <div className="p-4">
          {folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>還沒有任何資料夾</p>
              <p className="text-sm">點擊下方按鈕創建第一個資料夾</p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFolder?.id === folder.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onFolderSelect(folder)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{folder.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-800">{folder.name}</h3>
                        {folder.description && (
                          <p className="text-sm text-gray-600">{folder.description}</p>
                        )}
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 新增資料夾按鈕 */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + 新增資料夾
          </button>
        </div>
      </div>

      {/* 創建/編輯資料夾 Modal */}
      {(showCreateFolder || showEditFolder) && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {showCreateFolder ? '新增資料夾' : '編輯資料夾'}
              </h3>

              <div className="space-y-4">
                {/* 資料夾名稱 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    資料夾名稱 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例如：台北旅遊"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="描述這個資料夾的用途..."
                  />
                </div>

                {/* 選擇顏色 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選擇顏色
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          formData.color === color.value
                            ? 'border-gray-800'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded ${color.color} mx-auto`}></div>
                        <span className="text-xs text-gray-600">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 選擇 emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選擇圖示
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                        className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                          formData.icon === emoji
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 按鈕 */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setShowEditFolder(false);
                    setEditingFolder(null);
                    setFormData({ name: '', description: '', color: '#3B82F6', icon: '📁' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={showCreateFolder ? handleCreateFolder : handleEditFolder}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {showCreateFolder ? '創建' : '更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderSidebar;
