import { API_BASE_URL } from '../config';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, FolderOpen, ClipboardCheck,
  Image, FileText, Users, LogOut, Plus, Trash2, Edit, Check, RotateCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { admin, logoutAdmin } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, categories, orders, slides, terms, customers
  const [stats, setStats] = useState({
    productsCount: 0, ordersCount: 0, customersCount: 0, totalEarnings: 0, latestOrders: []
  });
  const [loading, setLoading] = useState(true);

  // Lists states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [slides, setSlides] = useState([]);
  const [terms, setTerms] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Modals / Form states
  const [prodModalOpen, setProdModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    title: '', url: '', price: '', salePrice: '', keywords: '', desc: '', features: '', label: '', categoryId: ''
  });
  const [prodFiles, setProdFiles] = useState({ img1: null, img2: null, img3: null });

  const [catForm, setCatForm] = useState({ title: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  const [slideForm, setSlideForm] = useState({ name: '', url: '' });
  const [slideFile, setSlideFile] = useState(null);

  const [termForm, setTermForm] = useState({ title: '', link: '', desc: '' });
  const [editingTerm, setEditingTerm] = useState(null);

  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${admin.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async (showLoading = true) => {
    if (!admin) return;
    if (showLoading) setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        await fetchStats();
      } else if (activeTab === 'products') {
        const res = await fetch(`${API_BASE_URL}/api/products?limit=100`);
        const catRes = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } else if (activeTab === 'categories') {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } else if (activeTab === 'orders') {
        const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } else if (activeTab === 'slides') {
        const res = await fetch(`${API_BASE_URL}/api/categories/sliders`);
        if (res.ok) {
          const data = await res.json();
          setSlides(data);
        }
      } else if (activeTab === 'terms') {
        const res = await fetch(`${API_BASE_URL}/api/categories/terms`);
        if (res.ok) {
          const data = await res.json();
          setTerms(data);
        }
      } else if (activeTab === 'customers') {
        const res = await fetch(`${API_BASE_URL}/api/admin/customers`, {
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Fetch lists on active tab changes
  useEffect(() => {
    fetchData(true);
  }, [activeTab, admin]);

  // Periodic polling every 10 seconds to keep stats and orders fresh
  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(() => {
      fetchData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, admin]);

  // ================= CRUD ACTIONS =================

  // Products CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(prodForm).forEach(key => formData.append(key, prodForm[key]));
    if (prodFiles.img1) formData.append('img1', prodFiles.img1);
    if (prodFiles.img2) formData.append('img2', prodFiles.img2);
    if (prodFiles.img3) formData.append('img3', prodFiles.img3);

    const url = editingProduct 
      ? `${API_BASE_URL}/api/admin/products/${editingProduct._id}`
      : `${API_BASE_URL}/api/admin/products`;

    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${admin.token}` },
        body: formData
      });

      if (res.ok) {
        setProdModalOpen(false);
        setEditingProduct(null);
        setProdForm({ title: '', url: '', price: '', salePrice: '', keywords: '', desc: '', features: '', label: '', categoryId: '' });
        setProdFiles({ img1: null, img2: null, img3: null });
        // Refresh products list
        setActiveTab('dashboard');
        setTimeout(() => setActiveTab('products'), 50);
      } else {
        alert('Product save failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        if (res.ok) {
          setProducts(products.filter(p => p._id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Categories CRUD
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    const url = editingCategory
      ? `${API_BASE_URL}/api/admin/categories/${editingCategory._id}`
      : `${API_BASE_URL}/api/admin/categories`;

    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify({ title: catForm.title })
      });

      if (res.ok) {
        setCatForm({ title: '' });
        setEditingCategory(null);
        // Refresh lists
        const catRes = await fetch(`${API_BASE_URL}/api/categories`);
        if (catRes.ok) setCategories(await catRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm('Delete category?')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/categories/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        setCategories(categories.filter(c => c._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Orders CRUD
  const updateOrderStatus = async (id, statusData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(statusData)
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(orders.map(o => o._id === id ? { ...o, ...updated } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOrder = async (id) => {
    if (window.confirm('Delete order record?')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        setOrders(orders.filter(o => o._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Slides CRUD
  const handleSlideSubmit = async (e) => {
    e.preventDefault();
    if (!slideFile && !editingCategory) return;
    const formData = new FormData();
    formData.append('name', slideForm.name);
    formData.append('url', slideForm.url);
    if (slideFile) formData.append('image', slideFile);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sliders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${admin.token}` },
        body: formData
      });
      if (res.ok) {
        setSlideForm({ name: '', url: '' });
        setSlideFile(null);
        // Refresh slides list
        const sRes = await fetch(`${API_BASE_URL}/api/categories/sliders`);
        if (sRes.ok) setSlides(await sRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSlide = async (id) => {
    if (window.confirm('Delete banner slide?')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/sliders/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        setSlides(slides.filter(s => s._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Terms CRUD
  const handleTermSubmit = async (e) => {
    e.preventDefault();
    const url = editingTerm
      ? `${API_BASE_URL}/api/admin/terms/${editingTerm._id}`
      : `${API_BASE_URL}/api/admin/terms`;
    const method = editingTerm ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.token}`
        },
        body: JSON.stringify(termForm)
      });
      if (res.ok) {
        setTermForm({ title: '', link: '', desc: '' });
        setEditingTerm(null);
        // Refresh terms list
        const tRes = await fetch(`${API_BASE_URL}/api/categories/terms`);
        if (tRes.ok) setTerms(await tRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTerm = async (id) => {
    if (window.confirm('Delete this term policy?')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/terms/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        setTerms(terms.filter(t => t._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Customer account delete
  const deleteCustomer = async (id) => {
    if (window.confirm('Delete customer account?')) {
      try {
        await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        setCustomers(customers.filter(c => c._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!admin) return null;

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'left', paddingLeft: '1rem', marginBottom: '0.5rem' }}>
          <span>Admin</span> Panel
        </h2>

        <ul className="admin-nav" style={{ marginTop: '0.75rem' }}>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('dashboard')} className={`admin-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('products')} className={`admin-nav-link ${activeTab === 'products' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <ShoppingBag size={18} /> Products
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('categories')} className={`admin-nav-link ${activeTab === 'categories' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <FolderOpen size={18} /> Categories
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('orders')} className={`admin-nav-link ${activeTab === 'orders' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <ClipboardCheck size={18} /> Orders
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('slides')} className={`admin-nav-link ${activeTab === 'slides' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <Image size={18} /> Banner Slides
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('terms')} className={`admin-nav-link ${activeTab === 'terms' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <FileText size={18} /> Policy Terms
            </button>
          </li>
          <li className="admin-nav-item">
            <button onClick={() => setActiveTab('customers')} className={`admin-nav-link ${activeTab === 'customers' ? 'active' : ''}`} style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
              <Users size={18} /> Customers
            </button>
          </li>
          <li className="admin-nav-item" style={{ marginTop: '3rem' }}>
            <button onClick={logoutAdmin} className="admin-nav-link" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer', textAlign: 'left', color: 'var(--danger)' }}>
              <LogOut size={18} /> Log Out
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Panel Content Area */}
      <main className="admin-content">
        {/* STATS METRIC GRID */}
        {activeTab === 'dashboard' && (
          <>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Catalog Items</span>
                  <div className="stat-val">{stats.productsCount}</div>
                </div>
                <span className="stat-icon">
                  <ShoppingBag size={24} />
                </span>
              </div>
              <div className="admin-stat-card">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Orders</span>
                  <div className="stat-val">{stats.ordersCount}</div>
                </div>
                <span className="stat-icon">
                  <ClipboardCheck size={24} />
                </span>
              </div>
              <div className="admin-stat-card">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Store Users</span>
                  <div className="stat-val">{stats.customersCount}</div>
                </div>
                <span className="stat-icon">
                  <Users size={24} />
                </span>
              </div>
              <div className="admin-stat-card">
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Earnings (INR)</span>
                  <div className="stat-val">₹{stats.totalEarnings.toLocaleString('en-IN')}</div>
                </div>
                <span className="stat-icon">
                  <Check size={24} />
                </span>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Latest Customer Orders</h3>
                <button 
                  onClick={() => fetchData(true)} 
                  className="btn btn-secondary btn-sm" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}
                >
                  <RotateCw size={14} /> Refresh
                </button>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Customer Name</th>
                      <th>Amount Due</th>
                      <th>Delivery Status</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.latestOrders.map(order => (
                      <tr key={order._id}>
                        <td><strong>#{order.invoiceNo}</strong></td>
                        <td>{order.customerId ? order.customerId.customers_name : 'Guest'}</td>
                        <td>₹{order.dueAmount.toLocaleString('en-IN')}</td>
                        <td><span className={`status-pill ${order.orderStatus}`}>{order.orderStatus}</span></td>
                        <td><span className={`status-pill ${order.paymentStatus === 'Completed' ? 'completed' : 'pending'}`}>{order.paymentStatus}</span></td>
                      </tr>
                    ))}
                    {stats.latestOrders.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No recent orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: PRODUCTS TABLE */}
        {activeTab === 'products' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Manage Products Catalog</h3>
              <button onClick={() => { setEditingProduct(null); setProdForm({ title: '', url: '', price: '', salePrice: '', keywords: '', desc: '', features: '', label: '', categoryId: categories[0]?._id || '' }); setProdModalOpen(true); }} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Price</th>
                    <th>Sale Price</th>
                    <th>Category</th>
                    <th>Label</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id}>
                      <td>{p.product_title}</td>
                      <td>₹{p.product_price.toLocaleString('en-IN')}</td>
                      <td>₹{p.product_sale ? p.product_sale.toLocaleString('en-IN') : '0'}</td>
                      <td>{p.cat_id ? p.cat_id.cat_title : 'N/A'}</td>
                      <td><span className="status-pill completed">{p.product_label || 'none'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setEditingProduct(p); setProdForm({ title: p.product_title, url: p.product_url, price: p.product_price, salePrice: p.product_sale, keywords: p.product_keywords, desc: p.product_desc, features: p.product_features, label: p.product_label, categoryId: p.cat_id?._id || '' }); setProdModalOpen(true); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => deleteProduct(p._id)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem', color: 'var(--danger)' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES TABLE */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Current Brands</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map(c => (
                  <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <span>{c.cat_title}</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingCategory(c); setCatForm({ title: c.cat_title }); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteCategory(c._id)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {editingCategory ? 'Edit Brand' : 'Add Brand'}
              </h3>
              <form onSubmit={handleCategorySubmit}>
                <div className="form-group">
                  <label htmlFor="cattitle">Brand Title</label>
                  <input
                    id="cattitle"
                    type="text"
                    className="form-input"
                    value={catForm.title}
                    onChange={(e) => setCatForm({ title: e.target.value })}
                    required
                    placeholder="e.g. Google Pixel"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {editingCategory ? 'Save Brand' : 'Create Brand'}
                </button>
                {editingCategory && (
                  <button type="button" onClick={() => { setEditingCategory(null); setCatForm({ title: '' }); }} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS CONTROL */}
        {activeTab === 'orders' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Manage Store Orders</h3>
              <button 
                onClick={() => fetchData(true)} 
                className="btn btn-secondary btn-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}
              >
                <RotateCw size={14} /> Refresh
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id}>
                      <td><strong>#{o.invoiceNo}</strong></td>
                      <td>{o.customerId ? o.customerId.customers_name : 'Deleted Customer'}</td>
                      <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                      <td>₹{o.dueAmount.toLocaleString('en-IN')}</td>
                      <td>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => updateOrderStatus(o._id, { orderStatus: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.25rem', minWidth: '120px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => updateOrderStatus(o._id, { paymentStatus: e.target.value })}
                          className="form-input"
                          style={{ padding: '0.25rem', minWidth: '120px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => deleteOrder(o._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', padding: '0.25rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SLIDES CONTROL */}
        {activeTab === 'slides' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Active Banners</h3>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Url</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slides.map(s => {
                      const img = s.slide_image.startsWith('http') ? s.slide_image : `${API_BASE_URL}/uploads/${s.slide_image}`;
                      return (
                        <tr key={s._id}>
                          <td><img src={img} alt={s.slide_name} style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                          <td>{s.slide_name}</td>
                          <td>{s.slide_url}</td>
                          <td>
                            <button onClick={() => deleteSlide(s._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', padding: '0.25rem' }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Add Banner Slide</h3>
              <form onSubmit={handleSlideSubmit}>
                <div className="form-group">
                  <label htmlFor="slidename">Slide Title</label>
                  <input
                    id="slidename"
                    type="text"
                    className="form-input"
                    value={slideForm.name}
                    onChange={(e) => setSlideForm({ ...slideForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slideurl">Navigation URL</label>
                  <input
                    id="slideurl"
                    type="text"
                    className="form-input"
                    value={slideForm.url}
                    onChange={(e) => setSlideForm({ ...slideForm, url: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slidefile">Select Slide Image (Width: ~1200px)</label>
                  <input
                    id="slidefile"
                    type="file"
                    className="form-input"
                    onChange={(e) => setSlideFile(e.target.files[0])}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Upload & Create
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: TERMS CONTROL */}
        {activeTab === 'terms' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Dynamic Policy Pages</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {terms.map(t => (
                  <li key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{t.term_title}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#{t.term_link}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setEditingTerm(t); setTermForm({ title: t.term_title, link: t.term_link, desc: t.term_desc }); }} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteTerm(t._id)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {editingTerm ? 'Edit Policy Term' : 'Add Policy Term'}
              </h3>
              <form onSubmit={handleTermSubmit}>
                <div className="form-group">
                  <label htmlFor="termtitle">Policy Title</label>
                  <input
                    id="termtitle"
                    type="text"
                    className="form-input"
                    value={termForm.title}
                    onChange={(e) => setTermForm({ ...termForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="termlink">Link Hashtag ID</label>
                  <input
                    id="termlink"
                    type="text"
                    className="form-input"
                    value={termForm.link}
                    onChange={(e) => setTermForm({ ...termForm, link: e.target.value })}
                    required
                    placeholder="e.g. privacyLink"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="termdesc">Detailed Policy content</label>
                  <textarea
                    id="termdesc"
                    className="form-input"
                    value={termForm.desc}
                    onChange={(e) => setTermForm({ ...termForm, desc: e.target.value })}
                    required
                    style={{ minHeight: '120px', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {editingTerm ? 'Save Policy' : 'Create Policy'}
                </button>
                {editingTerm && (
                  <button type="button" onClick={() => { setEditingTerm(null); setTermForm({ title: '', link: '', desc: '' }); }} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Cancel
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS TABLE */}
        {activeTab === 'customers' && (
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Registered Users</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email address</th>
                    <th>Contact</th>
                    <th>City/Country</th>
                    <th>Registered IP</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.customers_name}</strong></td>
                      <td>{c.customers_email}</td>
                      <td>{c.customers_contact || 'N/A'}</td>
                      <td>{c.customers_city || 'N/A'}, {c.customers_country || 'N/A'}</td>
                      <td><code>{c.customers_ip || 'N/A'}</code></td>
                      <td>
                        <button onClick={() => deleteCustomer(c._id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', padding: '0.25rem' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD/EDIT PRODUCT */}
        {prodModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-body">
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}
              </h3>
              <form onSubmit={handleProductSubmit}>
                <div className="form-group">
                  <label htmlFor="ptitle">Product Title *</label>
                  <input id="ptitle" type="text" className="form-input" value={prodForm.title} onChange={e => setProdForm({ ...prodForm, title: e.target.value })} required />
                </div>
                <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="pprice">Base Price (INR) *</label>
                    <input id="pprice" type="number" className="form-input" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="psale">Sale Price (INR, optional)</label>
                    <input id="psale" type="number" className="form-input" value={prodForm.salePrice} onChange={e => setProdForm({ ...prodForm, salePrice: e.target.value })} />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem', marginBottom: 0 }}>
                  <div className="form-group">
                    <label htmlFor="pcat">Brand Category *</label>
                    <select id="pcat" className="form-input" value={prodForm.categoryId} onChange={e => setProdForm({ ...prodForm, categoryId: e.target.value })} required>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.cat_title}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="plabel">Status Badge / Label</label>
                    <select id="plabel" className="form-input" value={prodForm.label} onChange={e => setProdForm({ ...prodForm, label: e.target.value })}>
                      <option value="">None</option>
                      <option value="new">New</option>
                      <option value="sale">Sale</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pkeywords">Keywords (comma separated)</label>
                  <input id="pkeywords" type="text" className="form-input" value={prodForm.keywords} onChange={e => setProdForm({ ...prodForm, keywords: e.target.value })} placeholder="e.g. s24, samsung, ultra" />
                </div>

                <div className="form-group">
                  <label htmlFor="pdesc">Product Description (HTML allowed)</label>
                  <textarea id="pdesc" className="form-input" value={prodForm.desc} onChange={e => setProdForm({ ...prodForm, desc: e.target.value })} style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>

                <div className="form-group">
                  <label htmlFor="pfeatures">Specifications sheet (HTML allowed)</label>
                  <textarea id="pfeatures" className="form-input" value={prodForm.features} onChange={e => setProdForm({ ...prodForm, features: e.target.value })} style={{ minHeight: '80px', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upload Images (optional if editing)</label>
                  <input type="file" className="form-input" onChange={e => setProdFiles({ ...prodFiles, img1: e.target.files[0] })} />
                  <input type="file" className="form-input" onChange={e => setProdFiles({ ...prodFiles, img2: e.target.files[0] })} />
                  <input type="file" className="form-input" onChange={e => setProdFiles({ ...prodFiles, img3: e.target.files[0] })} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>Save Product</button>
                  <button type="button" onClick={() => setProdModalOpen(false)} className="btn btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
