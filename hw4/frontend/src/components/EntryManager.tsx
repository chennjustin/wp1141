import React, { useState, useEffect } from 'react';
import type { Entry, Place, CreateEntryRequest, UpdateEntryRequest } from '../types';
import { entriesApi, placesApi } from '../services/data';

interface EntryManagerProps {
  selectedPlaceId?: number;
  onEntrySelect?: (entry: Entry) => void;
}

const EntryManager: React.FC<EntryManagerProps> = ({ 
  selectedPlaceId, 
  onEntrySelect 
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState<CreateEntryRequest>({
    placeId: selectedPlaceId || 0,
    emoji: '⭐',
    rating: 5,
    note: '',
    visitedAt: new Date().toISOString().split('T')[0],
    weather: '',
    photoUrl: ''
  });

  // 載入造訪紀錄
  const loadEntries = async () => {
    try {
      setLoading(true);
      const response = await entriesApi.getAll(selectedPlaceId);
      if (response.data) {
        setEntries(response.data);
      }
    } catch (error) {
      console.error('載入造訪紀錄失敗:', error);
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
    loadEntries();
    loadPlaces();
  }, [selectedPlaceId]);

  // 建立造訪紀錄
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await entriesApi.create(formData);
      if (response.data) {
        await loadEntries();
        setShowCreateForm(false);
        setFormData({
          placeId: selectedPlaceId || 0,
          emoji: '⭐',
          rating: 5,
          note: '',
          visitedAt: new Date().toISOString().split('T')[0],
          weather: '',
          photoUrl: ''
        });
      }
    } catch (error) {
      console.error('建立造訪紀錄失敗:', error);
    }
  };

  // 更新造訪紀錄
  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const updateData: UpdateEntryRequest = {
        emoji: formData.emoji,
        rating: formData.rating,
        note: formData.note,
        visitedAt: formData.visitedAt,
        weather: formData.weather,
        photoUrl: formData.photoUrl
      };

      const response = await entriesApi.update(editingEntry.id, updateData);
      if (response.data) {
        await loadEntries();
        setEditingEntry(null);
        setFormData({
          placeId: selectedPlaceId || 0,
          emoji: '⭐',
          rating: 5,
          note: '',
          visitedAt: new Date().toISOString().split('T')[0],
          weather: '',
          photoUrl: ''
        });
      }
    } catch (error) {
      console.error('更新造訪紀錄失敗:', error);
    }
  };

  // 刪除造訪紀錄
  const handleDeleteEntry = async (entry: Entry) => {
    if (!confirm(`確定要刪除這筆造訪紀錄嗎？`)) return;

    try {
      await entriesApi.delete(entry.id);
      await loadEntries();
    } catch (error) {
      console.error('刪除造訪紀錄失敗:', error);
    }
  };

  // 開始編輯
  const startEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setFormData({
      placeId: entry.placeId,
      emoji: entry.emoji || '⭐',
      rating: entry.rating || 5,
      note: entry.note || '',
      visitedAt: entry.visitedAt ? entry.visitedAt.split('T')[0] : new Date().toISOString().split('T')[0],
      weather: entry.weather || '',
      photoUrl: entry.photoUrl || ''
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingEntry(null);
    setShowCreateForm(false);
    setFormData({
      placeId: selectedPlaceId || 0,
      emoji: '⭐',
      rating: 5,
      note: '',
      visitedAt: new Date().toISOString().split('T')[0],
      weather: '',
      photoUrl: ''
    });
  };

  // 取得地點名稱
  const getPlaceName = (placeId: number) => {
    const place = places.find(p => p.id === placeId);
    return place ? place.name : `地點 #${placeId}`;
  };

  // 渲染評分星星
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
          <h3 className="text-lg font-semibold text-gray-800">造訪紀錄</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
          >
            + 新增紀錄
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 造訪紀錄列表 */}
        <div className="space-y-3">
          {entries.map(entry => (
            <div 
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onEntrySelect?.(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{entry.emoji}</span>
                    <h4 className="font-medium text-gray-800">
                      {getPlaceName(entry.placeId)}
                    </h4>
                    {entry.rating && (
                      <span className="ml-2 text-yellow-500">
                        {renderStars(entry.rating)}
                      </span>
                    )}
                  </div>
                  
                  {entry.note && (
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {entry.note}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>
                      📅 {entry.visitedAt ? new Date(entry.visitedAt).toLocaleDateString() : '未設定日期'}
                    </span>
                    {entry.weather && (
                      <span>🌤️ {entry.weather}</span>
                    )}
                    {entry.photoUrl && (
                      <span>📷 有照片</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(entry);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="編輯"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry);
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
          
          {entries.length === 0 && (
            <p className="text-gray-500 text-center py-4">尚無造訪紀錄</p>
          )}
        </div>

        {/* 建立/編輯表單 */}
        {(showCreateForm || editingEntry) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              {editingEntry ? '編輯造訪紀錄' : '新增造訪紀錄'}
            </h4>
            
            <form onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地點 *
                  </label>
                  <select
                    value={formData.placeId}
                    onChange={(e) => setFormData({ ...formData, placeId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!selectedPlaceId}
                  >
                    <option value="">選擇地點</option>
                    {places.map(place => (
                      <option key={place.id} value={place.id}>
                        {place.emoji} {place.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      圖示
                    </label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="⭐"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      評分
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 ⭐</option>
                      <option value={2}>2 ⭐⭐</option>
                      <option value={3}>3 ⭐⭐⭐</option>
                      <option value={4}>4 ⭐⭐⭐⭐</option>
                      <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    造訪日期
                  </label>
                  <input
                    type="date"
                    value={formData.visitedAt}
                    onChange={(e) => setFormData({ ...formData, visitedAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    筆記
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="記錄這次造訪的心得..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      天氣
                    </label>
                    <input
                      type="text"
                      value={formData.weather}
                      onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="晴天、多雲、下雨..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      照片網址
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  {editingEntry ? '更新' : '建立'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EntryManager;
