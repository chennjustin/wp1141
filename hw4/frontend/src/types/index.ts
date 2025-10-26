export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 資料夾相關型別
export interface Folder {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  userId: number;
  parentId?: number;
  parent?: Folder;
  children?: Folder[];
  places?: Place[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    places: number;
  };
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: number;
}

// 地點相關型別
export interface Place {
  id: number;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  emoji?: string;
  description?: string; // 旅遊心得
  rating?: number;
  visitedAt?: string;
  weather?: string;
  travelMode?: string; // 交通方式
  companions?: string; // 同行夥伴
  expenses?: string; // 花費
  tags?: string[]; // 標籤
  photos?: string[]; // 照片
  userId: number;
  folderId?: number;
  folder?: Folder;
  entries?: Entry[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    entries: number;
  };
}

export interface CreatePlaceRequest {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  emoji?: string;
  description?: string;
  rating?: number;
  visitedAt?: string;
  weather?: string;
  travelMode?: string;
  companions?: string;
  expenses?: string;
  tags?: string[];
  photos?: string[];
  folderId?: number;
}

export interface UpdatePlaceRequest {
  name?: string;
  address?: string;
  emoji?: string;
  description?: string;
  rating?: number;
  visitedAt?: string;
  weather?: string;
  travelMode?: string;
  companions?: string;
  expenses?: string;
  tags?: string[];
  photos?: string[];
  folderId?: number;
}

// 造訪紀錄相關型別
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
  updatedAt: string;
  place?: Place;
}

export interface CreateEntryRequest {
  placeId: number;
  emoji?: string;
  rating?: number;
  note?: string;
  visitedAt?: string;
  weather?: string;
  photoUrl?: string;
}

export interface UpdateEntryRequest {
  emoji?: string;
  rating?: number;
  note?: string;
  visitedAt?: string;
  weather?: string;
  photoUrl?: string;
}

// API 回應型別
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Google Maps 相關型別
export interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

export interface PlacesSearchResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  types: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}
