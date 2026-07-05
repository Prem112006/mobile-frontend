import { API_BASE_URL } from '../config';
import React, { useEffect, useState } from 'react';
import { Slider } from '../components/Slider';
import { ProductCard } from '../components/ProductCard';

export const Home = () => {
  const [sliders, setSliders] = useState([]);

  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Sliders
        const sliderRes = await fetch(`${API_BASE_URL}/api/categories/sliders`);
        if (sliderRes.ok) {
          const sliderData = await sliderRes.json();
          setSliders(sliderData);
        }


        // Fetch Latest Products
        const prodRes = await fetch(`${API_BASE_URL}/api/products/latest`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setLatestProducts(prodData);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Slider Hero */}
      {sliders.length > 0 && <Slider slides={sliders} />}


      {/* Latest Products Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Our Latest Products
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading products...
          </div>
        ) : (
          <div className="grid-4">
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} showAddToCart={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
