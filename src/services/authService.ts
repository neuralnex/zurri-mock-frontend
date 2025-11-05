import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
  isCreator?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.register, data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.login, data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get(API_ENDPOINTS.me);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.forgotPassword, { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.resetPassword, { token, password });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post(API_ENDPOINTS.changePassword, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

