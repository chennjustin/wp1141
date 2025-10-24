import api from './api';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';

// 註冊
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

// 登入
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// 登出
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// 取得當前使用者
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 檢查是否已登入
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
