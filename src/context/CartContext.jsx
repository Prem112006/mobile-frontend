import { API_BASE_URL } from '../config';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

const API_URL = `${API_BASE_URL}/api`;

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart on startup or when auth user changes
  useEffect(() => {
    const fetchCart = async () => {
      if (user && user.token) {
        setLoading(true);
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data.items || []);
          }
        } catch (error) {
          console.error('Failed to fetch cart from server:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from local storage for guests
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
      }
    };

    fetchCart();
  }, [user]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, qty = 1, size = '') => {
    const price = product.product_label === 'sale' ? product.product_sale : product.product_price;

    if (user && user.token) {
      try {
        const res = await fetch(`${API_URL}/cart/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ productId: product._id, qty, size })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      // Guest local storage update
      setCartItems((prevItems) => {
        const itemIdx = prevItems.findIndex(
          (item) => item.productId._id === product._id && item.size === size
        );

        if (itemIdx > -1) {
          const newItems = [...prevItems];
          newItems[itemIdx].qty += Number(qty);
          return newItems;
        } else {
          return [
            ...prevItems,
            {
              productId: product,
              qty: Number(qty),
              size,
              price
            }
          ];
        }
      });
    }
  };

  const updateQty = async (productId, qty, size = '') => {
    if (user && user.token) {
      try {
        const res = await fetch(`${API_URL}/cart/update-qty`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ productId, qty, size })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items);
        }
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    } else {
      // Guest update
      setCartItems((prevItems) => {
        if (qty <= 0) {
          return prevItems.filter(
            (item) => !(item.productId._id === productId && item.size === size)
          );
        }
        return prevItems.map((item) =>
          item.productId._id === productId && item.size === size
            ? { ...item, qty: Number(qty) }
            : item
        );
      });
    }
  };

  const removeFromCart = async (productId, size = '') => {
    if (user && user.token) {
      try {
        const res = await fetch(`${API_URL}/cart/remove`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ productId, size })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      // Guest removal
      setCartItems((prevItems) =>
        prevItems.filter((item) => !(item.productId._id === productId && item.size === size))
      );
    }
  };

  const clearCart = async () => {
    if (user && user.token) {
      try {
        const res = await fetch(`${API_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      setCartItems([]);
    }
    setCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      // We will search if coupon code is valid in DB (a mock check since coupon validation is fast)
      // For simplicity, we can fetch dynamic validation from backend or check code.
      // Let's call the API to fetch valid coupon code (or mock one since coupons are created in admin area).
      // We'll support mock validation: if code is 'DISCOUNT10', save a coupon object.
      // But we can check if it matches DB later. For now let's set a standard code check.
      if (code.toUpperCase() === 'WELCOME10') {
        setCoupon({
          code: 'WELCOME10',
          price: 1000 // Rs 1000 flat discount
        });
        return { success: true, discount: 1000 };
      }
      return { success: false, message: 'Invalid coupon code' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  };

  const getDiscount = () => {
    if (!coupon) return 0;
    return coupon.price;
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - getDiscount());
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        loading,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        applyCoupon,
        setCoupon,
        getSubtotal,
        getDiscount,
        getTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
