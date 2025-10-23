/**
 * API 服務
 * 封裝所有與後端通信的請求
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// 建立 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 請求攔截器：自動新增 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 響應攔截器：處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 過期或無效，清除本地儲存並跳轉到登入頁
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 認證相關 API
 */
export const authAPI = {
  // 註冊
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password
    });
    return response.data;
  },

  // 登入
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    return response.data;
  }
};

/**
 * 路線相關 API
 */
export const routeAPI = {
  // 建立路線
  createRoute: async (routeData) => {
    const response = await api.post('/api/routes', routeData);
    return response.data;
  },

  // 取得所有路線
  getRoutes: async () => {
    const response = await api.get('/api/routes');
    return response.data;
  },

  // 取得單一路線
  getRoute: async (id) => {
    const response = await api.get(`/api/routes/${id}`);
    return response.data;
  },

  // 更新路線
  updateRoute: async (id, payload) => {
    const response = await api.patch(`/api/routes/${id}`, payload);
    return response.data;
  },

  // 刪除路線
  deleteRoute: async (id) => {
    const response = await api.delete(`/api/routes/${id}`);
    return response.data;
  }
};

export default api;
