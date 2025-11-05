import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import './Register.css';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerType, setRegisterType] = useState<'user' | 'creator' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegisterType = (type: 'user' | 'creator') => {
    setRegisterType(type);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerType) {
      setError('Please select registration type');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name || undefined);
      
      // If registering as creator, redirect to profile setup
      if (registerType === 'creator') {
        navigate('/creator-profile');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Zurri</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        
        {!registerType ? (
          <div className="register-type-selection">
            <p className="register-type-label">Choose your registration type:</p>
            <div className="register-type-buttons">
              <button
                type="button"
                onClick={() => handleRegisterType('user')}
                className="register-type-button user-button"
              >
                <div className="register-type-icon">👤</div>
                <div className="register-type-title">User</div>
                <div className="register-type-description">Browse and use agents</div>
              </button>
              <button
                type="button"
                onClick={() => handleRegisterType('creator')}
                className="register-type-button creator-button"
              >
                <div className="register-type-icon">🎨</div>
                <div className="register-type-title">Creator</div>
                <div className="register-type-description">Create and manage agents</div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="register-type-badge">
              Registering as: <strong>{registerType === 'creator' ? 'Creator' : 'User'}</strong>
              <button
                type="button"
                onClick={() => setRegisterType(null)}
                className="change-type-button"
              >
                Change
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="name">Name (optional)</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <small>Password must be at least 8 characters</small>
            </div>
            <button type="submit" disabled={loading} className="primary-button">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

