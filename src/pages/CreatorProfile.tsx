import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, type CreatorProfile as CreatorProfileType } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './CreatorProfile.css';

export const CreatorProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  const [frameworkInput, setFrameworkInput] = useState('');
  const [specialtyInput, setSpecialtyInput] = useState('');

  const [formData, setFormData] = useState<CreatorProfileType>({
    fullName: user?.name || '',
    username: '',
    bio: '',
    organization: '',
    role: '',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
    huggingfaceUrl: '',
    primaryLanguages: [],
    frameworks: [],
    agentSpecialties: [],
    preferredCompute: '',
    endpointHosting: '',
    walletAddress: '',
    bankAccount: {},
    preferredCurrency: '',
    country: '',
    taxId: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setFetching(true);
      const profile = await userService.getCreatorProfile();
      if (profile) {
        setFormData(profile);
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankAccountChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value,
      },
    }));
  };

  const handleAddArrayItem = (field: 'primaryLanguages' | 'frameworks' | 'agentSpecialties', input: string, setInput: (val: string) => void) => {
    if (input.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), input.trim()],
      }));
      setInput('');
    }
  };

  const handleRemoveArrayItem = (field: 'primaryLanguages' | 'frameworks' | 'agentSpecialties', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.username) {
      setError('Full name and username are required');
      return;
    }

    setLoading(true);

    try {
      await userService.saveCreatorProfile(formData);
      
      // If user is not yet a creator, offer to become one
      if (!user?.isCreator) {
        if (window.confirm('Profile saved! Would you like to become a creator now?')) {
          try {
            await userService.becomeCreator();
            window.location.reload(); // Reload to update user context
          } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to become creator');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="creator-profile-container">
      <div className="creator-profile-card">
        <h2>Creator Profile Setup</h2>
        <p className="profile-description">
          Complete your creator profile to start creating and managing AI agents.
        </p>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="creator-profile-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="@username"
              />
              <small>Unique username for your creator profile</small>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                maxLength={200}
                placeholder="Brief description about yourself..."
              />
              <small>{formData.bio?.length || 0}/200 characters</small>
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-group">
              <label htmlFor="organization">Organization</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Company or organization"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                placeholder="e.g., AI Engineer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="linkedinUrl">LinkedIn URL</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div className="form-group">
              <label htmlFor="githubUrl">GitHub URL</label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="form-group">
              <label htmlFor="huggingfaceUrl">Hugging Face URL</label>
              <input
                type="url"
                id="huggingfaceUrl"
                name="huggingfaceUrl"
                value={formData.huggingfaceUrl}
                onChange={handleInputChange}
                placeholder="https://huggingface.co/yourusername"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Technical Stack</h3>
            <div className="form-group">
              <label htmlFor="primaryLanguages">Primary Languages</label>
              <div className="array-input">
                <input
                  type="text"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddArrayItem('primaryLanguages', languageInput, setLanguageInput);
                    }
                  }}
                  placeholder="e.g., Python"
                />
                <button type="button" onClick={() => handleAddArrayItem('primaryLanguages', languageInput, setLanguageInput)}>
                  Add
                </button>
              </div>
              <div className="tags-list">
                {formData.primaryLanguages?.map((lang, index) => (
                  <span key={index} className="tag">
                    {lang}
                    <button type="button" onClick={() => handleRemoveArrayItem('primaryLanguages', index)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="frameworks">Frameworks</label>
              <div className="array-input">
                <input
                  type="text"
                  value={frameworkInput}
                  onChange={(e) => setFrameworkInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddArrayItem('frameworks', frameworkInput, setFrameworkInput);
                    }
                  }}
                  placeholder="e.g., TensorFlow"
                />
                <button type="button" onClick={() => handleAddArrayItem('frameworks', frameworkInput, setFrameworkInput)}>
                  Add
                </button>
              </div>
              <div className="tags-list">
                {formData.frameworks?.map((fw, index) => (
                  <span key={index} className="tag">
                    {fw}
                    <button type="button" onClick={() => handleRemoveArrayItem('frameworks', index)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="agentSpecialties">Agent Specialties</label>
              <div className="array-input">
                <input
                  type="text"
                  value={specialtyInput}
                  onChange={(e) => setSpecialtyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddArrayItem('agentSpecialties', specialtyInput, setSpecialtyInput);
                    }
                  }}
                  placeholder="e.g., image-generation"
                />
                <button type="button" onClick={() => handleAddArrayItem('agentSpecialties', specialtyInput, setSpecialtyInput)}>
                  Add
                </button>
              </div>
              <div className="tags-list">
                {formData.agentSpecialties?.map((spec, index) => (
                  <span key={index} className="tag">
                    {spec}
                    <button type="button" onClick={() => handleRemoveArrayItem('agentSpecialties', index)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="preferredCompute">Preferred Compute</label>
              <input
                type="text"
                id="preferredCompute"
                name="preferredCompute"
                value={formData.preferredCompute}
                onChange={handleInputChange}
                placeholder="e.g., GPU, CPU, Cloud"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endpointHosting">Endpoint Hosting</label>
              <input
                type="text"
                id="endpointHosting"
                name="endpointHosting"
                value={formData.endpointHosting}
                onChange={handleInputChange}
                placeholder="e.g., AWS, GCP, Azure, Self-hosted"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Payout & Monetization</h3>
            <div className="form-group">
              <label htmlFor="walletAddress">Wallet Address</label>
              <input
                type="text"
                id="walletAddress"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                placeholder="Crypto wallet address"
              />
            </div>

            <div className="form-group">
              <label>Bank Account</label>
              <div className="bank-account-fields">
                <input
                  type="text"
                  placeholder="Account Name"
                  value={formData.bankAccount?.accountName || ''}
                  onChange={(e) => handleBankAccountChange('accountName', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Account Number"
                  value={formData.bankAccount?.accountNumber || ''}
                  onChange={(e) => handleBankAccountChange('accountNumber', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Bank Code"
                  value={formData.bankAccount?.bankCode || ''}
                  onChange={(e) => handleBankAccountChange('bankCode', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="preferredCurrency">Preferred Currency</label>
              <select
                id="preferredCurrency"
                name="preferredCurrency"
                value={formData.preferredCurrency}
                onChange={handleInputChange}
              >
                <option value="">Select currency</option>
                <option value="USD">USD</option>
                <option value="NGN">NGN</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Your country"
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxId">Tax ID</label>
              <input
                type="text"
                id="taxId"
                name="taxId"
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder="Tax identification number"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-button" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

