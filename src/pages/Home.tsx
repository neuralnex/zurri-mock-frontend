import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { agentService, type Agent } from '../services/agentService';
import './Home.css';

export const Home: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadAgents();
  }, [search, category]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await agentService.list({
        page: 1,
        limit: 20,
        search: search || undefined,
        category: category || undefined,
      });
      setAgents(response.agents);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <main className="main-content">
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
          </select>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading agents...</div>
        ) : (
          <div className="agents-grid">
            {agents.map((agent) => (
              <Link key={agent.id} to={`/agents/${agent.id}`} className="agent-card">
                {agent.avatar && (
                  <img src={agent.avatar} alt={agent.name} className="agent-avatar" />
                )}
                <h3>{agent.name}</h3>
                <p className="agent-description">{agent.description}</p>
                <div className="agent-meta">
                  <span className="agent-category">{agent.category || 'Uncategorized'}</span>
                  <span className="agent-reputation">⭐ {agent.reputation.toFixed(1)}</span>
                </div>
                <div className="agent-pricing">
                  <span className="points">{agent.pointsPerTask} points</span>
                  <span className="price">${(agent.pointsPerTask * 0.05).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && agents.length === 0 && (
          <div className="no-agents">No agents found. Try adjusting your search.</div>
        )}
      </main>
    </div>
  );
};

