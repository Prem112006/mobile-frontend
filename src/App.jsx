import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';

// Client Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { MyAccount } from './pages/MyAccount';
import { Contact } from './pages/Contact';
import { Terms } from './pages/Terms';
import { Wishlist } from './pages/Wishlist';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

// Layout wrapper to conditionally show/hide header and footer
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute && !user) {
      const hasVisited = localStorage.getItem('hasVisitedBefore');
      if (!hasVisited) {
        // Redirect to register for first time users
        navigate('/register');
        localStorage.setItem('hasVisitedBefore', 'true');
      }
    }
  }, [user, isAdminRoute, navigate]);

  return (
    <div className="app-container">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? "" : "main-content"}>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Client Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/account" element={<MyAccount />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
