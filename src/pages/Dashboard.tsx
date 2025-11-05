import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletService } from '../services/walletService';
import { agentService, type Agent } from '../services/agentService';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const [walletData, agentsData] = await Promise.all([
        walletService.getWallet().catch(() => null),
        agentService.getMyAgents().catch(() => []),
      ]);
      if (walletData) setWallet(walletData.wallet);
      setMyAgents(agentsData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to view your dashboard</div>;
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name || user?.email}!</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Wallet Balance</h2>
          <div className="balance-display">
            <span className="points-large">{wallet?.balance || 0} points</span>
            <span className="dollars-large">${wallet?.balanceInDollars.toFixed(2) || '0.00'}</span>
          </div>
          <Link to="/wallet" className="dashboard-link">Manage Wallet →</Link>
        </div>

        <div className="dashboard-card">
          <h2>My Agents</h2>
          <div className="agents-count">{myAgents.length}</div>
          <Link to="/agents/my" className="dashboard-link">View My Agents →</Link>
        </div>

        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/" className="action-button">Browse Agents</Link>
            <Link to="/agents/create" className="action-button">Create Agent</Link>
          </div>
        </div>
      </div>

      {user?.isAdmin && (
        <div className="admin-section">
          <h2>Admin</h2>
          <Link to="/admin" className="admin-link">Admin Dashboard →</Link>
        </div>
      )}
    </div>
  );
};

