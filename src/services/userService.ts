import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface BecomeCreatorResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    isCreator: boolean;
    isAdmin: boolean;
  };
}

export const userService = {
  async becomeCreator(): Promise<BecomeCreatorResponse> {
    const response = await api.post(API_ENDPOINTS.becomeCreator);
    return response.data;
  },
};

