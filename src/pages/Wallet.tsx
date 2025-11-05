import { useEffect, useState } from 'react';
import { walletService, type Wallet as WalletType, type Transaction } from '../services/walletService';
import { useAuth } from '../contexts/AuthContext';
import './Wallet.css';

export const Wallet: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundAmount, setFundAmount] = useState('');
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadWallet();
      loadTransactions();
    }
  }, [isAuthenticated]);

  const loadWallet = async () => {
    try {
      const response = await walletService.getWallet();
      setWallet(response.wallet);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await walletService.getTransactions({ limit: 20 });
      setTransactions(response.transactions);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleFund = async () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setFunding(true);
      const response = await walletService.fundWallet({ amount });
      // Redirect to Paystack payment page
      window.location.href = response.authorization_url;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate payment');
      setFunding(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to view your wallet</div>;
  }

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  return (
    <div className="wallet-container">
      <h1>My Wallet</h1>

      <div className="wallet-balance-card">
        <h2>Balance</h2>
        <div className="balance-amount">
          <span className="points">{wallet?.balance || 0} points</span>
          <span className="dollars">${wallet?.balanceInDollars.toFixed(2) || '0.00'}</span>
        </div>
        <div className="free-tasks">
          Free tasks remaining: {wallet?.freeTasksRemaining || 0}
        </div>
      </div>

      <div className="fund-wallet-section">
        <h2>Fund Wallet</h2>
        <div className="fund-input-group">
          <label>
            Amount (NGN):
            <input
              type="number"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="Enter amount"
              min="100"
              step="100"
            />
          </label>
          <button onClick={handleFund} disabled={funding} className="fund-button">
            {funding ? 'Processing...' : 'Fund Wallet'}
          </button>
        </div>
        <small>Minimum: 100 NGN</small>
      </div>

      <div className="transactions-section">
        <h2>Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className={`type-${tx.type}`}>{tx.type}</td>
                  <td className={tx.amount < 0 ? 'negative' : 'positive'}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} pts
                  </td>
                  <td>{tx.balanceAfter} pts</td>
                  <td className={`status-${tx.status}`}>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

