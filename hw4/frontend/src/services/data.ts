import api from './api';

// 型別定義
export interface Collection {
  id: number;
  name: string;
  color?: string;
  userId: number;
  createdAt: string;
  _count?: {
    entries: number;
  };
}

export interface Place {
  id: number;
  name?: string;
  address?: string;
  lat: number;
  lng: number;
  createdAt: string;
  _count?: {
    entries: number;
  };
}

export interface Entry {
  id: number;
  placeId: number;
  userId: number;
  emoji?: string;
  rating?: number;
  note?: string;
  visitedAt?: string;
  weather?: string;
  photoUrl?: string;
  createdAt: string;
  place: Place;
  collections: Collection[];
}

// Collections API
export const collectionsApi = {
  // 取得所有資料夾
  getAll: async (): Promise<Collection[]> => {
    const response = await api.get('/collections');
    return response.data.data;
  },

  // 新增資料夾
  create: async (data: { name: string; color?: string }): Promise<Collection> => {
    const response = await api.post('/collections', data);
    return response.data.data;
  },

  // 更新資料夾
  update: async (id: number, data: { name: string; color?: string }): Promise<Collection> => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data.data;
  },

  // 刪除資料夾
  delete: async (id: number): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};

// Places API
export const placesApi = {
  // 取得所有地點
  getAll: async (): Promise<Place[]> => {
    const response = await api.get('/places');
    return response.data.data;
  },

  // 新增地點
  create: async (data: { name?: string; address?: string; lat: number; lng: number }): Promise<Place> => {
    const response = await api.post('/places', data);
    return response.data.data;
  },

  // 更新地點
  update: async (id: number, data: { name?: string; address?: string }): Promise<Place> => {
    const response = await api.put(`/places/${id}`, data);
    return response.data.data;
  },

  // 刪除地點
  delete: async (id: number): Promise<void> => {
    await api.delete(`/places/${id}`);
  },
};

// Entries API
export const entriesApi = {
  // 取得所有造訪紀錄
  getAll: async (collectionId?: number): Promise<Entry[]> => {
    const params = collectionId ? { collectionId } : {};
    const response = await api.get('/entries', { params });
    return response.data.data;
  },

  // 新增造訪紀錄
  create: async (data: {
    placeId: number;
    collectionIds?: number[];
    emoji?: string;
    rating?: number;
    note?: string;
    visitedAt?: string;
    weather?: string;
    photoUrl?: string;
  }): Promise<Entry> => {
    const response = await api.post('/entries', data);
    return response.data.data;
  },

  // 更新造訪紀錄
  update: async (id: number, data: {
    collectionIds?: number[];
    emoji?: string;
    rating?: number;
    note?: string;
    visitedAt?: string;
    weather?: string;
    photoUrl?: string;
  }): Promise<Entry> => {
    const response = await api.put(`/entries/${id}`, data);
    return response.data.data;
  },

  // 刪除造訪紀錄
  delete: async (id: number): Promise<void> => {
    await api.delete(`/entries/${id}`);
  },
};

// Maps API
export const mapsApi = {
  // 地理編碼
  geocode: async (address: string) => {
    const response = await api.post('/maps/geocode', { address });
    return response.data.data;
  },

  // 反向地理編碼
  reverseGeocode: async (lat: number, lng: number) => {
    const response = await api.post('/maps/reverse-geocode', { lat, lng });
    return response.data.data;
  },

  // 搜尋附近地點
  nearbySearch: async (lat: number, lng: number, radius?: number, type?: string) => {
    const response = await api.post('/maps/nearby-search', { lat, lng, radius, type });
    return response.data.data;
  },

  // 路線規劃
  directions: async (origin: string, destination: string, mode?: string) => {
    const response = await api.post('/maps/directions', { origin, destination, mode });
    return response.data.data;
  },
};
