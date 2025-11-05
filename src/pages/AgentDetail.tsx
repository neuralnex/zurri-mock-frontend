import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { agentService, type Agent } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './AgentDetail.css';

export const AgentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadAgent();
    }
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await agentService.getById(id!);
      if (!data || !data.id) {
        throw new Error('Invalid agent data received');
      }
      // Validate and sanitize agent data
      const sanitizedAgent = {
        ...data,
        name: data.name || 'Unnamed Agent',
        description: data.description || 'No description',
        reputation: data.reputation || 0,
        pointsPerTask: data.pointsPerTask || 0,
        category: data.category || 'Uncategorized',
        usageCount: data.usageCount || 0,
        ratingCount: data.ratingCount || 0,
        status: data.status || 'pending',
        capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
      };
      setAgent(sanitizedAgent);
    } catch (err: any) {
      console.error('Failed to load agent:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load agent');
      setAgent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/agents/${id}/chat`);
  };

  if (loading) return <div className="loading">Loading agent...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!agent) return <div className="error-message">Agent not found</div>;

  return (
    <div className="agent-detail-container">
      <Link to="/" className="back-link">← Back to Marketplace</Link>
      
      <div className="agent-detail-card">
        {agent.avatar && (
          <img src={agent.avatar} alt={agent.name} className="agent-detail-avatar" />
        )}
        <h1>{agent.name}</h1>
        <p className="agent-detail-description">{agent.description}</p>
        
        <div className="agent-detail-meta">
          <div className="meta-item">
            <strong>Category:</strong> {agent.category || 'Uncategorized'}
          </div>
          <div className="meta-item">
            <strong>Reputation:</strong> ⭐ {Number(agent.reputation).toFixed(1)} ({agent.ratingCount} ratings)
          </div>
          <div className="meta-item">
            <strong>Usage:</strong> {agent.usageCount} tasks
          </div>
          <div className="meta-item">
            <strong>Status:</strong> <span className={`status-badge status-${agent.status}`}>{agent.status}</span>
          </div>
        </div>

        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="capabilities">
            <strong>Capabilities:</strong>
            <div className="capabilities-list">
              {agent.capabilities.map((cap, idx) => (
                <span key={idx} className="capability-tag">{cap}</span>
              ))}
            </div>
          </div>
        )}

        <div className="agent-pricing-section">
          <div className="pricing-info">
            <span className="points-large">{agent.pointsPerTask} points</span>
            <span className="price-large">${(agent.pointsPerTask * 0.05).toFixed(2)} per task</span>
          </div>
          {agent.status === 'approved' && (
            <button onClick={handleChat} className="chat-button">
              Start Chatting
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

