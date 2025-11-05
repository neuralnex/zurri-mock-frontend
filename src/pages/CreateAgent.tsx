import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService, type CreateAgentData } from '../services/agentService';
import { useAuth } from '../contexts/AuthContext';
import './CreateAgent.css';

export const CreateAgent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateAgentData>({
    name: '',
    description: '',
    endpoint: '',
    category: '',
    capabilities: [],
    pointsPerTask: 0,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [capabilityInput, setCapabilityInput] = useState('');

  // Check if user is a creator
  if (!user?.isCreator) {
    return (
      <div className="create-agent-container">
        <div className="create-agent-card">
          <h2>Creator Access Required</h2>
          <p>You need to be a creator to create agents.</p>
          <button onClick={() => navigate('/dashboard')} className="action-button">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pointsPerTask' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAddCapability = () => {
    if (capabilityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        capabilities: [...(prev.capabilities || []), capabilityInput.trim()],
      }));
      setCapabilityInput('');
    }
  };

  const handleRemoveCapability = (index: number) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.name || !formData.description || !formData.endpoint || !formData.category) {
      setError('Name, description, endpoint, and category are required');
      return;
    }

    if (formData.pointsPerTask < 0) {
      setError('Points per task must be 0 or greater');
      return;
    }

    setLoading(true);

    try {
      const agentData: CreateAgentData = {
        ...formData,
        avatar: avatarFile || undefined,
      };
      
      await agentService.create(agentData);
      // Navigate to dashboard with success message
      navigate('/dashboard', { state: { message: 'Agent created successfully! It will be reviewed by an admin before appearing in the marketplace.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create agent');
      setLoading(false);
    }
  };

  return (
    <div className="create-agent-container">
      <div className="create-agent-card">
        <h2>Create New Agent</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="create-agent-form">
          <div className="form-group">
            <label htmlFor="name">Agent Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., PixelPainter"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe what your agent does..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="endpoint">Endpoint URL *</label>
            <input
              type="url"
              id="endpoint"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleInputChange}
              required
              placeholder="https://api.example.com/agent/run"
            />
            <small>The API endpoint where your agent receives requests</small>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              <option value="text-generation">Text Generation</option>
              <option value="image-generation">Image Generation</option>
              <option value="image-editing">Image Editing</option>
              <option value="code-generation">Code Generation</option>
              <option value="data-analysis">Data Analysis</option>
              <option value="translation">Translation</option>
              <option value="summarization">Summarization</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pointsPerTask">Points Per Task *</label>
            <input
              type="number"
              id="pointsPerTask"
              name="pointsPerTask"
              value={formData.pointsPerTask}
              onChange={handleInputChange}
              required
              min="0"
              step="0.1"
              placeholder="10"
            />
            <small>Points charged per task (1 point = $0.05). Set to 0 for free agents.</small>
          </div>

          <div className="form-group">
            <label htmlFor="capabilities">Capabilities</label>
            <div className="capabilities-input">
              <input
                type="text"
                value={capabilityInput}
                onChange={(e) => setCapabilityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCapability();
                  }
                }}
                placeholder="e.g., text-to-image"
              />
              <button type="button" onClick={handleAddCapability} className="add-button">
                Add
              </button>
            </div>
            {formData.capabilities && formData.capabilities.length > 0 && (
              <div className="capabilities-list">
                {formData.capabilities.map((cap, index) => (
                  <span key={index} className="capability-tag">
                    {cap}
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(index)}
                      className="remove-capability"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Avatar Image (Optional)</label>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleAvatarChange}
            />
            <small>JPG, PNG, GIF, WebP, SVG, or BMP (max 5MB)</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

