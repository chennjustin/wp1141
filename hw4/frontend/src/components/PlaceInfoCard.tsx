import React from 'react';

interface PlaceInfoCardProps {
  place: {
    name: string;
    address?: string;
    rating?: number;
    opening_hours?: {
      open_now?: boolean;
      weekday_text?: string[];
    };
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    types?: string[];
    place_id?: string;
  };
  onAddToCollection: () => void;
  onClose: () => void;
}

const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  place,
  onAddToCollection,
  onClose
}) => {
  // 取得地點類型的中文名稱
  const getTypeName = (types: string[]) => {
    const typeMap: { [key: string]: string } = {
      'restaurant': '餐廳',
      'food': '美食',
      'tourist_attraction': '景點',
      'lodging': '住宿',
      'shopping_mall': '購物',
      'park': '公園',
      'museum': '博物館',
      'church': '教堂',
      'hospital': '醫院',
      'school': '學校',
      'bank': '銀行',
      'gas_station': '加油站',
      'pharmacy': '藥局',
      'store': '商店'
    };
    
    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }
    return '其他';
  };

  // 渲染星星評分
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
      {/* 關閉按鈕 */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      {/* 地點照片 */}
      {place.photos && place.photos.length > 0 && (
        <div className="mb-4">
          <img
            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAPS_JS_KEY}`}
            alt={place.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* 地點名稱 */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        {place.name}
      </h3>

      {/* 地址 */}
      {place.address && (
        <p className="text-gray-600 text-sm mb-3">
          📍 {place.address}
        </p>
      )}

      {/* 評分和營業時間 */}
      <div className="mb-4">
        {place.rating && (
          <div className="flex items-center mb-2">
            <div className="flex items-center mr-2">
              {renderStars(place.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {place.rating.toFixed(1)}
            </span>
          </div>
        )}

        {place.opening_hours && (
          <div className="text-sm text-gray-600">
            {place.opening_hours.open_now ? (
              <span className="text-green-600 font-medium">🟢 營業中</span>
            ) : (
              <span className="text-red-600 font-medium">🔴 已關閉</span>
            )}
          </div>
        )}
      </div>

      {/* 類別 */}
      {place.types && (
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {getTypeName(place.types)}
          </span>
        </div>
      )}

      {/* 營業時間詳情 */}
      {place.opening_hours?.weekday_text && (
        <div className="mb-4">
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-medium">查看營業時間</summary>
            <div className="mt-2 space-y-1">
              {place.opening_hours.weekday_text.map((time, index) => (
                <div key={index} className="text-xs">{time}</div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* 加入收藏按鈕 */}
      <button
        onClick={onAddToCollection}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        ⭐ 加入收藏
      </button>
    </div>
  );
};

export default PlaceInfoCard;