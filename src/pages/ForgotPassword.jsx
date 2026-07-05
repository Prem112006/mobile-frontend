import { API_BASE_URL } from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: request code, 2: reset password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sandboxOtp, setSandboxOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Verification code has been generated. Please check below.');
        if (data.otp) {
          setSandboxOtp(data.otp);
        }
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
        setStep(2);
      } else {
        setError(data.message || 'Failed to generate verification code.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Password updated successfully! Redirecting to Sign In...');
        setSandboxOtp('');
        setPreviewUrl('');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto', padding: '0 1rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          <ArrowLeft size={18} /> Back to Sign In
        </Link>
      </div>

      <div className="card" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', background: 'var(--card-bg)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '50%', display: 'inline-flex' }}>
            {step === 1 ? <Mail size={32} /> : <KeyRound size={32} />}
          </div>
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
          {step === 1 ? 'Forgot Password?' : 'Reset Password'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: '1.5' }}>
          {step === 1 
            ? 'Enter your registered email below, and we will generate a verification code to reset your password.'
            : 'Enter the 6-digit verification code and your new password below.'}
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.88rem' }}>
            {success}
          </div>
        )}

        {sandboxOtp && (
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600 }}>Sandbox Mode Notification:</span>
            <span>Your 6-digit verification OTP code is: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--text-primary)' }}>{sandboxOtp}</strong></span>
            {previewUrl && (
              <span style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                📧 <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Open Sent Email Inbox Preview</a>
              </span>
            )}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                autoComplete="email"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              {loading ? 'Sending Request...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="token">Verification Code (6-Digit OTP)</label>
              <input
                id="token"
                type="text"
                className="form-input"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                required
                placeholder="e.g. 123456"
                maxLength={6}
                pattern="\d{6}"
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 600 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 600 }}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
