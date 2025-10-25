import React, { useState, useEffect } from 'react';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
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
    weather: '',
    placeType: '' // 新增地點類型
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

  // 地點類型選項
  const placeTypeOptions = [
    { value: 'food', label: '🍴 美食', icon: '🍴' },
    { value: 'attraction', label: '🏞️ 景點', icon: '🏞️' },
    { value: 'accommodation', label: '🏨 住宿', icon: '🏨' },
    { value: 'shopping', label: '🛍️ 購物', icon: '🛍️' },
    { value: 'hospital', label: '🏥 醫院', icon: '🏥' },
    { value: 'school', label: '🏫 學校', icon: '🏫' },
    { value: 'park', label: '🌳 公園', icon: '🌳' },
    { value: 'other', label: '📍 其他', icon: '📍' }
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        folderId: '',
        emoji: '📍',
        note: '',
        date: new Date().toISOString().split('T')[0],
        weather: '',
        placeType: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const collectionData = {
      name: placeData.name,
      address: placeData.address,
      lat: placeData.lat,
      lng: placeData.lng,
      emoji: formData.emoji,
      description: formData.note,
      rating: placeData.rating,
      visitedAt: formData.date,
      weather: formData.weather,
      placeType: formData.placeType,
      folderId: formData.folderId ? parseInt(formData.folderId) : null
    };

    onSave(collectionData);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folderData = {
        name: newFolderName,
        description: '',
        icon: '📁',
        color: '#800000'
      };
      
      const newFolder = await onCreateFolder(folderData);
      if (newFolder) {
        setFormData(prev => ({ ...prev, folderId: newFolder.id.toString() }));
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 標題區域 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-maroon to-maroon/80 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⭐</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">加入收藏</h2>
              <p className="text-sm text-gray-500">將地點加入您的收藏</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <span className="text-gray-500 text-lg">✕</span>
          </button>
        </div>

        {/* 地點資訊 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-2">{placeData.name}</h3>
          {placeData.address && (
            <p className="text-sm text-gray-600">📍 {placeData.address}</p>
          )}
          {placeData.rating && (
            <p className="text-sm text-gray-600">⭐ Google 評分: {placeData.rating}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 選擇 emoji */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              選擇標記圖示
            </label>
            <div className="grid grid-cols-10 gap-2">
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                  className={`p-3 text-lg rounded-xl border-2 transition-all duration-200 ${
                    formData.emoji === emoji
                      ? 'border-maroon bg-maroon/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 心得備註 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              心得備註
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-colors"
              rows={3}
              placeholder="記錄您的心得或備註..."
            />
          </div>

          {/* 造訪日期 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              造訪日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-colors"
            />
          </div>

          {/* 天氣 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              天氣
            </label>
            <select
              value={formData.weather}
              onChange={(e) => setFormData(prev => ({ ...prev, weather: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-colors"
            >
              <option value="">選擇天氣</option>
              {weatherOptions.map(weather => (
                <option key={weather} value={weather}>
                  {weather}
                </option>
              ))}
            </select>
          </div>

          {/* 地點類型 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              地點類型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {placeTypeOptions.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, placeType: type.value }))}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    formData.placeType === type.value
                      ? 'bg-gradient-to-r from-maroon to-maroon/90 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 選擇資料夾 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              選擇資料夾
            </label>
            <div className="space-y-3">
              <select
                value={formData.folderId}
                onChange={(e) => setFormData(prev => ({ ...prev, folderId: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-colors"
              >
                <option value="">無資料夾</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
              
              <button
                type="button"
                onClick={() => setShowCreateFolder(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-maroon hover:text-maroon transition-colors"
              >
                <span>➕</span>
                <span>創建新資料夾</span>
              </button>
            </div>
          </div>

          {/* 創建資料夾表單 */}
          {showCreateFolder && (
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3">創建新資料夾</h4>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="資料夾名稱"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-maroon/50"
                />
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  className="px-4 py-2 bg-maroon text-white rounded-lg hover:bg-maroon/80 transition-colors"
                >
                  創建
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateFolder(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 按鈕 */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-maroon to-maroon/90 text-white rounded-xl hover:from-maroon/90 hover:to-maroon/80 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              加入收藏
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToCollectionModal;