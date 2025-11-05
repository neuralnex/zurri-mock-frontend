import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { walletService } from '../services/walletService';
import { agentService, type Agent } from '../services/agentService';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [becomingCreator, setBecomingCreator] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleBecomeCreator = async () => {
    // Check if profile exists first
    try {
      const profile = await userService.getCreatorProfile();
      if (!profile) {
        // Redirect to profile setup
        navigate('/creator-profile');
        return;
      }
    } catch (err) {
      // Profile doesn't exist, redirect to setup
      navigate('/creator-profile');
      return;
    }

    // Profile exists, proceed with becoming creator
    setBecomingCreator(true);
    setMessage(null);
    try {
      const response = await userService.becomeCreator();
      setMessage(response.message);
      // Refresh user data
      const updatedUser = await authService.getMe();
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Reload page to update context
      window.location.reload();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to become creator';
      if (err.response?.data?.profileEndpoint) {
        // Profile required, redirect to setup
        setMessage('Please complete your creator profile first');
        setTimeout(() => navigate('/creator-profile'), 2000);
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setBecomingCreator(false);
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

      {message && (
        <div className={`dashboard-message ${message.includes('error') || message.includes('Failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {!user?.isCreator && (
        <div className="become-creator-banner">
          <div className="become-creator-content">
            <h3>🎨 Become a Creator</h3>
            <p>Start creating and managing your own AI agents!</p>
            <button
              onClick={handleBecomeCreator}
              disabled={becomingCreator}
              className="become-creator-button"
            >
              {becomingCreator ? 'Processing...' : 'Become Creator'}
            </button>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Wallet Balance</h2>
          <div className="balance-display">
            <span className="points-large">{wallet?.balance || 0} points</span>
            <span className="dollars-large">${wallet?.balanceInDollars?.toFixed(2) || '0.00'}</span>
          </div>
          <Link to="/wallet" className="dashboard-link">Manage Wallet →</Link>
        </div>

        {user?.isCreator && (
          <div className="dashboard-card">
            <h2>My Agents</h2>
            <div className="agents-count">{myAgents.length}</div>
            <Link to="/agents/my/list" className="dashboard-link">View My Agents →</Link>
          </div>
        )}

        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/" className="action-button">Browse Agents</Link>
            {user?.isCreator && (
              <Link to="/agents/new" className="action-button">Create Agent</Link>
            )}
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

