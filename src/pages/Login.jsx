import { API_BASE_URL } from '../config';
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleSandboxModal } from '../components/GoogleSandboxModal';

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

export const Login = () => {
  const { loginUser, user, googleClientId } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpToken, setOtpToken] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [googleOpen, setGoogleOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect') || '';

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
    if (googleClientId) {
      loadGoogleScript(() => {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleLoginSuccess
          });
          const btnEl = document.getElementById("google-signin-button-login");
          if (btnEl) {
            btnEl.innerHTML = '';
            window.google.accounts.id.renderButton(
              btnEl,
              { theme: "outline", size: "large", width: "400" }
            );
          }
        } catch (err) {
          console.error("Error rendering Google button:", err);
        }
      });
    }
  }, [googleClientId]);

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      navigate(redirect ? `/${redirect}` : '/');
    }
  }, [user, redirect, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 'credentials') {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          if (data.requireOtp) {
            setStep('otp');
            if (data.otp) setSandboxOtp(data.otp);
            if (data.previewUrl) setPreviewUrl(data.previewUrl);
          } else {
            loginUser(data);
          }
        } else {
          setError(data.message || 'Invalid email or password');
        }
      } else {
        // Step is 'otp'
        const res = await fetch(`${API_BASE_URL}/api/auth/verify-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, token: otpToken })
        });

        const data = await res.json();

        if (res.ok) {
          loginUser(data);
        } else {
          setError(data.message || 'Invalid or expired verification code');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '4rem auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>
          Customer Sign In
        </h2>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>Forgot Password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password"
                  autoComplete="new-password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '1.25rem 0' }}>
              <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span>or</span>
              <div style={{ flexGrow: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            {googleClientId ? (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <div id="google-signin-button-login" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setGoogleOpen(true)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  backgroundColor: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.7 3.4-4.51 6.76-4.51z"/><path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-2 3.73-4.94 3.73-8.62z"/><path fill="#FBBC05" d="M5.24 14.81c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.39 7.42C.5 9.2 0 11.19 0 13.27s.5 4.07 1.39 5.85l3.85-3.31z"/><path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.36 0-5.86-1.81-6.76-4.51L1.39 17.1C3.37 21.01 7.35 23 12 23z"/></svg>
                Continue with Google
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {sandboxOtp && (
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent)', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <span style={{ fontWeight: 600 }}>Sandbox Mode Notification:</span>
                <span>Your 6-digit login OTP code is: <strong style={{ fontSize: '1.1rem', letterSpacing: '2px', color: 'var(--text-primary)' }}>{sandboxOtp}</strong></span>
                {previewUrl && (
                  <span style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    📧 <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: 600 }}>Open Sent Email Inbox Preview</a>
                  </span>
                )}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="otp">Verification Code (6-Digit OTP)</label>
              <input
                id="otp"
                type="text"
                className="form-input"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.trim())}
                required
                placeholder="e.g. 123456"
                maxLength={6}
                pattern="\d{6}"
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 600 }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontWeight: 600 }}>
              {loading ? 'Verifying...' : 'Verify & Log In'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setSandboxOtp(''); setPreviewUrl(''); setOtpToken(''); setError(''); }}
              style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '1.25rem', fontSize: '0.9rem' }}
            >
              Back to Credentials
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register Here</Link>
        </div>

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
