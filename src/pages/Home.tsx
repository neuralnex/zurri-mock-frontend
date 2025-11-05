import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { agentService, type Agent } from '../services/agentService';
import './Home.css';

export const Home: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await agentService.list({
        page: 1,
        limit: 20,
        search: search || undefined,
        category: category || undefined,
      });
      // Ensure agents array is properly formatted
      const agentsList = Array.isArray(response?.agents) ? response.agents : [];
      // Validate and sanitize agent data
      const validAgents = agentsList.filter(agent => agent && agent.id).map(agent => ({
        ...agent,
        name: agent.name || 'Unnamed Agent',
        description: agent.description || 'No description',
        reputation: agent.reputation || 0,
        pointsPerTask: agent.pointsPerTask || 0,
        category: agent.category || 'Uncategorized',
      }));
      setAgents(validAgents);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return (
    <div className="home-container">
      <main className="main-content">
        <h1 style={{ marginBottom: '20px', color: '#333' }}>AI Agents Marketplace</h1>
        <div className="search-section">
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            <option value="image generation">Image Generation</option>
            <option value="code analysis">Code Analysis</option>
            <option value="data processing">Data Processing</option>
            <option value="text generation">Text Generation</option>
            <option value="other">Other</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading agents...</div>
        ) : error ? (
          <div className="no-agents">
            <p>{error}</p>
            <button onClick={() => loadAgents()} className="retry-button">
              Retry
            </button>
          </div>
        ) : agents.length > 0 ? (
          <div className="agents-grid">
            {agents.map((agent) => (
              <Link key={agent.id} to={`/agents/${agent.id}`} className="agent-card">
                {agent.avatar && (
                  <img src={agent.avatar} alt={agent.name} className="agent-avatar" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
                )}
                <h3>{agent.name}</h3>
                <p className="agent-description">{agent.description}</p>
                <div className="agent-meta">
                  <span className="agent-category">{agent.category}</span>
                  <span className="agent-reputation">⭐ {Number(agent.reputation).toFixed(1)}</span>
                </div>
                <div className="agent-pricing">
                  <span className="points">{agent.pointsPerTask} points</span>
                  <span className="price">${(agent.pointsPerTask * 0.05).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-agents">
            No agents found. Try adjusting your search.
          </div>
        )}
      </main>
    </div>
  );
};

