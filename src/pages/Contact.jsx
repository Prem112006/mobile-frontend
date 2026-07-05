import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2.5rem', textAlign: 'center' }}>
        Contact Our Helpline
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem' }}>
        {/* Contact details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Head Office
            </h3>
            
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={18} className="text-primary" />
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Helpline</span>
                  <strong>+91 94080 90310</strong>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={18} className="text-primary" />
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</span>
                  <strong>premkardani2006@gmail.com</strong>
                </div>
              </li>

              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <MapPin size={18} className="text-primary" />
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location</span>
                  <strong>Gujarat, India</strong>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            Send Us a Message
          </h3>

          {success && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.9rem' }}>
              Your message has been sent successfully. We will get back to you shortly!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
              <div className="form-group">
                <label htmlFor="cname">Your Name</label>
                <input
                  id="cname"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cemail">Email Address</label>
                <input
                  id="cemail"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. john@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="csub">Subject</label>
              <input
                id="csub"
                type="text"
                className="form-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="How can we help?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cmsg">Message Body</label>
              <textarea
                id="cmsg"
                className="form-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your message details..."
                style={{ minHeight: '120px', resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
