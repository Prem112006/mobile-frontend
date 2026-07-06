import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { ProductCard } from '../components/ProductCard';

export const Shop = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  // Load URL query params (e.g. from header search submission)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      setPage(1);
    }
  }, [location.search]);

  // Fetch Categories
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch Products
  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/products?page=${page}&limit=6`;
    if (selectedCat) {
      url += `&cat=${selectedCat}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setPages(data.pages || 1);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCat, searchQuery, page]);

  const handlePageChange = (p) => {
    if (p >= 1 && p <= pages) {
      setPage(p);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center' }}>
        Shop Branded Mobiles
      </h2>

      <div className="shop-grid">
        {/* Sidebar Brand Filters */}
        <div className="desktop-only">
          <Sidebar
            categories={categories}
            selectedCat={selectedCat}
            setSelectedCat={(catId) => {
              setSelectedCat(catId);
              setPage(1); // Reset page on brand change
            }}
          />
        </div>

        {/* Main Grid Area */}
        <div>
          {/* Mobile Categories Row */}
          <div className="mobile-only" style={{ marginBottom: '1.5rem', overflowX: 'auto', display: 'flex', gap: '0.75rem', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => { setSelectedCat(''); setPage(1); }}
              className={`btn btn-sm ${selectedCat === '' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Brands
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => { setSelectedCat(cat._id); setPage(1); }}
                className={`btn btn-sm ${selectedCat === cat._id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {cat.cat_title}
              </button>
            ))}
          </div>

          {searchQuery && (
            <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              Showing search results for "<strong>{searchQuery}</strong>"
              <button
                onClick={() => setSearchQuery('')}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '1rem', border: 'none', background: 'rgba(255,255,255,0.05)' }}
              >
                Clear Search
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
              Loading products catalog...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No products found matching your selection.</p>
            </div>
          ) : (
            <>
              <div className="grid-3" style={{ marginBottom: '3rem' }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Custom Pagination */}
              {pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '2rem 0' }}>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === 1 ? 0.5 : 1 }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === 1 ? 0.5 : 1 }}
                  >
                    Prev
                  </button>

                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pages}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === pages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handlePageChange(pages)}
                    disabled={page === pages}
                    className="btn btn-secondary btn-sm"
                    style={{ opacity: page === pages ? 0.5 : 1 }}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
