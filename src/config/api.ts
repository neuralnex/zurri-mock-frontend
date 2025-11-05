export const API_BASE_URL = 'https://nexusbert-zurri.hf.space/api';

export const API_ENDPOINTS = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  
  // Agents
  agents: '/agents',
  agentDetail: (id: string) => `/agents/${id}`,
  myAgents: '/agents/my/list',
  createAgent: '/agents',
  updateAgent: (id: string) => `/agents/${id}`,
  deleteAgent: (id: string) => `/agents/${id}`,
  delistAgent: (id: string) => `/agents/${id}/delist`,
  relistAgent: (id: string) => `/agents/${id}/relist`,
  
  // Chat
  sendMessage: (agentId: string) => `/chat/${agentId}/message`,
  chatHistory: (agentId: string) => `/chat/${agentId}/history`,
  
  // Wallet
  wallet: '/wallet',
  fundWallet: '/wallet/fund',
  verifyTransaction: (reference: string) => `/wallet/verify/${reference}`,
  transactions: '/wallet/transactions',
  
  // User
  userHistory: '/users/me/history',
  
  // Creator
  creatorOverview: '/creators/me/overview',
  creatorEarnings: '/creators/me/earnings',
  
  // Admin
  adminOverview: '/admin/overview',
  pendingAgents: '/agents/admin/pending',
  approveAgent: (id: string) => `/agents/${id}/approve`,
  rejectAgent: (id: string) => `/agents/${id}/reject`,
};

