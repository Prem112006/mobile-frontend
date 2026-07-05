import { API_BASE_URL } from '../config';
import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, MapPin, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export const Checkout = () => {
  const { cartItems, getTotal, coupon, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const navigate = useNavigate();
  const isSubmitting = useRef(false);
  const [checkoutStep, setCheckoutStep] = useState('payment_selection'); // 'payment_selection' | 'order_review'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null); // 'COD' | 'Online'
  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem || null;

  const [profileLoading, setProfileLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [editingId, setEditingId] = useState(null); // null if adding new
  const [showForm, setShowForm] = useState(false);

  const queryParams = new URLSearchParams(window.location.search);
  const isChangeAction = queryParams.get('action') === 'change_address';

  // Load profile and addresses
  useEffect(() => {
    if (user && user.token) {
      setProfileLoading(true);
      fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(profileData => {
          // Check local storage for addresses
          const storageKey = `shipping_addresses_${user.email}`;
          let savedAddresses = JSON.parse(localStorage.getItem(storageKey) || '[]');
          
          if (savedAddresses.length === 0) {
            // Seed with customer's default profile address
            const defaultAddress = {
              id: 'addr_' + Math.floor(Math.random() * 1000000),
              name: profileData.customers_name || user.name,
              address: profileData.customers_address || '',
              city: profileData.customers_city || '',
              country: profileData.customers_country || '',
              contact: profileData.customers_contact || '',
              isDefault: true
            };
            savedAddresses = [defaultAddress];
            localStorage.setItem(storageKey, JSON.stringify(savedAddresses));
          }

          setAddresses(savedAddresses);
          
          // Set active selected address: the default one
          const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
          setSelectedAddress(defaultAddr);

          // Open change address view if action is specified
          if (isChangeAction) {
            setShowChangeModal(true);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setProfileLoading(false));
    }
  }, [user, isChangeAction]);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!formName || !formAddress || !formCity || !formCountry || !formContact) {
      alert('Please fill out all address fields.');
      return;
    }

    const storageKey = `shipping_addresses_${user.email}`;
    let updatedAddresses = [...addresses];

    if (editingId) {
      // Edit existing
      updatedAddresses = updatedAddresses.map(addr => {
        if (addr.id === editingId) {
          return {
            ...addr,
            name: formName,
            address: formAddress,
            city: formCity,
            country: formCountry,
            contact: formContact,
            isDefault: formIsDefault ? true : addr.isDefault
          };
        }
        return addr;
      });
    } else {
      // Add new
      const newAddr = {
        id: 'addr_' + Math.floor(Math.random() * 1000000),
        name: formName,
        address: formAddress,
        city: formCity,
        country: formCountry,
        contact: formContact,
        isDefault: formIsDefault
      };
      updatedAddresses.push(newAddr);
    }

    // If this address is set as default, remove default flag from others
    if (formIsDefault || (updatedAddresses.length === 1)) {
      const targetId = editingId || updatedAddresses[updatedAddresses.length - 1].id;
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === targetId
      }));
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedAddresses));
    setAddresses(updatedAddresses);

    // Update active selected address if it was edited/newly created default
    if (editingId) {
      const edited = updatedAddresses.find(a => a.id === editingId);
      if (selectedAddress.id === editingId || formIsDefault) {
        setSelectedAddress(edited);
      }
    } else if (formIsDefault) {
      setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]);
    }

    resetForm();
  };

  const handleMakeDefault = (addrId) => {
    const storageKey = `shipping_addresses_${user.email}`;
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addrId
    }));
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setAddresses(updated);
    const newDefault = updated.find(a => a.id === addrId);
    setSelectedAddress(newDefault);
  };

  const handleDeleteAddress = (addrId) => {
    if (addresses.length <= 1) {
      alert('You must have at least one shipping address.');
      return;
    }
    const target = addresses.find(a => a.id === addrId);
    if (target.isDefault) {
      alert('You cannot delete your default address. Set another address as default first.');
      return;
    }

    const storageKey = `shipping_addresses_${user.email}`;
    const updated = addresses.filter(addr => addr.id !== addrId);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setAddresses(updated);

    if (selectedAddress.id === addrId) {
      setSelectedAddress(updated.find(a => a.isDefault) || updated[0]);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingId(addr.id);
    setFormName(addr.name);
    setFormAddress(addr.address);
    setFormCity(addr.city);
    setFormCountry(addr.country);
    setFormContact(addr.contact);
    setFormIsDefault(addr.isDefault);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormAddress('');
    setFormCity('');
    setFormCountry('');
    setFormContact('');
    setFormIsDefault(false);
    setShowForm(false);
  };

  const getDeliveryEstimate = (address) => {
    if (!address || !address.city) {
      return { days: 4, label: 'Standard Shipping', dateString: '' };
    }
    const city = address.city.toLowerCase().trim();
    const country = address.country ? address.country.toLowerCase().trim() : 'india';

    let days = 4;
    let label = 'Standard Shipping';

    if (country !== 'india' && country !== 'in') {
      days = 8;
      label = 'International Shipping';
    } else if (
      city.includes('mumbai') ||
      city.includes('delhi') ||
      city.includes('bangalore') ||
      city.includes('bengaluru') ||
      city.includes('chennai') ||
      city.includes('kolkata') ||
      city.includes('hyderabad') ||
      city.includes('pune')
    ) {
      days = 2;
      label = 'Express Delivery';
    } else {
      days = 4;
      label = 'Standard Shipping';
    }

    const date = new Date();
    date.setDate(date.getDate() + days);

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    return {
      days,
      label,
      dateString
    };
  };

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // If no user, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=checkout');
    }
  }, [user, navigate]);

  // If cart is empty and order not placed yet, redirect to cart page (ignore if Buy Now checkout)
  useEffect(() => {
    if (user && cartItems.length === 0 && !successOrder && !buyNowItem) {
      navigate('/cart');
    }
  }, [cartItems, navigate, successOrder, user, buyNowItem]);

  const getSubtotal = () => {
    if (buyNowItem) {
      const product = buyNowItem.productId;
      const price = product.product_label === 'sale' ? product.product_sale : product.product_price;
      return price * buyNowItem.qty;
    }
    return cartItems.reduce((acc, item) => {
      const product = item.productId;
      if (!product) return acc;
      const price = product.product_label === 'sale' ? product.product_sale : product.product_price;
      return acc + price * item.qty;
    }, 0);
  };

  const subTotal = getSubtotal();
  const taxAmount = Math.round(subTotal * 0.18);
  const discount = coupon ? 1000 : 0;
  const totalAmount = Math.max(0, subTotal + taxAmount - discount);

  const handleCODCheckout = async () => {
    if (isSubmitting.current) return;
    if (!selectedAddress) {
      alert('Please select or add a shipping address.');
      return;
    }
    isSubmitting.current = true;
    setLoading(true);
    let checkoutSuccess = false;
    try {
      // Sync address to backend first
      await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          country: selectedAddress.country,
          contact: selectedAddress.contact
        })
      });

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentMode: 'COD',
          couponCode: coupon ? coupon.code : undefined,
          items: buyNowItem ? [{
            productId: buyNowItem.productId._id,
            qty: buyNowItem.qty,
            size: buyNowItem.size
          }] : undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessOrder(data.order);
        if (!buyNowItem) clearCart(); // Clear local/context cart items only if not Buy Now
        checkoutSuccess = true;
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Checkout failed. Please try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Network error. Checkout failed.');
    } finally {
      if (!checkoutSuccess) {
        setLoading(false);
        isSubmitting.current = false;
      }
    }
  };

  const handleRazorpayCheckout = async () => {
    if (isSubmitting.current) return;
    if (!selectedAddress) {
      alert('Please select or add a shipping address.');
      return;
    }
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load. Are you offline?');
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    let initializationSuccess = false;
    try {
      // Sync address to backend first
      await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: selectedAddress.name,
          address: selectedAddress.address,
          city: selectedAddress.city,
          country: selectedAddress.country,
          contact: selectedAddress.contact
        })
      });

      // 1. Create order on our backend first
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          paymentMode: 'Online',
          couponCode: coupon ? coupon.code : undefined,
          items: buyNowItem ? [{
            productId: buyNowItem.productId._id,
            qty: buyNowItem.qty,
            size: buyNowItem.size
          }] : undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || 'Failed to initialize order on server');
        setLoading(false);
        isSubmitting.current = false;
        return;
      }

      const { order } = await res.json();
      initializationSuccess = true;

      // 2. Open Razorpay payment gateway
      const options = {
        key: 'rzp_test_Zth6TBEqyhnUN9', // Test key ID from original project
        amount: order.dueAmount * 100, // in paise
        currency: 'INR',
        name: 'SmartCart Mobiles',
        description: `Order Payment for Invoice #${order.invoiceNo}`,
        image: `${API_BASE_URL}/uploads/logo.jpg`,
        handler: async function (response) {
          // 3. Confirm payment on success
          try {
            const confirmRes = await fetch(`${API_BASE_URL}/api/orders/confirm-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
              },
              body: JSON.stringify({ orderId: order._id })
            });

            if (confirmRes.ok) {
              setSuccessOrder({
                ...order,
                paymentStatus: 'Completed',
                orderStatus: 'processing'
              });
              if (!buyNowItem) clearCart();
            } else {
              alert('Payment succeeded but confirmation failed. Contact support.');
              isSubmitting.current = false;
              setLoading(false);
            }
          } catch (err) {
            console.error(err);
            alert('Error confirming payment.');
            isSubmitting.current = false;
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '9876543210'
        },
        notes: {
          address: 'SmartCart Mobiles Customer'
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            isSubmitting.current = false;
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
      alert('Checkout error');
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  if (successOrder) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
        <CheckCircle2 size={64} style={{ color: 'var(--success)', alignSelf: 'center' }} />
        <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Thank You for Your Order!</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your order has been successfully placed. We've generated invoice <strong>#{successOrder.invoiceNo}</strong>.
        </p>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.95rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Invoice Number:</span>
            <strong>#{successOrder.invoiceNo}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Payment Mode:</span>
            <span>{successOrder.paymentMode}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Status:</span>
            <span className="status-pill completed">{successOrder.orderStatus}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span>Items Subtotal:</span>
            <span>₹{(successOrder.dueAmount - (successOrder.taxAmount || 0)).toLocaleString('en-IN')}</span>
          </div>
          {successOrder.taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <span>GST (18%):</span>
              <span>₹{successOrder.taxAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontWeight: 'bold' }}>
            <span>Total Paid (incl. GST):</span>
            <span>₹{successOrder.dueAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {selectedAddress && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            textAlign: 'left'
          }}>
            <Truck size={24} style={{ color: 'var(--success)' }} />
            <div>
              <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem', display: 'block' }}>
                Estimated Delivery by {getDeliveryEstimate(selectedAddress).dateString}
              </span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Order successfully processed for delivery to {selectedAddress.city}, {selectedAddress.country}.
              </span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/account" className="btn btn-primary" style={{ flexGrow: 1 }}>
            View My Orders
          </Link>
          <Link to="/" className="btn btn-secondary">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
        Checkout & Payment
      </h2>

      {checkoutStep === 'payment_selection' ? (
        /* STEP 1 & 2: ADDRESS AND PAYMENT SELECTION */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Shipping Address Selection */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} className="text-primary" />
                <span>Shipping Address</span>
              </h3>
              {selectedAddress ? (
                <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, paddingLeft: '1.75rem' }}>
                  <strong style={{ fontSize: '1.05rem' }}>{selectedAddress.name}</strong>
                  {selectedAddress.isDefault && (
                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '0.5rem', fontWeight: 600, verticalAlign: 'middle' }}>
                      DEFAULT
                    </span>
                  )}
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {selectedAddress.address} <br />
                    {selectedAddress.city}, {selectedAddress.country} <br />
                    Phone: {selectedAddress.contact}
                  </div>
                  {/* Dynamic Delivery Estimate Row */}
                  <div style={{
                    marginTop: '0.75rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    width: 'fit-content'
                  }}>
                    <Truck size={16} className="text-primary" />
                    <span>
                      Estimated Delivery: <strong style={{ color: 'var(--primary)' }}>{getDeliveryEstimate(selectedAddress).dateString}</strong> ({getDeliveryEstimate(selectedAddress).label})
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-secondary)', paddingLeft: '1.75rem' }}>
                  No shipping address selected. Please click change/add address.
                </div>
              )}
            </div>
            <button
              onClick={() => setShowChangeModal(true)}
              className="btn btn-secondary"
              style={{ borderRadius: '30px', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              Change Address
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              Select Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Cash on Delivery option */}
              <div
                onClick={() => setSelectedPaymentMethod('COD')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: selectedPaymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: selectedPaymentMethod === 'COD' ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className="checkout-option"
              >
                <Truck size={24} style={{ color: selectedPaymentMethod === 'COD' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Cash On Delivery (COD)</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay cash when your package is delivered at home.</span>
                </div>
                {selectedPaymentMethod === 'COD' && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Online payment option */}
              <div
                onClick={() => setSelectedPaymentMethod('Online')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  border: selectedPaymentMethod === 'Online' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                  backgroundColor: selectedPaymentMethod === 'Online' ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                className="checkout-option"
              >
                <CreditCard size={24} style={{ color: selectedPaymentMethod === 'Online' ? 'var(--primary)' : 'var(--text-secondary)' }} />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Pay Online via Razorpay</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pay instantly using Credit Cards, UPI, NetBanking or Wallets.</span>
                </div>
                {selectedPaymentMethod === 'Online' && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Total Payable Amount:</span>
            <strong style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
          </div>

          {selectedPaymentMethod && (
            <button
              onClick={() => {
                if (!selectedAddress) {
                  alert('Please select or add a shipping address.');
                  return;
                }
                setCheckoutStep('order_review');
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', animation: 'slideUp 0.3s ease-out' }}
            >
              Continue to Order Review
            </button>
          )}
        </div>
      ) : (
        /* STEP 3: AMAZON STYLE ORDER REVIEW PAGE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Review and Place Order Header Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.02)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>Items Subtotal:</span>
                <span>₹{subTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span>GST (18%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              {coupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--success)' }}>
                  <span>Coupon Discount:</span>
                  <span>-₹1,000</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              disabled={loading}
              onClick={selectedPaymentMethod === 'COD' ? handleCODCheckout : handleRazorpayCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 700, background: '#f0c14b', color: '#111', border: '1px solid #a88734', boxShadow: '0 1px 0 rgba(255,255,255,.4) inset' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ddb347'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f0c14b'}
            >
              {loading ? 'Processing Order...' : selectedPaymentMethod === 'COD' ? 'Place Your Order (COD)' : 'Pay and Place Your Order'}
            </button>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'center', lineHeight: '1.4' }}>
              By placing your order, you agree to SmartCart Mobiles' terms of use and privacy conditions.
            </p>
          </div>

          {/* Items and Delivery details list */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Review Items & Delivery
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(buyNowItem ? [buyNowItem] : cartItems).map((item) => {
                const product = item.productId;
                if (!product) return null;

                const price = product.product_label === 'sale' ? product.product_sale : product.product_price;
                const imgUrl = product.product_img1.startsWith('http')
                  ? product.product_img1
                  : `${API_BASE_URL}/uploads/${product.product_img1}`;

                return (
                  <div key={`${product._id}-${item.size}`} style={{ display: 'flex', gap: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.25rem' }}>
                    <img src={imgUrl} alt={product.product_title} style={{ width: '70px', height: '90px', objectFit: 'contain', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px' }} />
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>{product.product_title}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>Specs: <strong>{item.size || 'Default'}</strong></span>
                        <span>Quantity: <strong>{item.qty}</strong></span>
                        <span style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>₹{price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Date estimate card inside review step */}
            {selectedAddress && (
              <div style={{
                marginTop: '1.5rem',
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                padding: '0.85rem 1.25rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.9rem',
                color: 'var(--text-primary)'
              }}>
                <Truck size={20} className="text-primary" />
                <div>
                  Estimated Delivery Date: <strong style={{ color: 'var(--primary)' }}>{getDeliveryEstimate(selectedAddress).dateString}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                    Standard shipping estimate for {selectedAddress.city}.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Change Details Cards at the bottom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', flexWrap: 'wrap' }} className="checkout-details-grid">
            
            {/* Delivery Address review & change */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} /> Shipping Address
                </h4>
                {selectedAddress && (
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    <strong>{selectedAddress.name}</strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.country}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setCheckoutStep('payment_selection');
                  setShowChangeModal(true);
                }}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '2px' }}
              >
                Change Delivery Address
              </button>
            </div>

            {/* Payment Method review & change */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', padding: '1.25rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CreditCard size={16} /> Payment Method
                </h4>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                  <strong>{selectedPaymentMethod === 'COD' ? 'Cash On Delivery (COD)' : 'Pay Online via Razorpay'}</strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {selectedPaymentMethod === 'COD' ? 'Pay cash at your doorstep' : 'Razorpay Cards / UPI / Wallets'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCheckoutStep('payment_selection')}
                style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Change Payment Method
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Amazon-style Shipping Address Management Modal */}
      {showChangeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.25s ease-out',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '550px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Select Delivery Address
              </h3>
              <button
                onClick={() => { setShowChangeModal(false); resetForm(); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!showForm ? (
                <>
                  {/* Address List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {addresses.map(addr => {
                      const isSelected = selectedAddress && selectedAddress.id === addr.id;
                      return (
                        <div
                          key={addr.id}
                          style={{
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255, 255, 255, 0.01)',
                            position: 'relative'
                          }}
                          onClick={() => setSelectedAddress(addr)}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <input
                              type="radio"
                              name="selected_shipping_address"
                              checked={isSelected}
                              onChange={() => setSelectedAddress(addr)}
                              style={{ marginTop: '4px', cursor: 'pointer' }}
                            />
                            <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                              <strong style={{ color: 'var(--text-primary)' }}>{addr.name}</strong>
                              {addr.isDefault && (
                                <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--primary)', color: '#fff', padding: '1px 5px', borderRadius: '4px', marginLeft: '0.5rem', fontWeight: 600 }}>
                                  Default
                                </span>
                              )}
                              <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                {addr.address} <br />
                                {addr.city}, {addr.country} <br />
                                Phone: {addr.contact}
                              </div>
                            </div>
                          </div>

                          {/* Action links */}
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingLeft: '1.75rem', fontSize: '0.85rem' }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditAddress(addr)}
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Edit2 size={12} /> Edit
                            </button>
                            {!addr.isDefault && (
                              <>
                                <button
                                  onClick={() => handleMakeDefault(addr.id)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                                >
                                  Make Default
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      borderStyle: 'dashed'
                    }}
                  >
                    <Plus size={18} /> Add New Address
                  </button>

                  <button
                    onClick={() => setShowChangeModal(false)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }}
                  >
                    Confirm & Proceed
                  </button>
                </>
              ) : (
                /* Address Form (Add/Edit) */
                <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem 0' }}>
                    {editingId ? 'Edit Address Details' : 'Add a New Address'}
                  </h4>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem' }}>Street Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formAddress}
                      onChange={e => setFormAddress(e.target.value)}
                      placeholder="123 Main St, Apt 4B"
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem' }}>City</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formCity}
                        onChange={e => setFormCity(e.target.value)}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem' }}>Country</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formCountry}
                        onChange={e => setFormCountry(e.target.value)}
                        placeholder="India"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.85rem' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formContact}
                      onChange={e => setFormContact(e.target.value)}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  {!editingId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                      <input
                        type="checkbox"
                        id="set_as_default_check"
                        checked={formIsDefault}
                        onChange={e => setFormIsDefault(e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <label htmlFor="set_as_default_check" style={{ fontSize: '0.85rem', cursor: 'pointer', margin: 0 }}>
                        Make this my default shipping address
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '10px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', fontWeight: 600 }}
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
