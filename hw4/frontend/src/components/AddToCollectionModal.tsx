import React, { useState, useEffect } from 'react';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collectionData: any) => void;
  placeData: {
    name: string;
    address?: string;
    lat: number;
    lng: number;
    rating?: number;
    place_id?: string;
    types?: string[];
  };
  folders: any[];
  onCreateFolder: (folderData: any) => Promise<any>;
}

const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  placeData,
  folders,
  onCreateFolder
}) => {
  const [formData, setFormData] = useState({
    folderId: '',
    emoji: '📍',
    note: '',
    date: new Date().toISOString().split('T')[0], // 今天日期
    weather: ''
  });

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // 常用 emoji 選項
  const emojiOptions = [
    '📍', '🏞️', '🍴', '🏨', '🛍️', '🎭', '🏛️', '⛪', '🏖️', '🏔️',
    '🌊', '🌸', '🍜', '☕', '🍰', '🍕', '🍔', '🍱', '🍣', '🍤',
    '🎨', '🎪', '🎡', '🎢', '🏰', '🗼', '🗽', '🌉', '🌆', '🌃'
  ];

  // 天氣選項
  const weatherOptions = [
    '☀️ 晴天', '⛅ 多雲', '🌧️ 雨天', '⛈️ 雷雨', '❄️ 下雪', '🌫️ 霧天', '🌪️ 颱風'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        folderId: '',
        emoji: '📍',
        note: '',
        date: new Date().toISOString().split('T')[0],
        weather: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.folderId) {
      alert('請選擇資料夾');
      return;
    }

    const collectionData = {
      ...placeData,
      emoji: formData.emoji,
      description: formData.note,
      visitedAt: formData.date,
      weather: formData.weather,
      folderId: parseInt(formData.folderId)
    };

    onSave(collectionData);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      alert('請輸入資料夾名稱');
      return;
    }

    try {
      const folderData = {
        name: newFolderName,
        description: '',
        color: '#3B82F6',
        icon: '📁'
      };
      
      const newFolder = await onCreateFolder(folderData);
      if (newFolder) {
        setFormData(prev => ({ ...prev, folderId: (newFolder as any).id.toString() }));
        setShowCreateFolder(false);
        setNewFolderName('');
      }
    } catch (error) {
      console.error('創建資料夾失敗:', error);
      alert('創建資料夾失敗');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 標題 */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">加入收藏</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 地點資訊預覽 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-800">{placeData.name}</h3>
            {placeData.address && (
              <p className="text-sm text-gray-600 mt-1">📍 {placeData.address}</p>
            )}
            {placeData.rating && (
              <p className="text-sm text-gray-600">⭐ {placeData.rating.toFixed(1)}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 選擇資料夾 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇資料夾 *
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.folderId}
                  onChange={(e) => setFormData(prev => ({ ...prev, folderId: e.target.value }))}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">請選擇資料夾</option>
                  {folders.map(folder => (
                    <option key={folder.id} value={folder.id}>
                      {folder.icon} {folder.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + 新增
                </button>
              </div>
            </div>

            {/* 新增資料夾 */}
            {showCreateFolder && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="資料夾名稱"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    創建
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateFolder(false)}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* 選擇 emoji */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇標記圖示
              </label>
              <div className="grid grid-cols-10 gap-2">
                {emojiOptions.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                    className={`p-2 text-lg rounded-lg border-2 transition-colors ${
                      formData.emoji === emoji
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 心得備註 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                心得備註
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="記錄你的心得或備註..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* 造訪日期 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                造訪日期
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 天氣 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                天氣
              </label>
              <select
                value={formData.weather}
                onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇天氣</option>
                {weatherOptions.map(weather => (
                  <option key={weather} value={weather}>
                    {weather}
                  </option>
                ))}
              </select>
            </div>

            {/* 按鈕 */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                儲存收藏
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddToCollectionModal;
