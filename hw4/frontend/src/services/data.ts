import api from './api';
import type { 
  Folder, 
  CreateFolderRequest, 
  UpdateFolderRequest,
  Place,
  CreatePlaceRequest,
  UpdatePlaceRequest,
  Entry,
  CreateEntryRequest,
  UpdateEntryRequest,
  ApiResponse,
  PlacesSearchResult
} from '../types';

// Folders API
export const foldersApi = {
  // 取得所有資料夾（樹狀結構）
  getAll: async (): Promise<ApiResponse<Folder[]>> => {
    const response = await api.get('/folders');
    return response.data;
  },

  // 取得單一資料夾
  getById: async (id: number): Promise<ApiResponse<Folder>> => {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  // 新增資料夾
  create: async (data: CreateFolderRequest): Promise<ApiResponse<Folder>> => {
    const response = await api.post('/folders', data);
    return response.data;
  },

  // 更新資料夾
  update: async (id: number, data: UpdateFolderRequest): Promise<ApiResponse<Folder>> => {
    const response = await api.put(`/folders/${id}`, data);
    return response.data;
  },

  // 刪除資料夾
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};

// Places API (New)
export const placesApiNew = {
  // 取得所有地點
  getAll: async (folderId?: number): Promise<ApiResponse<Place[]>> => {
    const params = folderId ? { folderId } : {};
    const response = await api.get('/places-new', { params });
    return response.data;
  },

  // 取得單一地點
  getById: async (id: number): Promise<ApiResponse<Place>> => {
    const response = await api.get(`/places-new/${id}`);
    return response.data;
  },

  // 新增地點
  create: async (data: CreatePlaceRequest): Promise<ApiResponse<Place>> => {
    const response = await api.post('/places-new', data);
    return response.data;
  },

  // 更新地點
  update: async (id: number, data: UpdatePlaceRequest): Promise<ApiResponse<Place>> => {
    const response = await api.put(`/places-new/${id}`, data);
    return response.data;
  },

  // 刪除地點
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/places-new/${id}`);
    return response.data;
  },
};

// 保持向後兼容的別名
export const placesApi = placesApiNew;

// Entries API
export const entriesApi = {
  // 取得所有造訪紀錄
  getAll: async (placeId?: number): Promise<ApiResponse<Entry[]>> => {
    const params = placeId ? { placeId } : {};
    const response = await api.get('/entries', { params });
    return response.data;
  },

  // 取得單一造訪紀錄
  getById: async (id: number): Promise<ApiResponse<Entry>> => {
    const response = await api.get(`/entries/${id}`);
    return response.data;
  },

  // 新增造訪紀錄
  create: async (data: CreateEntryRequest): Promise<ApiResponse<Entry>> => {
    const response = await api.post('/entries', data);
    return response.data;
  },

  // 更新造訪紀錄
  update: async (id: number, data: UpdateEntryRequest): Promise<ApiResponse<Entry>> => {
    const response = await api.put(`/entries/${id}`, data);
    return response.data;
  },

  // 刪除造訪紀錄
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete(`/entries/${id}`);
    return response.data;
  },
};

// Maps API
export const mapsApi = {
  // 地理編碼（地址轉座標）
  geocode: async (address: string): Promise<ApiResponse<{
    lat: number;
    lng: number;
    formattedAddress: string;
  }>> => {
    const response = await api.post('/maps/geocode', { address });
    return response.data;
  },

  // 反向地理編碼（座標轉地址）
  reverseGeocode: async (lat: number, lng: number): Promise<ApiResponse<{
    formattedAddress: string;
  }>> => {
    const response = await api.post('/maps/reverse-geocode', { lat, lng });
    return response.data;
  },

  // 搜尋附近地點
  nearbySearch: async (
    lat: number, 
    lng: number, 
    radius: number = 5000, 
    keyword?: string, 
    type?: string
  ): Promise<ApiResponse<PlacesSearchResult[]>> => {
    const response = await api.post('/maps/nearby-search', { 
      lat, 
      lng, 
      radius, 
      keyword, 
      type 
    });
    return response.data;
  },

  // 路線規劃
  directions: async (
    origin: string, 
    destination: string, 
    mode: string = 'driving'
  ): Promise<ApiResponse<any>> => {
    const response = await api.post('/maps/directions', { 
      origin, 
      destination, 
      mode 
    });
    return response.data;
  },
};

// Search API
export const searchApi = {
  // 文字搜尋
  textSearch: async (
    query: string,
    location?: { lat: number; lng: number },
    radius?: number,
    type?: string
  ): Promise<ApiResponse<PlacesSearchResult[]>> => {
    const response = await api.post('/search/text-search', {
      query,
      location,
      radius,
      type
    });
    return response.data;
  },

  // 附近搜尋
  nearbySearch: async (
    location: { lat: number; lng: number },
    radius?: number,
    type?: string,
    keyword?: string
  ): Promise<ApiResponse<PlacesSearchResult[]>> => {
    const response = await api.post('/search/nearby-search', {
      location,
      radius,
      type,
      keyword
    });
    return response.data;
  },

  // 取得地點詳細資訊
  getPlaceDetails: async (placeId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/search/place-details/${placeId}`);
    return response.data;
  },
};

// 為了向後相容，保留舊的 API 名稱
export const collectionsApi = foldersApi;
export { foldersApi as default };