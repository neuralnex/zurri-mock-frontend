import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentService, type Agent } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [pendingAgents, setPendingAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      loadPendingAgents();
    }
  }, [isAuthenticated, user]);

  const loadPendingAgents = async () => {
    try {
      setLoading(true);
      const agents = await agentService.getPendingAgents();
      setPendingAgents(agents);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pending agents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (agentId: string) => {
    setApproving(agentId);
    try {
      await agentService.approve(agentId);
      await loadPendingAgents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve agent');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (agentId: string) => {
    if (!window.confirm('Are you sure you want to reject this agent?')) {
      return;
    }
    setRejecting(agentId);
    try {
      await agentService.reject(agentId);
      await loadPendingAgents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reject agent');
    } finally {
      setRejecting(null);
    }
  };

  if (!isAuthenticated) {
    return <div>Please login to view admin dashboard</div>;
  }

  if (!user?.isAdmin) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-card">
          <h2>Access Denied</h2>
          <p>You must be an admin to access this page.</p>
          <Link to="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading pending agents...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <p className="admin-subtitle">Review and approve pending agents</p>

      {error && <div className="error-message">{error}</div>}

      {pendingAgents.length === 0 ? (
        <div className="empty-state">
          <p>No pending agents to review.</p>
          <Link to="/">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="pending-agents-list">
          {pendingAgents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                {agent.avatar && (
                  <img src={agent.avatar} alt={agent.name} className="agent-avatar" />
                )}
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  <p className="agent-creator">Creator: {agent.creatorId}</p>
                  <p className="agent-category">Category: {agent.category || 'N/A'}</p>
                </div>
              </div>

              <div className="agent-description">
                <p>{agent.description}</p>
              </div>

              <div className="agent-details">
                <div className="detail-item">
                  <span className="detail-label">Endpoint:</span>
                  <span className="detail-value">{(agent as any).endpoint || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Points per Task:</span>
                  <span className="detail-value">{agent.pointsPerTask || 0}</span>
                </div>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Capabilities:</span>
                    <div className="capabilities-tags">
                      {agent.capabilities.map((cap, idx) => (
                        <span key={idx} className="capability-tag">{cap}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="agent-actions">
                <Link
                  to={`/agents/${agent.id}/chat`}
                  className="test-button"
                  title="Test agent in chat (admin can test pending agents)"
                >
                  🧪 Test Agent
                </Link>
                <button
                  onClick={() => handleApprove(agent.id)}
                  disabled={approving === agent.id || rejecting === agent.id}
                  className="approve-button"
                >
                  {approving === agent.id ? 'Approving...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleReject(agent.id)}
                  disabled={approving === agent.id || rejecting === agent.id}
                  className="reject-button"
                >
                  {rejecting === agent.id ? 'Rejecting...' : '✗ Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

