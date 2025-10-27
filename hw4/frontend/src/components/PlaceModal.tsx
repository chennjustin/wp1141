import React, { useState, useEffect } from 'react';
import type { Folder, CreatePlaceRequest } from '../types';
import { foldersApi, placesApi } from '../services/data';

interface PlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceCreated: (place: any) => void;
  onPlaceUpdated?: (place: any) => void;
  initialData?: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    placeId?: string;
    rating?: number;
    types?: string[];
  };
  editingPlace?: any;
}

const PlaceModal: React.FC<PlaceModalProps> = ({
  isOpen,
  onClose,
  onPlaceCreated,
  onPlaceUpdated,
  initialData,
  editingPlace
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

  // 主要類型圖示（對應篩選的種類）
  const mainTypeEmojis = [
    { emoji: '🍴', label: '美食', type: 'food' },
    { emoji: '🏞️', label: '景點', type: 'attraction' },
    { emoji: '🏨', label: '住宿', type: 'accommodation' },
    { emoji: '🛍️', label: '購物', type: 'shopping' },
    { emoji: '🏥', label: '醫院', type: 'hospital' },
    { emoji: '🏫', label: '學校', type: 'school' },
    { emoji: '🌳', label: '公園', type: 'park' }
  ];

  // 其他圖示
  const otherEmojis = [
    '📍', '🏠', '🏢', '🏪', '☕', '🍜', '🍕', '🍔', '🍰',
    '🏛️', '🏖️', '🏔️', '⛰️', '🌊', '🌸', '🌺',
    '🎭', '🎨', '🎪', '🎡', '🎢', '🏟️', '🏰', '⛪', '🕌', '🕍'
  ];

  const [showOtherEmojis, setShowOtherEmojis] = useState(false);

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

  // 初始化表單數據 - 當 Modal 打開時
  useEffect(() => {
    if (!isOpen) return;
    
    console.log('PlaceModal 初始化資料:', { editingPlace, initialData });
    
    if (editingPlace) {
      console.log('使用 editingPlace 資料');
      setFormData({
        name: editingPlace.name || '',
        address: editingPlace.address || '',
        lat: editingPlace.lat || 0,
        lng: editingPlace.lng || 0,
        emoji: editingPlace.emoji || '📍',
        description: editingPlace.description || '',
        rating: editingPlace.rating,
        visitedAt: editingPlace.visitedAt,
        weather: editingPlace.weather,
        folderId: editingPlace.folderId
      });
    } else if (initialData) {
      console.log('使用 initialData 資料:', initialData);
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        lat: initialData.lat,
        lng: initialData.lng,
        emoji: '📍',
        description: '',
        folderId: undefined
      });
    } else {
      console.log('沒有提供資料，使用預設值');
      // 重置為預設值
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
  }, [isOpen, editingPlace, initialData]);

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);


  // 建立或更新地點
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      
      if (editingPlace && onPlaceUpdated) {
        // 更新地點
        const response = await placesApi.update(editingPlace.id, formData);
        if (response.data) {
          onPlaceUpdated(response.data);
          onClose();
        }
      } else {
        // 建立新地點
        const response = await placesApi.create(formData);
        if (response.data && onPlaceCreated) {
          onPlaceCreated(response.data);
        }
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
      console.error('操作地點失敗:', error);
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
        icon: '📁'
      });
      if (response.data) {
        setFolders(prev => [...prev, response.data!]);
        setFormData(prev => ({ ...prev, folderId: response.data!.id }));
      }
    } catch (error) {
      console.error('建立資料夾失敗:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      
      {/* 彈窗內容 */}
      <div className="relative bg-white shadow-soft w-full max-w-lg max-h-[90vh] overflow-hidden rounded-lg">
        {/* 標題列 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-mist bg-cream">
          <h2 className="text-lg font-semibold text-stone">
            {editingPlace ? '編輯地點' : '新增地點'}
          </h2>
          <button
            onClick={onClose}
            className="text-warm-gray hover:text-stone transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表單內容 */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 地點資訊 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone mb-2">
                  地點名稱 *
                </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-mist focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue rounded-md"
                        placeholder="輸入地點名稱"
                        required
                      />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone mb-2">
                  地址
                </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-2 border border-mist focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue rounded-md"
                        placeholder="輸入地址（選填）"
                      />
              </div>
            </div>

            {/* 標記設定 */}
            <div>
              <label className="block text-sm font-medium text-stone mb-3">
                選擇圖示
              </label>
              
              {/* 主要類型圖示 */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {mainTypeEmojis.map(({ emoji, label }) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, emoji })}
                    className={`p-3 border transition-colors rounded-md flex flex-col items-center space-y-1 ${
                      formData.emoji === emoji
                        ? 'border-slate-blue bg-slate-blue/10'
                        : 'border-mist hover:border-warm-gray hover:bg-cream'
                    }`}
                  >
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs text-warm-gray">{label}</span>
                  </button>
                ))}
              </div>

              {/* 其他圖示按鈕 */}
              <button
                type="button"
                onClick={() => setShowOtherEmojis(!showOtherEmojis)}
                className={`w-full p-2 border transition-colors rounded-md ${
                  showOtherEmojis
                    ? 'border-slate-blue bg-slate-blue/10'
                    : 'border-mist hover:border-warm-gray hover:bg-cream'
                }`}
              >
                <span className="text-sm text-stone">📍 其他圖示</span>
              </button>

              {/* 其他圖示展開區域 */}
              {showOtherEmojis && (
                <div className="mt-3 grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-mist p-3 bg-cream/30 rounded-md">
                  {otherEmojis.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={`p-2 border transition-colors rounded-md ${
                        formData.emoji === emoji
                          ? 'border-slate-blue bg-slate-blue/10'
                          : 'border-mist hover:border-warm-gray hover:bg-cream'
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone mb-2">
                描述
              </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-mist focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue resize-none rounded-md"
                      placeholder="輸入描述（選填）"
                      rows={3}
                    />
            </div>

            {/* 資料夾設定 */}
            <div>
              <label className="block text-sm font-medium text-stone mb-2">
                選擇資料夾
              </label>
                    <select
                      value={formData.folderId || ''}
                      onChange={(e) => setFormData({ ...formData, folderId: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-mist focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue rounded-md"
                    >
                <option value="">選擇資料夾（選填）</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 新增資料夾 */}
            <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="新增資料夾名稱"
                      className="flex-1 px-3 py-2 border border-mist focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue rounded-md"
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
                className="px-4 py-2 bg-slate-blue text-white hover:bg-slate-blue/80 transition-colors rounded-md"
              >
                新增
              </button>
            </div>
          </form>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-mist bg-cream">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-warm-gray hover:text-stone transition-colors rounded-md"
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="px-6 py-2 bg-slate-blue text-white hover:bg-slate-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md"
          >
            {loading ? '儲存中...' : '儲存地點'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceModal;