import React, { useState, useEffect } from 'react';
import type { Place, Folder, CreatePlaceRequest, UpdatePlaceRequest } from '../types';
import { placesApi, foldersApi } from '../services/data';

interface PlaceManagerProps {
  selectedFolderId?: number;
  onPlaceSelect?: (place: Place) => void;
}

const PlaceManager: React.FC<PlaceManagerProps> = ({ 
  selectedFolderId, 
  onPlaceSelect 
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState<CreatePlaceRequest>({
    name: '',
    address: '',
    lat: 0,
    lng: 0,
    emoji: '📍',
    description: '',
    folderId: selectedFolderId
  });

  // 載入地點
  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await placesApi.getAll(selectedFolderId);
      if (response.data) {
        setPlaces(response.data);
      }
    } catch (error) {
      console.error('載入地點失敗:', error);
    } finally {
      setLoading(false);
    }
  };

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
    loadPlaces();
    loadFolders();
  }, [selectedFolderId]);

  // 建立地點
  const handleCreatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await placesApi.create(formData);
      if (response.data) {
        await loadPlaces();
        setShowCreateForm(false);
        setFormData({
          name: '',
          address: '',
          lat: 0,
          lng: 0,
          emoji: '📍',
          description: '',
          folderId: selectedFolderId
        });
      }
    } catch (error) {
      console.error('建立地點失敗:', error);
    }
  };

  // 更新地點
  const handleUpdatePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlace) return;

    try {
      const updateData: UpdatePlaceRequest = {
        name: formData.name,
        address: formData.address,
        emoji: formData.emoji,
        description: formData.description,
        folderId: formData.folderId
      };

      const response = await placesApi.update(editingPlace.id, updateData);
      if (response.data) {
        await loadPlaces();
        setEditingPlace(null);
        setFormData({
          name: '',
          address: '',
          lat: 0,
          lng: 0,
          emoji: '📍',
          description: '',
          folderId: selectedFolderId
        });
      }
    } catch (error) {
      console.error('更新地點失敗:', error);
    }
  };

  // 刪除地點
  const handleDeletePlace = async (place: Place) => {
    if (!confirm(`確定要刪除地點「${place.name}」嗎？`)) return;

    try {
      await placesApi.delete(place.id);
      await loadPlaces();
    } catch (error) {
      console.error('刪除地點失敗:', error);
    }
  };

  // 開始編輯
  const startEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      address: place.address || '',
      lat: place.lat,
      lng: place.lng,
      emoji: place.emoji || '📍',
      description: place.description || '',
      folderId: place.folderId
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingPlace(null);
    setShowCreateForm(false);
    setFormData({
      name: '',
      address: '',
      lat: 0,
      lng: 0,
      emoji: '📍',
      description: '',
      folderId: selectedFolderId
    });
  };

  // 從地圖選擇座標
  // const handleMapClick = (lat: number, lng: number) => {
  //   setFormData(prev => ({ ...prev, lat, lng }));
  // };

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
          <h3 className="text-lg font-semibold text-gray-800">地點管理</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            + 新增地點
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* 地點列表 */}
        <div className="space-y-2">
          {places.map(place => (
            <div 
              key={place.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div 
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => onPlaceSelect?.(place)}
              >
                <span className="mr-3 text-xl">{place.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{place.name}</h4>
                  {place.address && (
                    <p className="text-sm text-gray-600">{place.address}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    座標: {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
                  </p>
                  {place.folder && (
                    <p className="text-xs text-blue-600">
                      資料夾: {place.folder.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => startEdit(place)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="編輯"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeletePlace(place)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="刪除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          
          {places.length === 0 && (
            <p className="text-gray-500 text-center py-4">尚無地點</p>
          )}
        </div>

        {/* 建立/編輯表單 */}
        {(showCreateForm || editingPlace) && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-md font-medium text-gray-800 mb-3">
              {editingPlace ? '編輯地點' : '新增地點'}
            </h4>
            
            <form onSubmit={editingPlace ? handleUpdatePlace : handleCreatePlace}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    地點名稱 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入地址（選填）"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      緯度 *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25.0330"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      經度 *
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="121.5654"
                      required
                    />
                  </div>
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
                      placeholder="📍"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      資料夾
                    </label>
                    <select
                      value={formData.folderId || ''}
                      onChange={(e) => setFormData({ ...formData, folderId: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">選擇資料夾（選填）</option>
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.icon} {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入描述（選填）"
                    rows={2}
                  />
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
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingPlace ? '更新' : '建立'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceManager;
