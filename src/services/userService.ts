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

export interface CreatorProfile {
  id?: string;
  fullName: string;
  username: string;
  bio?: string;
  organization?: string;
  role?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  huggingfaceUrl?: string;
  primaryLanguages?: string[];
  frameworks?: string[];
  agentSpecialties?: string[];
  preferredCompute?: string;
  endpointHosting?: string;
  walletAddress?: string;
  bankAccount?: {
    accountName?: string;
    accountNumber?: string;
    bankCode?: string;
  };
  preferredCurrency?: string;
  country?: string;
  taxId?: string;
}

export const userService = {
  async updateProfile(name: string): Promise<{ message: string; user: any }> {
    const response = await api.put(API_ENDPOINTS.updateProfile, { name });
    return response.data;
  },

  async getCreatorProfile(): Promise<CreatorProfile | null> {
    try {
      const response = await api.get(API_ENDPOINTS.creatorProfile);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async saveCreatorProfile(profile: CreatorProfile): Promise<CreatorProfile> {
    const response = await api.post(API_ENDPOINTS.creatorProfile, profile);
    return response.data;
  },

  async becomeCreator(): Promise<BecomeCreatorResponse> {
    const response = await api.post(API_ENDPOINTS.becomeCreator);
    return response.data;
  },
};

