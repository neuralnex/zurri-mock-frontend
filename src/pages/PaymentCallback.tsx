import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { walletService } from '../services/walletService';
import { useAuth } from '../contexts/AuthContext';
import './PaymentCallback.css';

export const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reference = searchParams.get('reference') || '';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (reference) {
      verifyPayment();
    } else {
      setError('Payment reference missing');
      setVerifying(false);
    }
  }, [reference, isAuthenticated]);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const result = await walletService.verifyTransaction(reference);
      if (result.success) {
        // Redirect to wallet page after a short delay
        setTimeout(() => {
          navigate('/wallet');
        }, 3000);
      } else {
        setError('Payment verification failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const points = searchParams.get('points');
  const balance = searchParams.get('balance');
  const amount = searchParams.get('amount');

  return (
    <div className="payment-callback">
      <div className="payment-card success">
        <div className="payment-icon">✓</div>
        <h1>Payment Successful!</h1>
        {verifying ? (
          <p>Verifying your payment...</p>
        ) : error ? (
          <>
            <p className="error-text">{error}</p>
            <button onClick={() => navigate('/wallet')} className="primary-button">
              Go to Wallet
            </button>
          </>
        ) : (
          <>
            <div className="payment-details">
              {points && <p>Points added: <strong>{points}</strong></p>}
              {balance && <p>New balance: <strong>{balance} points</strong></p>}
              {amount && <p>Amount paid: <strong>₦{parseInt(amount).toLocaleString()}</strong></p>}
            </div>
            <p className="redirect-message">Redirecting to wallet...</p>
            <button onClick={() => navigate('/wallet')} className="primary-button">
              Go to Wallet Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const error = searchParams.get('error');
  const reference = searchParams.get('reference');
  const status = searchParams.get('status');
  const message = searchParams.get('message');

  return (
    <div className="payment-callback">
      <div className="payment-card failed">
        <div className="payment-icon">✗</div>
        <h1>Payment Failed</h1>
        {error && <p className="error-text">{error}</p>}
        {message && <p className="error-text">{decodeURIComponent(message)}</p>}
        {status && <p>Status: {status}</p>}
        {reference && <p className="reference">Reference: {reference}</p>}
        <div className="payment-actions">
          <button onClick={() => navigate('/wallet')} className="primary-button">
            Try Again
          </button>
          <button onClick={() => navigate('/')} className="secondary-button">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

