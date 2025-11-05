import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Wallet {
  id: string;
  balance: number;
  balanceInDollars: number;
  freeTasksRemaining: number;
}

export interface FundWalletData {
  amount: number; // Amount in NGN
}

export interface FundWalletResponse {
  publicKey: string;
  reference: string;
  authorization_url: string;
  access_code: string;
  payment: {
    reference: string;
    amount: number;
    currency: string;
    points: number;
    amountInDollars: string;
  };
  message: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'charge' | 'refund' | 'free' | 'admin_test';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  balanceAfter: number;
  description?: string;
  agentId?: string;
  createdAt: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const walletService = {
  async getWallet(): Promise<{ wallet: Wallet }> {
    const response = await api.get(API_ENDPOINTS.wallet);
    return response.data;
  },

  async fundWallet(data: FundWalletData): Promise<FundWalletResponse> {
    const response = await api.post(API_ENDPOINTS.fundWallet, data);
    return response.data;
  },

  async verifyTransaction(reference: string): Promise<{
    success: boolean;
    message: string;
    transaction: Transaction;
    wallet: Wallet;
  }> {
    const response = await api.get(API_ENDPOINTS.verifyTransaction(reference));
    return response.data;
  },

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<TransactionListResponse> {
    const response = await api.get(API_ENDPOINTS.transactions, { params });
    return response.data;
  },
};

