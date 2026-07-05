import { API_BASE_URL } from '../config';
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export const ProductCard = ({ product, showAddToCart = true }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const isSale = product.product_label === 'sale';
  const price = isSale ? product.product_sale : product.product_price;
  const originalPrice = product.product_price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout?action=change_address', {
      state: {
        buyNowItem: {
          productId: product,
          qty: 1,
          size: ''
        }
      }
    });
  };

  const imageSrc = product.product_img1.startsWith('http')
    ? product.product_img1
    : `${API_BASE_URL}/uploads/${product.product_img1}`;

  return (
    <div className="card product-card">
      <Link to={`/product/${product.product_url}`} style={{ display: 'block', height: '100%' }}>
        <div className="product-card-img-wrapper">
          <img
            src={imageSrc}
            alt={product.product_title}
            className="product-card-img"
          />
          {product.product_label && (
            <span className={`product-badge ${product.product_label}`}>
              {product.product_label}
            </span>
          )}
        </div>

        <h3 className="product-card-title">{product.product_title}</h3>

        <div className="product-card-price-row" style={!showAddToCart ? { marginBottom: 0 } : {}}>
          <span className="price-actual">₹{price.toLocaleString('en-IN')}</span>
          {isSale && (
            <span className="price-old">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {showAddToCart && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
            <button
              onClick={handleAddToCart}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.5rem' }}
            >
              <ShoppingCart size={13} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="btn btn-accent btn-sm"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.5rem' }}
            >
              Buy Now
            </button>
          </div>
        )}
      </Link>
    </div>
  );
};
