import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    // Load IDs from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistIds(savedWishlist);
  }, []);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Fetch all products (limit high to ensure we get all wishlisted items)
    fetch(`${API_BASE_URL}/api/products?limit=100`)
      .then(res => res.json())
      .then(data => {
        const allProducts = data.products || [];
        // Filter products that are in the wishlist
        const wishlistedProducts = allProducts.filter(p => wishlistIds.includes(p._id));
        setProducts(wishlistedProducts);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  const handleRemoveFromWishlist = (productId) => {
    const updatedIds = wishlistIds.filter(id => id !== productId);
    setWishlistIds(updatedIds);
    localStorage.setItem('wishlist', JSON.stringify(updatedIds));
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0' }}>
          <Heart size={32} fill="var(--danger)" color="var(--danger)" />
          <span>My Wishlist</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Your favorite smartphones kept in one place.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
          Loading your favorites list...
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <Heart size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', opacity: 0.3 }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You haven't liked any smartphones yet. Start exploring our catalog to build your collection!</p>
          <Link to="/shop" className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '30px' }}>Explore Shop</Link>
        </div>
      ) : (
        <div className="grid-3" style={{ marginBottom: '3rem' }}>
          {products.map((product) => (
            <div key={product._id} style={{ position: 'relative' }}>
              <ProductCard product={product} />
              {/* Overlay close button to remove from wishlist */}
              <button
                onClick={() => handleRemoveFromWishlist(product._id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  fontSize: '1.2rem',
                  lineHeight: 0,
                  transition: 'all 0.2s'
                }}
                title="Remove from wishlist"
                aria-label="Remove from wishlist"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
