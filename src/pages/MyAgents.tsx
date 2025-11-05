import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentService, type Agent } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './MyAgents.css';

export const MyAgents: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.isCreator) {
      loadAgents();
    }
  }, [isAuthenticated, user]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await agentService.getMyAgents();
      setAgents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      suspended: 'status-suspended',
    };
    return <span className={`status-badge ${statusClasses[status] || ''}`}>{status}</span>;
  };

  if (!isAuthenticated) {
    return <div>Please login to view your agents</div>;
  }

  if (!user?.isCreator) {
    return (
      <div className="my-agents-container">
        <div className="error-card">
          <h2>Access Denied</h2>
          <p>You must be a creator to view your agents.</p>
          <Link to="/dashboard">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your agents...</div>;
  }

  return (
    <div className="my-agents-container">
      <div className="my-agents-header">
        <h1>My Agents</h1>
        <Link to="/agents/new" className="create-button">+ Create New Agent</Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {agents.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any agents yet.</p>
          <Link to="/agents/new" className="create-button">Create Your First Agent</Link>
        </div>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                {agent.avatar && (
                  <img src={agent.avatar} alt={agent.name} className="agent-avatar" />
                )}
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  {getStatusBadge(agent.status)}
                </div>
              </div>

              <p className="agent-description">{agent.description}</p>

              <div className="agent-details">
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span className="detail-value">{agent.category || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Points per Task:</span>
                  <span className="detail-value">{agent.pointsPerTask || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Usage Count:</span>
                  <span className="detail-value">{agent.usageCount || 0}</span>
                </div>
              </div>

              <div className="agent-actions">
                {agent.status === 'approved' && (
                  <Link to={`/agents/${agent.id}/chat`} className="action-button test-button">
                    Test Agent
                  </Link>
                )}
                <Link to={`/agents/${agent.id}`} className="action-button view-button">
                  View Details
                </Link>
                {agent.status === 'pending' && (
                  <span className="pending-note">Waiting for admin approval</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

