import React, { useState } from 'react';
import { X, UserPlus, ArrowLeft } from 'lucide-react';

export const GoogleSandboxModal = ({ isOpen, onClose, onSelect }) => {
  const [customMode, setCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const mockAccounts = [
    { name: 'Jane Doe', email: 'jane.doe@gmail.com', avatarColor: '#ea4335' },
    { name: 'Alex Smith', email: 'alex.smith@gmail.com', avatarColor: '#4285f4' },
    { name: 'Developer Test', email: 'dev.smartcart@gmail.com', avatarColor: '#34a853' }
  ];

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customEmail.endsWith('@gmail.com') && !customEmail.includes('@')) {
      return setError('Please enter a valid email address');
    }

    const name = customName || customEmail.split('@')[0];
    onSelect({ email: customEmail, name });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      animation: 'fadeIn 0.3s ease-out'
    }} onClick={onClose}>
      
      <div style={{
        width: '400px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        borderRadius: '16px',
        padding: '2.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        animation: 'scaleIn 0.3s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          background: 'none',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer'
        }}>
          <X size={20} />
        </button>

        {/* Google Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" style={{ marginBottom: '0.75rem' }}>
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.529a5.99 5.99 0 0 1 5.99-5.991c2.32 0 4.397 1.3 5.437 3.321l3.52-2.736C20.59 3.535 16.59 1.5 12 1.5 5.648 1.5.5 6.649.5 13s5.148 11.5 11.5 11.5c6.26 0 11.66-4.52 11.66-11.5 0-.81-.07-1.59-.2-2.34H12.24z"/>
          </svg>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>Sign in with Google</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>to continue to SmartCart Mobiles (Sandbox)</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #fee2e2' }}>
            {error}
          </div>
        )}

        {!customMode ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mockAccounts.map((acc, index) => (
                <button
                  key={index}
                  onClick={() => onSelect({ email: acc.email, name: acc.name })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: acc.avatarColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    {acc.name[0]}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#374151' }}>{acc.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{acc.email}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setCustomMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                marginTop: '1.25rem',
                padding: '0.85rem',
                border: '1px dashed #cbd5e1',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: '#4b5563',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
                e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#4b5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <UserPlus size={18} />
              Use another mock account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="mockEmail" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#4b5563' }}>Mock Google Email</label>
              <input
                id="mockEmail"
                type="email"
                required
                className="form-input"
                style={{ padding: '0.75rem', borderColor: '#cbd5e1', color: '#1f2937', backgroundColor: '#f9fafb' }}
                placeholder="e.g. yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label htmlFor="mockName" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#4b5563' }}>Mock Name (Optional)</label>
              <input
                id="mockName"
                type="text"
                className="form-input"
                style={{ padding: '0.75rem', borderColor: '#cbd5e1', color: '#1f2937', backgroundColor: '#f9fafb' }}
                placeholder="e.g. John Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>

            <button type="submit" style={{
              width: '100%',
              padding: '0.85rem',
              backgroundColor: '#4285f4',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              marginTop: '0.5rem',
              transition: 'background 0.2s'
            }}>
              Continue
            </button>

            <button
              type="button"
              onClick={() => { setCustomMode(false); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} /> Back to mock accounts
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
