import { useState, useCallback, useEffect } from 'react';
import type { Place, Folder } from '../types';
import { placesApi, foldersApi } from '../services/data';

export const usePlaces = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [foldersResponse, placesResponse] = await Promise.all([
        foldersApi.getAll(),
        placesApi.getAll()
      ]);
      
      setFolders(foldersResponse.data || []);
      setPlaces(placesResponse.data || []);
    } catch (err) {
      console.error('載入數據失敗:', err);
      setError('載入數據失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlace = useCallback(async (placeData: any) => {
    try {
      const response = await placesApi.create(placeData);
      if (response.data) {
        setPlaces(prev => [...prev, response.data!]);
      }
      return response.data;
    } catch (err) {
      console.error('創建地點失敗:', err);
      throw err;
    }
  }, []);

  const updatePlace = useCallback(async (id: number, placeData: any) => {
    try {
      const response = await placesApi.update(id, placeData);
      if (response.data) {
        setPlaces(prev => prev.map(p => p.id === id ? response.data! : p));
      }
      return response.data;
    } catch (err) {
      console.error('更新地點失敗:', err);
      throw err;
    }
  }, []);

  const deletePlace = useCallback(async (id: number) => {
    try {
      await placesApi.delete(id);
      setPlaces(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('刪除地點失敗:', err);
      throw err;
    }
  }, []);

  const createFolder = useCallback(async (folderData: any) => {
    try {
      const response = await foldersApi.create(folderData);
      if (response.data) {
        setFolders(prev => [...prev, response.data!]);
      }
      return response.data;
    } catch (err) {
      console.error('創建資料夾失敗:', err);
      throw err;
    }
  }, []);

  const updateFolder = useCallback(async (id: number, folderData: any) => {
    try {
      const response = await foldersApi.update(id, folderData);
      if (response.data) {
        setFolders(prev => prev.map(f => f.id === id ? response.data! : f));
      }
      return response.data;
    } catch (err) {
      console.error('更新資料夾失敗:', err);
      throw err;
    }
  }, []);

  const deleteFolder = useCallback(async (id: number) => {
    try {
      await foldersApi.delete(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      // 刪除資料夾時，也要刪除相關的地點
      setPlaces(prev => prev.filter(p => p.folderId !== id));
    } catch (err) {
      console.error('刪除資料夾失敗:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    places,
    folders,
    loading,
    error,
    loadData,
    createPlace,
    updatePlace,
    deletePlace,
    createFolder,
    updateFolder,
    deleteFolder
  };
};
