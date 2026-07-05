import { API_BASE_URL } from '../config';
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Eye, EyeOff, Globe } from 'lucide-react';
import { GoogleSandboxModal } from './GoogleSandboxModal';

const loadGoogleScript = (callback) => {
  if (window.google) {
    callback();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    callback();
  };
  document.body.appendChild(script);
};

export const AuthModal = () => {
  const { authModalOpen, authModalType, closeAuthModal, setAuthModalType, loginUser, googleClientId } = useContext(AuthContext);
  console.log('AuthModal render state:', { authModalOpen, authModalType });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newsConsent, setNewsConsent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [otpToken, setOtpToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [googleOpen, setGoogleOpen] = useState(false);

  const handleGoogleLoginSuccess = async (response) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok) {
        loginUser(data);
        closeAuthModal();
        resetForm();
      } else {
        setError(data.message || 'Google Sign-In failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authModalOpen && googleClientId) {
      loadGoogleScript(() => {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLoginSuccess
          });
          const btnEl = document.getElementById("google-signin-button-modal");
          if (btnEl) {
            btnEl.innerHTML = '';
            window.google.accounts.id.renderButton(
              btnEl,
              { theme: "outline", size: "large", width: "370" }
            );
          }
        } catch (err) {
          console.error("Error rendering Google button in modal:", err);
        }
      });
    }
  }, [authModalOpen, googleClientId]);

  const handleForgotSubmit = async (e) => {
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
        setSuccess('Verification code generated successfully.');
        if (data.otp) {
          setSandboxOtp(data.otp);
        }
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
        setForgotStep(2);
      } else {
        setError(data.message || 'Failed to generate code.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otpToken, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Password reset successful! Switching back to login...');
        setSandboxOtp('');
        setTimeout(() => {
          setAuthModalType('login');
          resetForm();
        }, 2000);
      } else {
        setError(data.message || 'Password reset failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  if (!authModalOpen) return null;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.requireOtp) {
          setAuthModalType('login-otp');
          if (data.otp) setSandboxOtp(data.otp);
          if (data.previewUrl) setPreviewUrl(data.previewUrl);
        } else {
          loginUser(data);
          closeAuthModal();
          resetForm();
        }
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otpToken })
      });

      const data = await res.json();
      if (res.ok) {
        loginUser(data);
        closeAuthModal();
        resetForm();
      } else {
        setError(data.message || 'Invalid or expired verification code');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const name = `${firstName} ${lastName}`.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await res.json();
      if (res.ok) {
        loginUser(data);
        closeAuthModal();
        resetForm();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setShowPassword(false);
    setForgotStep(1);
    setOtpToken('');
    setNewPassword('');
    setConfirmPassword('');
    setSandboxOtp('');
    setSuccess('');
    setPreviewUrl('');
    setGoogleOpen(false);
  };

  const isLogin = authModalType === 'login';

  return (
    <div className="modal-backdrop" onClick={closeAuthModal} style={{ zIndex: 1000 }}>
      <div
        className="modal-body auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          color: '#1f2937',
          padding: '2.5rem',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          position: 'relative'
        }}
      >
        <button
          onClick={closeAuthModal}
          className="modal-close"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {authModalType === 'login-otp' ? (
          /* LOGIN OTP VERIFICATION FORM */
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: '#111827' }}>
              Verify identity
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Enter the 6-digit OTP code sent to your email.
            </p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {sandboxOtp && (
              <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fef3c7', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <span style={{ fontWeight: 600 }}>Sandbox Mode Notification:</span>
                <span>Your 6-digit login OTP code is: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#111827' }}>{sandboxOtp}</strong></span>
                {previewUrl && (
                  <span style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    📧 <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Open Sent Email Inbox Preview</a>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleVerifyLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem', letterSpacing: '2px', textAlign: 'center' }}
                placeholder="6-digit Code"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.trim())}
                required
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Log In'}
              </button>

              <button
                type="button"
                onClick={() => { setAuthModalType('login'); resetForm(); }}
                style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.5rem', alignSelf: 'center' }}
              >
                Back to Credentials
              </button>
            </form>
          </div>
        ) : authModalType === 'forgot' ? (
          /* FORGOT PASSWORD FORM */
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: '#111827' }}>
              {forgotStep === 1 ? 'Forgot password' : 'Reset password'}
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {forgotStep === 1 
                ? 'Enter your email to request a reset code' 
                : 'Enter the verification code & new password'}
            </p>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>
              Remembered your password?{' '}
              <button
                onClick={() => { setAuthModalType('login'); resetForm(); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: 'inherit' }}
              >
                Sign In
              </button>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #d1fae5', fontSize: '0.85rem' }}>
                {success}
              </div>
            )}

            {sandboxOtp && (
              <div style={{ backgroundColor: '#fffbeb', color: '#d97706', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fef3c7', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <span style={{ fontWeight: 600 }}>Sandbox Mode Notification:</span>
                <span>Your 6-digit verification OTP code is: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: '#111827' }}>{sandboxOtp}</strong></span>
                {previewUrl && (
                  <span style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    📧 <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Open Sent Email Inbox Preview</a>
                  </span>
                )}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.2s'
                  }}
                >
                  {loading ? 'Sending code...' : 'Send reset code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem', letterSpacing: '2px', textAlign: 'center' }}
                  placeholder="6-digit Code"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.trim())}
                  required
                />
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem', width: '100%', paddingRight: '2.5rem' }}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.2s'
                  }}
                >
                  {loading ? 'Resetting password...' : 'Reset password'}
                </button>
              </form>
            )}
          </div>
        ) : isLogin ? (
          /* LOGIN FORM */
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: '#111827' }}>
              Sign in
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Get access to more learning features
            </p>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#4b5563', marginBottom: '1.5rem' }}>
              Don't have an account?{' '}
              <button
                onClick={() => { setAuthModalType('register'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: 'inherit' }}
              >
                Register
              </button>
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {/* Google */}
              {googleClientId ? (
                <div style={{ width: '56px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div id="google-signin-button-modal"></div>
                </div>
              ) : (
                <button onClick={() => setGoogleOpen(true)} style={{ width: '56px', height: '42px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', cursor: 'pointer' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.62z"/><path fill="#FBBC05" d="M5.24 14.81c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.42C.5 9.2 0 11.19 0 13.27s.5 4.07 1.39 5.85l3.85-3.31z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51L1.39 17.1C3.37 21.01 7.35 23 12 23z"/></svg>
                </button>
              )}
              {/* Facebook */}
              <button style={{ width: '56px', height: '42px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              {/* Github */}
              <button style={{ width: '56px', height: '42px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#181717"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              </button>
              {/* Other/Globe */}
              <button style={{ width: '56px', height: '42px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', cursor: 'pointer', color: '#4b5563' }}>
                <Globe size={20} />
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ flexGrow: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span>or</span>
              <div style={{ flexGrow: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <input
                  type="email"
                  className="form-input"
                  autoComplete="off"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  autoComplete="new-password"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem', paddingRight: '2.5rem' }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ textAlign: 'left' }}>
                <button
                  type="button"
                  onClick={() => { setAuthModalType('forgot'); resetForm(); }}
                  style={{ background: 'none', border: 'none', color: '#4b5563', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Forgot your password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        ) : (
          /* REGISTER FORM */
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.25rem', color: '#111827' }}>
              Create account
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Already have an account?{' '}
              <button
                onClick={() => { setAuthModalType('login'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 500, cursor: 'pointer', fontSize: 'inherit' }}
              >
                Sign In
              </button>
            </p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #fee2e2', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <input
                  type="email"
                  className="form-input"
                  autoComplete="off"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    autoComplete="off"
                    style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    className="form-input"
                    autoComplete="off"
                    style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem' }}
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  autoComplete="new-password"
                  style={{ backgroundColor: '#f9fafb', color: '#111827', borderColor: '#d1d5db', padding: '0.75rem', paddingRight: '2.5rem' }}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Checkbox News consent */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  id="newsconsent"
                  checked={newsConsent}
                  onChange={(e) => setNewsConsent(e.target.checked)}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="newsconsent" style={{ fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
                  Email me with news and updates
                </label>
              </div>

              {/* TOS Consent text */}
              <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'left', lineHeight: '1.4' }}>
                By signing up you agree to our{' '}
                <a href="/terms#termLink" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'underline' }}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/terms#termLink" target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', textDecoration: 'underline' }}>
                  Privacy Policy
                </a>.
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>
        )}
        <GoogleSandboxModal
          isOpen={googleOpen}
          onClose={() => setGoogleOpen(false)}
          onSelect={async ({ email, name }) => {
            setGoogleOpen(false);
            setError('');
            setLoading(true);
            try {
              const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, isMock: true })
              });
              const data = await res.json();
              if (res.ok) {
                loginUser(data);
                closeAuthModal();
                resetForm();
              } else {
                setError(data.message || 'Google Sign-In failed');
              }
            } catch (err) {
              console.error(err);
              setError('Connection failed. Please try again.');
            } finally {
              setLoading(false);
            }
          }}
        />
      </div>
    </div>
  );
};
