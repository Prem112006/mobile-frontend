import { API_BASE_URL } from '../config';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, UserCog, Lock, UserX, User } from 'lucide-react';

export const MyAccount = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile'); // profile, orders, edit, password, delete
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCountry, setProfileCountry] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileContact, setProfileContact] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileMsg, setProfileMsg] = useState({ error: false, text: '' });

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState({ error: false, text: '' });

  const navigate = useNavigate();

  // If no user, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=account');
    }
  }, [user, navigate]);

  // Load profile values on user mount
  useEffect(() => {
    if (user && user.token) {
      fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          setProfileName(data.customers_name || '');
          setProfileEmail(data.customers_email || '');
          setProfileCountry(data.customers_country || '');
          setProfileCity(data.customers_city || '');
          setProfileContact(data.customers_contact || '');
          setProfileAddress(data.customers_address || '');
        })
        .catch(err => console.error(err));
    }
  }, [user]);

  // Load customer orders
  useEffect(() => {
    if (user && user.token && activeTab === 'orders') {
      setOrdersLoading(true);
      fetch(`${API_BASE_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
          setOrders(data || []);
        })
        .catch(err => console.error(err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user, activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ error: false, text: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: profileName,
          country: profileCountry,
          city: profileCity,
          contact: profileContact,
          address: profileAddress
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ error: false, text: 'Profile updated successfully!' });
      } else {
        setProfileMsg({ error: true, text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error(error);
      setProfileMsg({ error: true, text: 'Error updating profile details' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ error: false, text: '' });

    if (newPassword !== confirmPassword) {
      return setPassMsg({ error: true, text: 'New passwords do not match' });
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPassMsg({ error: false, text: 'Password changed successfully!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassMsg({ error: true, text: data.message || 'Incorrect old password' });
      }
    } catch (error) {
      console.error(error);
      setPassMsg({ error: true, text: 'Error updating password' });
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });

        if (res.ok) {
          alert('Your account has been deleted.');
          logoutUser();
          navigate('/');
        } else {
          alert('Failed to delete account');
        }
      } catch (error) {
        console.error(error);
        alert('Error deleting account');
      }
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(prevOrders => 
          prevOrders.filter(o => o._id !== orderId)
        );
        alert('Order cancelled successfully.');
      } else {
        alert(data.message || 'Failed to cancel order.');
      }
    } catch (error) {
      console.error(error);
      alert('Error cancelling order.');
    }
  };

  const getEstDeliveryDate = (orderDate) => {
    const city = profileCity ? profileCity.toLowerCase().trim() : '';
    const country = profileCountry ? profileCountry.toLowerCase().trim() : 'india';

    let days = 4;
    if (country !== 'india' && country !== 'in' && country !== '') {
      days = 8;
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
    }

    const date = new Date(orderDate);
    date.setDate(date.getDate() + days);

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
        My Customer Dashboard
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
        {/* Navigation Sidebar */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
            <User size={36} style={{ color: 'var(--primary)' }} />
            <div>
              <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{user.name}</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Customer Profile</span>
            </div>
          </div>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <User size={18} /> Profile Overview
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <ClipboardList size={18} /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <UserCog size={18} /> Edit Account
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Lock size={18} /> Change Password
          </button>
          <button
            onClick={() => setActiveTab('delete')}
            className={`btn ${activeTab === 'delete' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <UserX size={18} /> Delete Account
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="card" style={{ minHeight: '400px' }}>
          {/* TAB 0: PROFILE OVERVIEW */}
          {activeTab === 'profile' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Account Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Full Name:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profileName || 'Not Provided'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Email Address:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profileEmail || 'Not Provided'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Contact Number:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profileContact || 'Not Provided'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Country:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profileCountry || 'Not Provided'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>City:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{profileCity || 'Not Provided'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Shipping Address:</span>
                  <span style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{profileAddress || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                My Purchase History
              </h3>

              {ordersLoading ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
                  Loading order history...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Order Date</th>
                        <th>Est. Delivery</th>
                        <th>Amount Due</th>
                        <th>Products</th>
                        <th>Items Count</th>
                        <th>Delivery Status</th>
                        <th>Payment Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td><strong>#{order.invoiceNo}</strong></td>
                          <td>{new Date(order.orderDate).toLocaleDateString('en-IN')}</td>
                          <td>{getEstDeliveryDate(order.orderDate)}</td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{order.dueAmount.toLocaleString('en-IN')}</div>
                            {order.taxAmount > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                                Incl. ₹{order.taxAmount.toLocaleString('en-IN')} GST
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              {order.items.map((item, idx) => {
                                if (!item.productId) {
                                  return (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.05)' }} title="Product is no longer available in the store.">
                                      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', border: '1px dashed rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                        N/A
                                      </div>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Unavailable Product (x{item.qty})</span>
                                    </div>
                                  );
                                }
                                const imgUrl = item.productId.product_img1.startsWith('http')
                                  ? item.productId.product_img1
                                  : `${API_BASE_URL}/uploads/${item.productId.product_img1}`;
                                return (
                                  <img
                                    key={idx}
                                    src={imgUrl}
                                    alt={item.productId.product_title}
                                    style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px' }}
                                    title={`${item.productId.product_title} (x${item.qty})`}
                                  />
                                );
                              })}
                            </div>
                          </td>
                          <td>
                            {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                          </td>
                          <td>
                            <span className={`status-pill ${
                              order.orderStatus === 'delivered' ? 'completed' :
                              order.orderStatus === 'processing' ? 'processing' :
                              order.orderStatus === 'cancelled' ? 'cancelled' : 'pending'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${order.paymentStatus === 'Completed' ? 'completed' : 'processing'}`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td>
                            {order.orderStatus === 'pending' ? (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                              >
                                Cancel Order
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDIT ACCOUNT */}
          {activeTab === 'edit' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Update Account Information
              </h3>

              {profileMsg.text && (
                <div style={{ backgroundColor: profileMsg.error ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: profileMsg.error ? 'var(--danger)' : 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: profileMsg.error ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)', fontSize: '0.9rem' }}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label htmlFor="pname">Full Name</label>
                  <input
                    id="pname"
                    type="text"
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="pcountry">Country</label>
                    <input
                      id="pcountry"
                      type="text"
                      className="form-input"
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pcity">City</label>
                    <input
                      id="pcity"
                      type="text"
                      className="form-input"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pcontact">Contact Number</label>
                  <input
                    id="pcontact"
                    type="text"
                    className="form-input"
                    value={profileContact}
                    onChange={(e) => setProfileContact(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paddress">Shipping Address</label>
                  <textarea
                    id="paddress"
                    className="form-input"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                Change Password
              </h3>

              {passMsg.text && (
                <div style={{ backgroundColor: passMsg.error ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: passMsg.error ? 'var(--danger)' : 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', border: passMsg.error ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)', fontSize: '0.9rem' }}>
                  {passMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label htmlFor="oldpass">Current Password</label>
                  <input
                    id="oldpass"
                    type="password"
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newpass">New Password</label>
                  <input
                    id="newpass"
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confpass">Confirm New Password</label>
                  <input
                    id="confpass"
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: DELETE ACCOUNT */}
          {activeTab === 'delete' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--danger)' }}>
                Delete Account
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Deleting your account is permanent and cannot be undone. All your order history and profile information will be deleted from our systems. Any outstanding online payments will be processed, but your customer record will be erased.
              </p>
              <div>
                <button onClick={handleDeleteAccount} className="btn btn-danger" style={{ padding: '0.75rem 1.5rem' }}>
                  Permanently Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
