import React, { useState } from 'react';
import type { PlacesSearchResult } from '../types';
import { searchApi } from '../services/data';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceSelect: (place: PlacesSearchResult) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onPlaceSelect
}) => {
  const [searchType, setSearchType] = useState<'nearby' | 'text'>('nearby');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [radius, setRadius] = useState(1000);
  const [loading, setLoading] = useState(false);

  // 搜尋類別選項
  const categories = [
    { value: 'restaurant', label: '🍽️ 餐廳', icon: '🍽️' },
    { value: 'cafe', label: '☕ 咖啡廳', icon: '☕' },
    { value: 'shopping_mall', label: '🛍️ 購物中心', icon: '🛍️' },
    { value: 'tourist_attraction', label: '🏛️ 觀光景點', icon: '🏛️' },
    { value: 'lodging', label: '🏨 住宿', icon: '🏨' },
    { value: 'gas_station', label: '⛽ 加油站', icon: '⛽' },
    { value: 'hospital', label: '🏥 醫院', icon: '🏥' },
    { value: 'school', label: '🏫 學校', icon: '🏫' },
    { value: 'bank', label: '🏦 銀行', icon: '🏦' },
    { value: 'pharmacy', label: '💊 藥局', icon: '💊' }
  ];

  // 處理搜尋
  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      
      let response;
      
      if (searchType === 'text') {
        // 文字搜尋
        response = await searchApi.textSearch(query, undefined, undefined, category);
      } else {
        // 附近搜尋（需要當前位置，這裡使用台北市中心作為預設）
        const defaultLocation = { lat: 25.0330, lng: 121.5654 };
        response = await searchApi.nearbySearch(defaultLocation, radius, category, query);
      }

      if (response.data && response.data.length > 0) {
        // 選擇第一個結果
        onPlaceSelect(response.data[0]);
        onClose();
      } else {
        alert('找不到相關地點');
      }
    } catch (error) {
      console.error('搜尋失敗:', error);
      alert('搜尋失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 彈窗內容 */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">🔍 進階搜尋</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表單內容 */}
        <div className="p-4 space-y-4">
          {/* 搜尋類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜尋類型
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setSearchType('text')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'text'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 文字搜尋
              </button>
              <button
                type="button"
                onClick={() => setSearchType('nearby')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'nearby'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📍 附近搜尋
              </button>
            </div>
          </div>

          {/* 搜尋關鍵字 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜尋關鍵字 *
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入搜尋關鍵字"
            />
          </div>

          {/* 類別選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              類別
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選擇類別（選填）</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 搜尋範圍（僅附近搜尋時顯示） */}
          {searchType === 'nearby' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜尋範圍: {radius} 公尺
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>100m</span>
                <span>5km</span>
              </div>
            </div>
          )}

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
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '搜尋中...' : '搜尋'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
