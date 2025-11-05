import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentId: string;
  userId: string;
  conversationId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SendMessageData {
  message?: string;
  conversationId?: string;
  metadata?: Record<string, any>;
  files?: File[];
}

export interface SendMessageResponse {
  response: string;
  conversationId: string;
  metadata?: Record<string, any>;
}

export const chatService = {
  async sendMessage(agentId: string, data: SendMessageData): Promise<SendMessageResponse> {
    // Backend expects multipart/form-data when files are present
    const formData = new FormData();
    
    if (data.message) {
      formData.append('message', data.message);
    }
    
    if (data.conversationId) {
      formData.append('conversationId', data.conversationId);
    }
    
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }
    
    // Add files if present
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', file);
      });
    }

    // FormData will be handled by API interceptor (Content-Type with boundary set automatically)
    const response = await api.post(API_ENDPOINTS.sendMessage(agentId), formData);
    return response.data;
  },

  async getHistory(agentId: string, params?: {
    conversationId?: string;
    role?: string;
    from?: string;
    to?: string;
    search?: string;
    limit?: number;
  }): Promise<ChatMessage[]> {
    // Backend returns { messages: ChatMessage[] }
    const response = await api.get(API_ENDPOINTS.chatHistory(agentId), { params });
    return response.data.messages || [];
  },
};

