import React, { useState, useEffect } from 'react';
import type { Place, Folder } from '../types';

interface PlaceInfoCardProps {
  place: Place | null;
  folders?: Folder[];
  onClose: () => void;
  onEdit?: (place: Place) => void;
  onDelete: (place: Place) => void;
  onSave: (place: Place, updatedData: any) => void;
}

const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  place,
  onClose,
  onDelete,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlace, setEditedPlace] = useState<Place | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState('📍');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [visitedDate, setVisitedDate] = useState('');
  const [weather, setWeather] = useState('');
  const [travelMode, setTravelMode] = useState('');
  const [companions, setCompanions] = useState('');
  const [expenses, setExpenses] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  // 旅遊相關 emoji 圖示
  const emojiOptions = [
    '📍', '🏞️', '🏖️', '🏔️', '🌊', '🌸', '🍃', '🌅', '🌄', '🌆',
    '🍴', '☕', '🍰', '🍜', '🍕', '🍔', '🍱', '🍣', '🍤', '🍧',
    '🏨', '🏪', '🛍️', '🎭', '🎨', '🎪', '🎡', '🎢', '🏰', '🗼',
    '⛪', '🕌', '🏛️', '🌉', '🗽', '🎯', '⭐', '💎', '🔖', '🏷️'
  ];

  // 天氣選項
  const weatherOptions = [
    { value: 'sunny', label: '☀️ 晴天', color: 'bg-yellow-50 text-yellow-700' },
    { value: 'cloudy', label: '⛅ 多雲', color: 'bg-gray-50 text-gray-700' },
    { value: 'rainy', label: '🌧️ 雨天', color: 'bg-blue-50 text-blue-700' },
    { value: 'stormy', label: '⛈️ 雷雨', color: 'bg-purple-50 text-purple-700' },
    { value: 'snowy', label: '❄️ 下雪', color: 'bg-blue-50 text-blue-700' },
    { value: 'foggy', label: '🌫️ 霧天', color: 'bg-gray-50 text-gray-700' },
    { value: 'windy', label: '💨 大風', color: 'bg-green-50 text-green-700' }
  ];

  // 交通方式選項
  const travelModeOptions = [
    { value: 'walking', label: '🚶 步行', icon: '🚶' },
    { value: 'bike', label: '🚲 自行車', icon: '🚲' },
    { value: 'car', label: '🚗 開車', icon: '🚗' },
    { value: 'bus', label: '🚌 公車', icon: '🚌' },
    { value: 'train', label: '🚇 捷運', icon: '🚇' },
    { value: 'taxi', label: '🚕 計程車', icon: '🚕' },
    { value: 'plane', label: '✈️ 飛機', icon: '✈️' },
    { value: 'boat', label: '⛵ 船', icon: '⛵' }
  ];

  // 標籤選項
  const tagOptions = [
    { category: '天氣', tags: ['晴天', '雨天', '陰天', '雪天', '霧天'] },
    { category: '評分', tags: ['5星', '4星', '3星', '2星', '1星'] },
    { category: '心情', tags: ['開心', '滿意', '推薦', '失望', '驚喜'] },
    { category: '類型', tags: ['必去', '拍照', '美食', '購物', '放鬆'] },
    { category: '季節', tags: ['春季', '夏季', '秋季', '冬季', '全年'] }
  ];

  useEffect(() => {
    if (place) {
      setEditedPlace(place);
      setSelectedEmoji(place.emoji || '📍');
      
      // 確保 tags 是陣列格式
      let tagsArray = [];
      if (place.tags) {
        if (Array.isArray(place.tags)) {
          tagsArray = place.tags;
        } else if (typeof place.tags === 'string') {
          try {
            tagsArray = JSON.parse(place.tags);
          } catch (e) {
            tagsArray = [];
          }
        }
      }
      setTags(tagsArray);
      
      setNotes(place.description || '');
      setRating(place.rating || 0);
      setVisitedDate(place.visitedAt ? place.visitedAt.split('T')[0] : '');
      setWeather(place.weather || '');
      setTravelMode(place.travelMode || '');
      setCompanions(place.companions || '');
      setExpenses(place.expenses || '');
      
      // 確保 photos 是陣列格式
      let photosArray = [];
      if (place.photos) {
        if (Array.isArray(place.photos)) {
          photosArray = place.photos;
        } else if (typeof place.photos === 'string') {
          try {
            photosArray = JSON.parse(place.photos);
          } catch (e) {
            photosArray = [];
          }
        }
      }
      setPhotos(photosArray);
      setIsEditing(false);
    }
  }, [place]);

  if (!place) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedPlace(place);
    setSelectedEmoji(place.emoji || '📍');
    setTags(place.tags || []);
    setNotes(place.description || '');
    setRating(place.rating || 0);
    setVisitedDate(place.visitedAt ? place.visitedAt.split('T')[0] : '');
    setWeather(place.weather || '');
    setTravelMode(place.travelMode || '');
    setCompanions(place.companions || '');
    setExpenses(place.expenses || '');
    
    // 確保 photos 是陣列格式
    let photosArray = [];
    if (place.photos) {
      if (Array.isArray(place.photos)) {
        photosArray = place.photos;
      } else if (typeof place.photos === 'string') {
        try {
          photosArray = JSON.parse(place.photos);
        } catch (e) {
          photosArray = [];
        }
      }
    }
    setPhotos(photosArray);
  };

  const handleSave = () => {
    if (editedPlace) {
      const updatedData = {
        emoji: selectedEmoji,
        tags: tags,
        description: notes,
        rating: rating,
        visitedAt: visitedDate,
        weather: weather,
        travelMode: travelMode,
        companions: companions,
        expenses: expenses,
        photos: photos
      };
      onSave(editedPlace, updatedData);
      setIsEditing(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t: string) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleDelete = () => {
    // 直接調用 onDelete，讓父組件處理確認
    onDelete(place);
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => interactive && setRating(i + 1)}
        className={`text-2xl transition-colors ${
          i < currentRating ? 'text-yellow-400' : 'text-gray-300'
        } ${interactive ? 'hover:text-yellow-500 cursor-pointer' : 'cursor-default'}`}
        disabled={!interactive}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed left-10 top-1/2 transform -translate-y-1/2 w-96 z-50 animate-scale-in max-h-[70vh]">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft border border-mist/20 h-full flex flex-col">
        {/* 標題區域 */}
        <div className="p-6 border-b border-mist/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedEmoji}</span>
              <div>
                <h3 className="text-lg font-medium text-stone">{place.name}</h3>
                <p className="text-sm text-warm-gray">{place.address}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-warm-gray hover:text-stone transition-colors p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {!isEditing ? (
            /* 瀏覽模式 */
            <div className="space-y-4">
              {/* 旅遊資訊卡片 */}
              <div className="grid grid-cols-2 gap-3">
                {rating > 0 && (
                  <div className="bg-moss/10 p-3 rounded-lg">
                    <p className="text-xs text-warm-gray mb-1">我的評分</p>
                    <div className="flex items-center space-x-1">
                      {renderStars(rating)}
                      <span className="text-sm text-stone ml-1">{rating}/5</span>
                    </div>
                  </div>
                )}
                
                {visitedDate && (
                  <div className="bg-slate-blue/10 p-3 rounded-lg">
                    <p className="text-xs text-warm-gray mb-1">造訪日期</p>
                    <p className="text-sm text-stone">📅 {new Date(visitedDate).toLocaleDateString('zh-TW')}</p>
                  </div>
                )}
                
                {weather && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-xs text-warm-gray mb-1">天氣</p>
                    <p className="text-sm text-stone">{weather}</p>
                  </div>
                )}
                
                {travelMode && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-warm-gray mb-1">交通方式</p>
                    <p className="text-sm text-stone">{travelModeOptions.find(t => t.value === travelMode)?.icon} {travelModeOptions.find(t => t.value === travelMode)?.label}</p>
                  </div>
                )}
              </div>

              {/* 標籤 */}
              {tags && Array.isArray(tags) && tags.length > 0 && (
                <div>
                  <p className="text-sm text-warm-gray mb-2">標籤</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-blue/20 text-slate-blue text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 旅遊心得 */}
              {notes && (
                <div>
                  <p className="text-sm text-warm-gray mb-2">旅遊心得</p>
                  <div className="bg-mist/20 p-3 rounded-lg">
                    <p className="text-sm text-stone">{notes}</p>
                  </div>
                </div>
              )}

              {/* 同行夥伴 */}
              {companions && (
                <div>
                  <p className="text-sm text-warm-gray mb-1">同行夥伴</p>
                  <p className="text-sm text-stone">👥 {companions}</p>
                </div>
              )}

              {/* 花費 */}
              {expenses && (
                <div>
                  <p className="text-sm text-warm-gray mb-1">花費</p>
                  <p className="text-sm text-stone">💰 {expenses}</p>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEdit}
                  className="flex-1 px-4 py-2.5 bg-slate-blue/10 text-slate-blue rounded-full hover:bg-slate-blue/20 transition-all duration-200 text-sm font-medium"
                >
                  ✏️ 編輯記錄
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all duration-200 text-sm font-medium"
                >
                  🗑️ 刪除
                </button>
              </div>
            </div>
          ) : (
            /* 編輯模式 整個區塊的右下角用三角形代表上下捲動，捲動時三角形要變色*/
            <div className="space-y-6 overflow-y-auto custom-scrollbar max-h-[40vh]">               
              {/* Emoji 選擇 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">選擇圖示</p>
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
                        selectedEmoji === emoji
                          ? 'bg-slate-blue/20 scale-110'
                          : 'bg-mist/30 hover:bg-mist/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 評分 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">我的評分</p>
                <div className="flex items-center space-x-1">
                  {renderStars(rating, true)}
                  <span className="ml-2 text-sm text-warm-gray">{rating}/5</span>
                </div>
              </div>

              {/* 造訪日期 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">造訪日期</p>
                <input
                  type="date"
                  value={visitedDate}
                  onChange={(e) => setVisitedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 text-sm"
                />
              </div>

              {/* 天氣選擇 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">天氣</p>
                <div className="grid grid-cols-2 gap-2">
                  {weatherOptions.map((weatherOption) => (
                    <button
                      key={weatherOption.value}
                      onClick={() => setWeather(weatherOption.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        weather === weatherOption.value
                          ? 'bg-slate-blue/20 text-slate-blue border border-slate-blue/30'
                          : 'bg-mist/30 text-stone hover:bg-mist/50'
                      }`}
                    >
                      {weatherOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 交通方式 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">交通方式</p>
                <div className="grid grid-cols-4 gap-2">
                  {travelModeOptions.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setTravelMode(mode.value)}
                      className={`flex flex-col items-center p-2 rounded-lg text-xs transition-all duration-200 ${
                        travelMode === mode.value
                          ? 'bg-slate-blue/20 text-slate-blue'
                          : 'bg-mist/30 text-stone hover:bg-mist/50'
                      }`}
                    >
                      <span className="text-lg mb-1">{mode.icon}</span>
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 標籤選擇 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">標籤</p>
                {tagOptions.map((category) => (
                  <div key={category.category} className="mb-3">
                    <p className="text-xs text-warm-gray mb-2">{category.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-all duration-200 ${
                            tags.includes(tag)
                              ? 'bg-slate-blue/20 text-slate-blue'
                              : 'bg-mist/30 text-stone hover:bg-mist/50'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 同行夥伴 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">同行夥伴</p>
                <input
                  type="text"
                  value={companions}
                  onChange={(e) => setCompanions(e.target.value)}
                  placeholder="例如：家人、朋友、同事..."
                  className="w-full px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 text-sm"
                />
              </div>

              {/* 花費 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">花費</p>
                <input
                  type="text"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  placeholder="例如：NT$ 500、免費..."
                  className="w-full px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 text-sm"
                />
              </div>

              {/* 旅遊心得 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">旅遊心得</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="記錄您的旅遊心得、感受、推薦理由..."
                  className="w-full h-24 px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 resize-none text-sm"
                  rows={3}
                />
              </div>

              {/* 操作按鈕 */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 bg-mist/30 text-stone rounded-full hover:bg-mist/50 transition-all duration-200 text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-slate-blue text-white rounded-full hover:bg-slate-blue/80 transition-all duration-200 text-sm font-medium"
                >
                  儲存記錄
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceInfoCard;