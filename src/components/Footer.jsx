import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const [terms, setTerms] = useState([]);

  useEffect(() => {
    // Fetch terms for footer links
    fetch(`${API_BASE_URL}/api/categories/terms`)
      .then(res => {
        if (res.ok) return res.json();
        return [];
      })
      .then(data => setTerms(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        {/* About column */}
        <div>
          <div className="footer-logo"><span>SmartCart</span>Mobiles</div>
          <p className="footer-desc">
            Your destination for premium smartphones from Apple, Samsung, Vivo, Oppo, and Realme. Experience state-of-the-art tech and quality services.
          </p>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={20} className="text-primary" />
            <span>100% Secure Checkout</span>
          </div>
        </div>

        {/* Links column */}
        <div>
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop Products</Link></li>
            <li><Link to="/cart">View Cart</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        {/* Policies column */}
        <div>
          <h3 className="footer-title">Policies</h3>
          <ul className="footer-links">
            {terms.map((term) => (
              <li key={term._id}>
                <Link to={`/terms#${term.term_link}`}>{term.term_title}</Link>
              </li>
            ))}
            {terms.length === 0 && (
              <>
                <li><Link to="/terms#termLink">Terms & Conditions</Link></li>
                <li><Link to="/terms#refundLink">Refund Policy</Link></li>
                <li><Link to="/terms#promoTermConditions">Promo Conditions</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Contact column */}
        <div>
          <h3 className="footer-title">Get In Touch</h3>
          <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Phone size={16} />
              <span>+91 94080 90310</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Mail size={16} />
              <span>premkardani2006@gmail.com</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <MapPin size={16} />
              <span>Gujarat, India</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>&copy; {new Date().getFullYear()} SmartCart Mobiles. All Rights Reserved. Powered by MERN Stack.</p>
      </div>
    </footer>
  );
};
