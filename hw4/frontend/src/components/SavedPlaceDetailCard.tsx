import React, { useState } from 'react';
import { placesApi } from '../services/data';

interface SavedPlaceDetailCardProps {
  place: {
    id: number;
    name: string;
    address?: string;
    lat: number;
    lng: number;
    emoji?: string;
    description?: string;
    rating?: number;
    visitedAt?: string;
    weather?: string;
    folderId?: number;
    folder?: {
      id: number;
      name: string;
      color?: string;
      icon?: string;
    };
  };
  folders: any[];
  onClose: () => void;
  onPlaceUpdated: (updatedPlace: any) => void;
  onPlaceDeleted: (placeId: number) => void;
  onNavigate?: (lat: number, lng: number) => void;
}

const SavedPlaceDetailCard: React.FC<SavedPlaceDetailCardProps> = ({
  place,
  folders,
  onClose,
  onPlaceUpdated,
  onPlaceDeleted,
  onNavigate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    emoji: place.emoji || '📍',
    description: place.description || '',
    rating: place.rating || 0,
    visitedAt: place.visitedAt ? place.visitedAt.split('T')[0] : '',
    weather: place.weather || '',
    folderId: place.folderId || 0
  });

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

  // 渲染星星評分
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => setFormData(prev => ({ ...prev, rating: i }))}
          className={`text-2xl ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${isEditing ? 'cursor-pointer hover:text-yellow-500' : 'cursor-default'}`}
          disabled={!isEditing}
        >
          ★
        </button>
      );
    }
    return stars;
  };

  const handleSave = async () => {
    try {
      const response = await placesApi.update(place.id, formData);
      if (response.data) {
        onPlaceUpdated(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('更新地點失敗:', error);
      alert('更新地點失敗');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`確定要刪除「${place.name}」嗎？`)) {
      return;
    }

    try {
      await placesApi.delete(place.id);
      onPlaceDeleted(place.id);
      onClose();
    } catch (error) {
      console.error('刪除地點失敗:', error);
      alert('刪除地點失敗');
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      {/* 標題列 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{place.emoji}</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{place.name}</h3>
            {place.address && (
              <p className="text-sm text-gray-600">📍 {place.address}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* 所屬資料夾 */}
      {place.folder && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: place.folder.color + '20', color: place.folder.color }}>
            {place.folder.icon} {place.folder.name}
          </span>
        </div>
      )}

      {/* 編輯模式 */}
      {isEditing ? (
        <div className="space-y-4">
          {/* 選擇 emoji */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇標記圖示
            </label>
            <div className="grid grid-cols-10 gap-2">
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
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
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="記錄你的心得或備註..."
            />
          </div>

          {/* 評分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              我的評分
            </label>
            <div className="flex items-center space-x-1">
              {renderStars(formData.rating)}
              <span className="ml-2 text-sm text-gray-600">
                {formData.rating}/5
              </span>
            </div>
          </div>

          {/* 造訪日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              造訪日期
            </label>
            <input
              type="date"
              value={formData.visitedAt}
              onChange={(e) => setFormData(prev => ({ ...prev, visitedAt: e.target.value }))}
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

          {/* 移動到其他資料夾 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              移動到其他資料夾
            </label>
            <select
              value={formData.folderId}
              onChange={(e) => setFormData(prev => ({ ...prev, folderId: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>無資料夾</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* 編輯按鈕 */}
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              儲存
            </button>
          </div>
        </div>
      ) : (
        /* 顯示模式 */
        <div className="space-y-4">
          {/* 心得備註 */}
          {place.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">心得備註</h4>
              <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                {place.description}
              </p>
            </div>
          )}

          {/* 評分 */}
          {place.rating && place.rating > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">我的評分</h4>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < place.rating! ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {place.rating}/5
                </span>
              </div>
            </div>
          )}

          {/* 造訪日期 */}
          {place.visitedAt && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">造訪日期</h4>
              <p className="text-gray-800">
                📅 {new Date(place.visitedAt).toLocaleDateString('zh-TW')}
              </p>
            </div>
          )}

          {/* 天氣 */}
          {place.weather && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">天氣</h4>
              <p className="text-gray-800">{place.weather}</p>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              ✏️ 編輯
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              🗑️ 刪除
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate(place.lat, place.lng)}
                className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                🧭 導航
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPlaceDetailCard;
