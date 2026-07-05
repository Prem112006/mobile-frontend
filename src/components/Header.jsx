import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User, LogOut, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export const Header = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const { user, logoutUser, admin, logoutAdmin, openAuthModal } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };
    updateCount();
    const interval = setInterval(updateCount, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery.trim()}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <header className="main-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
      {/* Main Header / Navigation */}
      <div className="container nav-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px' }}>
        <Link to="/" className="logo" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          <span>SmartCart</span>Mobiles
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-only">
          <ul className="nav-menu" style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/shop" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Shop
              </NavLink>
            </li>
            <li>
              <NavLink to="/account" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                My Account
              </NavLink>
            </li>
            <li>
              <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Shopping Cart
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Contact Us
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Action Buttons & Sign In */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ border: 'none', background: 'none', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            aria-label="Theme toggle"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="btn btn-secondary btn-sm"
            style={{ border: 'none', background: 'none', color: 'var(--text-secondary)' }}
            aria-label="Search toggle"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Badge */}
          <Link to="/wishlist" className="cart-badge-btn" aria-label="Wishlist" style={{ color: 'var(--text-secondary)', position: 'relative' }}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="cart-count" style={{ backgroundColor: 'var(--danger)' }}>{wishlistCount}</span>}
          </Link>

          {/* Cart Badge */}
          <Link to="/cart" className="cart-badge-btn" aria-label="Cart" style={{ color: 'var(--text-secondary)' }}>
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>

          {/* User Section / Sign In Button */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              {user.email === 'premkardani2006@gmail.com' && (
                <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                  <LayoutDashboard size={18} />
                  <span className="desktop-only">Admin Panel</span>
                </Link>
              )}
              <Link to="/account" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <User size={18} />
                <span className="desktop-only">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={() => { logoutUser(); navigate('/'); }}
                style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : admin ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
              <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <LayoutDashboard size={18} />
                <span className="desktop-only">Admin</span>
              </Link>
              <button
                onClick={() => { logoutAdmin(); navigate('/'); }}
                style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Log Out Admin"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                navigate('/login');
              }}
              className="btn btn-primary"
              style={{
                borderRadius: '30px',
                backgroundColor: 'var(--primary)',
                borderColor: 'var(--primary)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.5rem 1.5rem',
                fontSize: '0.95rem'
              }}
            >
              Sign In
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-only btn btn-secondary btn-sm"
            style={{ border: 'none', background: 'none', color: 'inherit', padding: 0 }}
            aria-label="Menu toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Slide down Search Bar */}
      {searchOpen && (
        <div className="search-bar-dropdown" style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
          <div className="container">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search for smartphones, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', top: '80px', left: 0, width: '100vw', height: 'calc(100vh - 80px)', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 900 }}>
          <nav className="mobile-nav" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '280px', height: '100%', borderRight: '1px solid var(--border-color)' }}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 500 }}>Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 500 }}>Shop</Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 500 }}>My Account</Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 500 }}>Shopping Cart</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', fontWeight: 500 }}>Contact Us</Link>
            
            {user && (
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged In As</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{user.email}</span>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
