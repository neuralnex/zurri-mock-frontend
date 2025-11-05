import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  category?: string;
  reputation: number;
  capabilities: string[];
  pointsPerTask: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  usageCount: number;
  ratingCount: number;
  createdAt: string;
  creatorId: string;
}

export interface AgentListResponse {
  agents: Agent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAgentData {
  name: string;
  description: string;
  endpoint: string;
  category?: string;
  capabilities?: string[];
  pointsPerTask: number;
  avatar?: File;
}

export const agentService = {
  async list(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minReputation?: number;
  }): Promise<AgentListResponse> {
    const response = await api.get(API_ENDPOINTS.agents, { params });
    return response.data;
  },

  async getById(id: string): Promise<Agent> {
    const response = await api.get(API_ENDPOINTS.agentDetail(id));
    return response.data;
  },

  async getMyAgents(): Promise<Agent[]> {
    const response = await api.get(API_ENDPOINTS.myAgents);
    return response.data;
  },

  async create(data: CreateAgentData): Promise<Agent> {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('endpoint', data.endpoint);
    formData.append('pointsPerTask', data.pointsPerTask.toString());
    if (data.category) formData.append('category', data.category);
    if (data.capabilities) {
      formData.append('capabilities', JSON.stringify(data.capabilities));
    }
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await api.post(API_ENDPOINTS.createAgent, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(id: string, data: Partial<CreateAgentData>): Promise<Agent> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'capabilities' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.put(API_ENDPOINTS.updateAgent(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.deleteAgent(id));
  },

  async delist(id: string): Promise<Agent> {
    const response = await api.patch(API_ENDPOINTS.delistAgent(id));
    return response.data;
  },

  async relist(id: string): Promise<Agent> {
    const response = await api.patch(API_ENDPOINTS.relistAgent(id));
    return response.data;
  },

  async getPendingAgents(): Promise<Agent[]> {
    const response = await api.get(API_ENDPOINTS.pendingAgents);
    return response.data;
  },

  async approve(id: string): Promise<Agent> {
    const response = await api.patch(API_ENDPOINTS.approveAgent(id));
    return response.data;
  },

  async reject(id: string): Promise<Agent> {
    const response = await api.patch(API_ENDPOINTS.rejectAgent(id));
    return response.data;
  },
};

