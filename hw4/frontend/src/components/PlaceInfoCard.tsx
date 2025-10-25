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

  // 可選的 emoji 圖示
  const emojiOptions = [
    '📍', '🏠', '🍴', '☕', '🏪', '🏥', '🏫', '🌳', '🏞️', '🏖️',
    '🎭', '🎨', '📚', '🎵', '🏃', '🚗', '✈️', '🚇', '🚌', '🚲',
    '💼', '🛍️', '🎪', '🏰', '⛪', '🕌', '🏛️', '🌉', '🗼', '🎡'
  ];

  // 預設標籤選項
  const tagOptions = ['晴天', '雨天', '陰天', '雪天', '5星', '4星', '3星', '開心', '滿意', '推薦'];

  useEffect(() => {
    if (place) {
      setEditedPlace(place);
      setSelectedEmoji(place.emoji || '📍');
      setTags([]);
      setNotes(place.description || '');
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
    setTags([]);
    setNotes(place.description || '');
  };

  const handleSave = () => {
    if (editedPlace) {
      const updatedData = {
        emoji: selectedEmoji,
        tags: tags,
        description: notes
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
    if (confirm(`確定要刪除「${place.name}」嗎？`)) {
      onDelete(place);
    }
  };

  return (
    <div className="fixed left-10 top-1/2 transform -translate-y-1/2 w-80 z-50 animate-scale-in max-h-[75vh] overflow-hidden">
      <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-soft border border-mist/20 h-full flex flex-col">
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
        <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
          {!isEditing ? (
            /* 瀏覽模式 */
            <div className="space-y-4">
              {/* 所屬資料夾 */}
              {place.folder && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-warm-gray">資料夾:</span>
                  <span className="text-sm font-medium text-stone">{place.folder.name}</span>
                </div>
              )}

              {/* 標籤 */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-mist/30 text-stone text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 備註 */}
              {place.description && (
                <div>
                  <p className="text-sm text-warm-gray mb-1">備註:</p>
                  <p className="text-sm text-stone bg-mist/20 p-3 rounded-lg">
                    {place.description}
                  </p>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="flex space-x-3 pt-4">
                 <button
                   onClick={handleEdit}
                   className="flex-1 px-4 py-2.5 bg-slate-blue/10 text-slate-blue rounded-full hover:bg-slate-blue/20 transition-all duration-200 text-sm font-medium"
                 >
                   ✏️ 編輯
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
            /* 編輯模式 */
            <div className="space-y-6">
              {/* Emoji 選擇 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">選擇圖示</p>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
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

              {/* 標籤選擇 */}
              <div>
                <p className="text-sm font-medium text-stone mb-3">標籤</p>
                <div className="flex flex-wrap gap-2">
                  {tagOptions.map((tag) => (
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

               {/* 備註輸入 */}
               <div>
                 <p className="text-sm font-medium text-stone mb-3">備註</p>
                 <textarea
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   placeholder="記錄您的想法..."
                   className="w-full h-20 px-3 py-2 border border-mist/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-blue/20 focus:border-slate-blue/30 resize-none text-sm"
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
                   className="flex-1 px-4 py-2.5 bg-moss/10 text-moss rounded-full hover:bg-moss/20 transition-all duration-200 text-sm font-medium"
                 >
                   💾 儲存變更
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