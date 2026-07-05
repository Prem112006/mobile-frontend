import { API_BASE_URL } from '../config';
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export const Cart = () => {
  const { cartItems, updateQty, removeFromCart, getSubtotal, getDiscount, getTotal, applyCoupon, coupon } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState({ success: false, text: '' });
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const result = await applyCoupon(couponCode);
    if (result.success) {
      setCouponMsg({ success: true, text: `Coupon applied: ₹${result.discount} off!` });
    } else {
      setCouponMsg({ success: false, text: result.message || 'Failed' });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 2rem', animation: 'fadeIn 0.5s ease-out' }}>
        <ShoppingBag size={64} style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '1rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Looks like you haven't added any products to your cart yet.
        </p>
        <Link to="/shop" className="btn btn-primary">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Your Shopping Cart</h2>

      <div className="cart-grid">
        {/* Cart Items list */}
        <div>
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const isSale = product.product_label === 'sale';
              const price = isSale ? product.product_sale : product.product_price;
              const imgUrl = product.product_img1.startsWith('http')
                ? product.product_img1
                : `${API_BASE_URL}/uploads/${product.product_img1}`;

              return (
                <div key={`${product._id}-${item.size}`} className="cart-item">
                  <img src={imgUrl} alt={product.product_title} className="cart-item-img" />
                  
                  <div className="cart-item-info">
                    <h3 className="cart-item-title">
                      <Link to={`/product/${product.product_url}`}>{product.product_title}</Link>
                    </h3>
                    <p className="cart-item-meta">
                      Size/Specs: {item.size || 'Default'}
                    </p>
                    <p className="cart-item-meta">
                      Price: ₹{price.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Quantity control */}
                  <div className="cart-qty-control">
                    <button
                      onClick={() => updateQty(product._id, item.qty - 1, item.size)}
                      className="cart-qty-btn"
                    >
                      -
                    </button>
                    <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(product._id, item.qty + 1, item.size)}
                      className="cart-qty-btn"
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total Price */}
                  <div className="cart-item-price">
                    ₹{(price * item.qty).toLocaleString('en-IN')}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(product._id, item.size)}
                    className="btn btn-secondary btn-sm"
                    style={{ border: 'none', background: 'none', color: 'var(--danger)' }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>

        {/* Cart Summary */}
        <div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Order Summary
            </h3>

            {/* Coupons form */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Apply Coupon Code</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{ padding: '0.5rem' }}
                />
                <button type="submit" className="btn btn-primary btn-sm">Apply</button>
              </div>
              {couponMsg.text && (
                <span style={{ fontSize: '0.85rem', color: couponMsg.success ? 'var(--success)' : 'var(--danger)' }}>
                  {couponMsg.text}
                </span>
              )}
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{getDiscount().toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>₹{getTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
