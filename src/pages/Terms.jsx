import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const Terms = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories/terms`)
      .then(res => res.json())
      .then(data => {
        setTerms(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Auto scroll to hash section if present in location
  useEffect(() => {
    if (!loading && location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading, location.hash]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2.5rem', textAlign: 'center' }}>
        Store Terms & Policies
      </h2>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
          Loading policies...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {terms.map((term) => (
            <div key={term._id} id={term.term_link} className="card" style={{ scrollMarginTop: '100px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {term.term_title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {term.term_desc}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
