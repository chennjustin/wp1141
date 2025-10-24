import React, { useState, useEffect } from 'react';
import type { Folder, CreatePlaceRequest } from '../types';
import { foldersApi, placesApi } from '../services/data';

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceCreated: (place: any) => void;
  initialData?: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    types?: string[];
  };
}

const PlaceModal: React.FC<PlaceModalProps> = ({
  isOpen,
  onClose,
  onPlaceCreated,
  initialData
}) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePlaceRequest>({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    emoji: '📍',
    description: '',
    folderId: undefined
  });

  // 常用 emoji 選項
  const emojiOptions = [
    '📍', '🏠', '🏢', '🏪', '🍽️', '☕', '🍜', '🍕', '🍔', '🍰',
    '🏛️', '🏞️', '🏖️', '🏔️', '⛰️', '🌊', '🌳', '🌸', '🌺',
    '🎭', '🎨', '🎪', '🎡', '🎢', '🏟️', '🏰', '⛪', '🕌', '🕍',
    '🚗', '🚌', '🚇', '✈️', '🚢', '🚲', '🏍️', '🚁'
  ];

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
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  // 初始化表單資料
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        lat: initialData.lat,
        lng: initialData.lng,
        emoji: '📍',
        description: '',
        folderId: undefined
      });
    }
  }, [initialData]);

  // 建立地點
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      const response = await placesApi.create(formData);
      if (response.data) {
        onPlaceCreated(response.data);
        onClose();
        // 重置表單
        setFormData({
          name: '',
          address: '',
          lat: 0,
          lng: 0,
          emoji: '📍',
          description: '',
          folderId: undefined
        });
      }
    } catch (error) {
      console.error('建立地點失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 新增資料夾
  const handleCreateFolder = async (folderName: string) => {
    try {
      const response = await foldersApi.create({
        name: folderName,
        description: '',
        color: '#3B82F6',
        icon: '📁'
      });
      if (response.data) {
        setFolders(prev => [...prev, response.data]);
        setFormData(prev => ({ ...prev, folderId: response.data.id }));
      }
    } catch (error) {
      console.error('建立資料夾失敗:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 彈窗內容 */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">新增地點</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表單內容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 地點資訊 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">📍 地點資訊</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地點名稱 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入地點名稱"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  地址
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入地址（選填）"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    緯度
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    經度
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 標記設定 */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">🎨 標記設定</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇圖示
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {emojiOptions.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        formData.emoji === emoji
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入描述（選填）"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* 資料夾設定 */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-800 mb-2">📁 資料夾設定</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  選擇資料夾
                </label>
                <select
                  value={formData.folderId || ''}
                  onChange={(e) => setFormData({ ...formData, folderId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選擇資料夾（選填）</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.icon} {folder.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="新增資料夾名稱"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const folderName = e.currentTarget.value.trim();
                      if (folderName) {
                        handleCreateFolder(folderName);
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="新增資料夾名稱"]') as HTMLInputElement;
                    const folderName = input?.value.trim();
                    if (folderName) {
                      handleCreateFolder(folderName);
                      input.value = '';
                    }
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  新增
                </button>
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '儲存中...' : '儲存地點'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlaceModal;
