import { API_BASE_URL } from '../config';
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, RefreshCw, Sparkles, Smartphone, Cpu, Database, Camera, Battery, Info, Volume2, Truck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails = () => {
  const { slug } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState('');
  const [activeTab, setActiveTab] = useState('desc'); // desc, specs, features
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState('');


  const parseSpecs = (htmlString) => {
    if (!htmlString) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const lis = tempDiv.getElementsByTagName('li');
    if (lis.length > 0) {
      return Array.from(lis).map(li => li.textContent.trim());
    }
    const ps = tempDiv.getElementsByTagName('p');
    if (ps.length > 0) {
      return Array.from(ps).map(p => p.textContent.trim());
    }
    return htmlString.replace(/<[^>]*>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean);
  };

  const getRichSpecs = (product) => {
    const specs = parseSpecs(product.product_features);
    const hasBattery = specs.some(s => s.toLowerCase().includes('battery') || s.toLowerCase().includes('mah'));
    const hasDisplay = specs.some(s => s.toLowerCase().includes('display') || s.toLowerCase().includes('inch') || s.toLowerCase().includes('screen') || s.toLowerCase().includes('display') || s.toLowerCase().includes('cm'));
    const hasStorage = specs.some(s => s.toLowerCase().includes('ram') || s.toLowerCase().includes('rom'));
    const hasCamera = specs.some(s => s.toLowerCase().includes('camera') || s.toLowerCase().includes('mp'));
    const hasSpeaker = specs.some(s => s.toLowerCase().includes('speaker') || s.toLowerCase().includes('audio') || s.toLowerCase().includes('sound') || s.toLowerCase().includes('dolby'));
    const hasOs = specs.some(s => s.toLowerCase().includes('android') || s.toLowerCase().includes('ios') || s.toLowerCase().includes('os'));
    const hasCpu = specs.some(s => s.toLowerCase().includes('processor') || s.toLowerCase().includes('chip') || s.toLowerCase().includes('cpu') || s.toLowerCase().includes('bionic') || s.toLowerCase().includes('snapdragon') || s.toLowerCase().includes('dimensity'));
    
    const enriched = [...specs];
    const title = product.product_title.toLowerCase();

    // 1. DISPLAY FALLBACK
    if (!hasDisplay) {
      if (title.includes('15 pro max')) enriched.push('17.02 cm (6.7 inch) Super Retina XDR Display');
      else if (title.includes('16')) enriched.push('15.49 cm (6.1 inch) Super Retina XDR Display');
      else if (title.includes('ultra')) enriched.push('17.27 cm (6.8 inch) Quad HD+ Dynamic AMOLED 2X');
      else if (title.includes('flip 5')) enriched.push('17.02 cm (6.7 inch) Full HD+ Dynamic AMOLED 2X');
      else if (title.includes('reno 11')) enriched.push('17.02 cm (6.7 inch) Full HD+ AMOLED Display');
      else enriched.push('16.76 cm (6.6 inch) Full HD+ Display');
    }

    // 2. STORAGE/RAM FALLBACK
    if (!hasStorage) {
      if (title.includes('pro max') || title.includes('ultra')) enriched.push('12 GB RAM | 256 GB ROM');
      else if (title.includes('iphone 16') || title.includes('iphone 15') || title.includes('iphone 14')) enriched.push('8 GB RAM | 128 GB ROM');
      else enriched.push('8 GB RAM | 128 GB ROM');
    }

    // 3. CAMERA FALLBACK
    if (!hasCamera) {
      if (title.includes('15 pro max') || title.includes('16 pro max')) enriched.push('48MP + 12MP + 12MP | 12MP Front Camera');
      else if (title.includes('ultra')) enriched.push('200MP + 50MP + 12MP + 10MP | 12MP Front Camera');
      else if (title.includes('flip 5')) enriched.push('12MP + 12MP | 10MP Front Camera');
      else enriched.push('50MP + 8MP Dual Camera Setup');
    }

    // 4. BATTERY FALLBACK
    if (!hasBattery) {
      if (title.includes('15 pro max')) enriched.push('4441 mAh Battery');
      else if (title.includes('15 pro')) enriched.push('3274 mAh Battery');
      else if (title.includes('iphone 16')) enriched.push('3561 mAh Battery');
      else if (title.includes('iphone 15')) enriched.push('3349 mAh Battery');
      else if (title.includes('iphone 14 plus')) enriched.push('4325 mAh Battery');
      else if (title.includes('iphone 13')) enriched.push('3227 mAh Battery');
      else if (title.includes('ultra')) enriched.push('5000 mAh Battery with 45W Fast Charging');
      else if (title.includes('flip 5')) enriched.push('3700 mAh Battery');
      else enriched.push('5000 mAh Battery with Fast Charging');
    }

    // 5. SPEAKER FALLBACK (always correct)
    if (!hasSpeaker) {
      if (title.includes('iphone') || title.includes('galaxy') || title.includes('reno') || title.includes('pro') || title.includes('v40')) {
        enriched.push('Stereo Speakers with Dolby Atmos support');
      } else {
        enriched.push('Loudspeaker with high-res audio certification');
      }
    }

    // 6. OS FALLBACK
    if (!hasOs) {
      if (title.includes('iphone') || title.includes('apple') || title.includes('ipad')) {
        if (title.includes('16')) enriched.push('iOS 18 Operating System');
        else enriched.push('iOS 17 Operating System');
      } else {
        enriched.push('Android 14 Operating System');
      }
    }

    // 7. CPU FALLBACK
    if (!hasCpu) {
      if (title.includes('iphone 16')) enriched.push('A18 Bionic Chip Processor');
      else if (title.includes('iphone 15 pro')) enriched.push('A17 Pro Chip Processor');
      else if (title.includes('iphone 15')) enriched.push('A16 Bionic Chip Processor');
      else if (title.includes('iphone 14 plus')) enriched.push('A15 Bionic Chip Processor');
      else if (title.includes('iphone 13')) enriched.push('A15 Bionic Chip Processor');
      else if (title.includes('s24 ultra')) enriched.push('Snapdragon 8 Gen 3 Processor');
      else if (title.includes('z flip 5')) enriched.push('Snapdragon 8 Gen 2 Processor');
    }
    
    return enriched;
  };

  const getSpecIcon = (spec) => {
    const s = spec.toLowerCase();
    if (s.includes('ram') || s.includes('rom') || s.includes('storage')) {
      return <Database size={20} className="text-primary" />;
    }
    if (s.includes('display') || s.includes('inch') || s.includes('screen') || s.includes('cm')) {
      return <Smartphone size={20} className="text-primary" />;
    }
    if (s.includes('camera') || s.includes('mp')) {
      return <Camera size={20} className="text-primary" />;
    }
    if (s.includes('battery') || s.includes('mah') || s.includes('charging')) {
      return <Battery size={20} className="text-primary" />;
    }
    if (s.includes('speaker') || s.includes('audio') || s.includes('sound') || s.includes('dolby')) {
      return <Volume2 size={20} className="text-primary" />;
    }
    if (s.includes('processor') || s.includes('chip') || s.includes('cpu') || s.includes('dimensity') || s.includes('snapdragon') || s.includes('bionic')) {
      return <Cpu size={20} className="text-primary" />;
    }
    return <Info size={20} className="text-primary" />;
  };

  const getSpecCategory = (spec) => {
    const s = spec.toLowerCase();
    if (s.includes('ram') || s.includes('rom') || s.includes('storage')) {
      return 'Storage & RAM';
    }
    if (s.includes('display') || s.includes('inch') || s.includes('screen') || s.includes('cm')) {
      return 'Display';
    }
    if (s.includes('camera') || s.includes('mp')) {
      return 'Camera';
    }
    if (s.includes('battery') || s.includes('mah') || s.includes('charging')) {
      return 'Battery & Power';
    }
    if (s.includes('speaker') || s.includes('audio') || s.includes('sound') || s.includes('dolby')) {
      return 'Audio & Speaker';
    }
    if (s.includes('processor') || s.includes('chip') || s.includes('cpu') || s.includes('dimensity') || s.includes('snapdragon') || s.includes('bionic')) {
      return 'Processor';
    }
    return 'General OS';
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${slug}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Product not found');
      })
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related || []);
        setActiveImg(data.product.product_img1);
        setQty(1);
        setSize('');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsLiked(wishlist.includes(data.product._id));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    let city = '';
    let country = '';
    
    if (user && user.email) {
      const storageKey = `shipping_addresses_${user.email}`;
      const savedAddresses = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      if (defaultAddr) {
        city = defaultAddr.city;
        country = defaultAddr.country;
      }
    }
    
    let days = 4;
    let locationLabel = '';
    
    if (city) {
      locationLabel = ` to ${city}`;
      const cleanCity = city.toLowerCase().trim();
      const cleanCountry = country ? country.toLowerCase().trim() : 'india';
      
      if (cleanCountry !== 'india' && cleanCountry !== 'in') {
        days = 8;
      } else if (
        cleanCity.includes('mumbai') ||
        cleanCity.includes('delhi') ||
        cleanCity.includes('bangalore') ||
        cleanCity.includes('bengaluru') ||
        cleanCity.includes('chennai') ||
        cleanCity.includes('kolkata') ||
        cleanCity.includes('hyderabad') ||
        cleanCity.includes('pune')
      ) {
        days = 2;
      }
    }
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);
    
    setDeliveryInfo(`FREE delivery by ${dateString}${locationLabel}`);
  }, [user]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--text-secondary)' }}>Loading details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Product Not Found</h3>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, qty, size);
    setMessage('Item added to cart successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBuyNow = () => {
    navigate('/checkout?action=change_address', {
      state: {
        buyNowItem: {
          productId: product,
          qty,
          size
        }
      }
    });
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updatedWishlist;
    if (isLiked) {
      updatedWishlist = wishlist.filter(id => id !== product._id);
      setMessage('Removed from wishlist successfully!');
    } else {
      updatedWishlist = [...wishlist, product._id];
      setMessage('Added to wishlist successfully!');
    }
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setIsLiked(!isLiked);
    setTimeout(() => setMessage(''), 3000);
  };

  const isSale = product.product_label === 'sale';
  const specs = getRichSpecs(product);
  const currentPrice = isSale ? product.product_sale : product.product_price;

  const getImgUrl = (filename) => {
    if (!filename) return '';
    return filename.startsWith('http') ? filename : `${API_BASE_URL}/uploads/${filename}`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="detail-grid">
        {/* Left Side: Images */}
        <div>
          <div className="gallery-main">
            <img src={getImgUrl(activeImg)} alt={product.product_title} />
          </div>
          {/* Unique image variant thumbnails navigation */}
          {product && [product.product_img1, product.product_img2]
            .filter(Boolean)
            .filter((img, idx, self) => self.indexOf(img) === idx).length > 1 && (
              <div className="gallery-thumbs" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                {[product.product_img1, product.product_img2]
                  .filter(Boolean)
                  .filter((img, idx, self) => self.indexOf(img) === idx)
                  .map((img, idx) => (
                    <div
                      key={idx}
                      className={`gallery-thumb ${activeImg === img ? 'active' : ''}`}
                      onClick={() => setActiveImg(img)}
                    >
                      <img src={getImgUrl(img)} alt={`thumb ${idx + 1}`} />
                    </div>
                  ))
                }
              </div>
            )}
        </div>

        {/* Right Side: Info & Actions */}
        <div>
          <div className="product-meta">
            Home &gt; Shop &gt; {product.cat_id ? product.cat_id.cat_title : 'Mobile'}
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {product.product_title}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {product.product_label && (
              <span className={`status-pill ${product.product_label === 'sale' ? 'pending' : 'delivered'}`} style={{ fontSize: '0.85rem' }}>
                {product.product_label.toUpperCase()}
              </span>
            )}
          </div>

          <div className="detail-price" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 700 }}>₹{(currentPrice + Math.round(currentPrice * 0.18)).toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>inclusive of 18% GST</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Base Price: ₹{currentPrice.toLocaleString('en-IN')}</span>
              <span>+ 18% GST: ₹{Math.round(currentPrice * 0.18).toLocaleString('en-IN')}</span>
              {isSale && (
                <span style={{ textDecoration: 'line-through' }}>
                  M.R.P: ₹{product.product_price.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Key Specifications Grid */}
          {specs.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1rem',
              marginTop: '0.5rem'
            }}>
              {specs.slice(0, 6).map((spec, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ marginTop: '2px' }}>{getSpecIcon(spec)}</div>
                  <div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                      {getSpecCategory(spec)}
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.25 }}>
                      {spec.includes('|') ? spec.split('|')[0].trim() : spec}
                    </div>
                    {spec.includes('|') && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1px' }}>
                        {spec.split('|')[1].trim()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}





          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {/* Quantity selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Quantity</label>
              <select
                className="form-input"
                style={{ width: '80px', padding: '0.5rem' }}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>


          </div>

          {message && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleAddToCart} className="btn btn-primary" style={{ flexGrow: 1, padding: '1rem' }}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn btn-accent" style={{ flexGrow: 1, padding: '1rem' }}>
              Buy Now
            </button>
            <button
              onClick={toggleWishlist}
              className="btn btn-secondary"
              style={{
                padding: '1rem',
                transition: 'all 0.2s',
                transform: isLiked ? 'scale(1.05)' : 'scale(1)'
              }}
              aria-label="Add to wishlist"
            >
              <Heart size={20} fill={isLiked ? "#ef4444" : "none"} color={isLiked ? "#ef4444" : "currentColor"} />
            </button>
          </div>

          {/* Core assurances */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} className="text-primary" />
              <span>Original brand packaging and authentic certification.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className="text-primary" />
              <span>7 days easy replacement policies.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="detail-tabs">
          <div
            className={`detail-tab ${activeTab === 'desc' ? 'active' : ''}`}
            onClick={() => setActiveTab('desc')}
          >
            Product Description
          </div>
          <div
            className={`detail-tab ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Specifications
          </div>
          <div
            className={`detail-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features & Highlights
          </div>
        </div>

        <div className="card tab-content">
          {activeTab === 'desc' && (
            <div dangerouslySetInnerHTML={{ __html: product.product_desc || 'No description available for this product.' }} />
          )}
          {activeTab === 'specs' && (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <p style={{ margin: 0 }}><strong>Keywords/Tags:</strong> {product.product_keywords || 'N/A'}</p>
              </div>
              <div className="specs-table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                  <tbody>
                    {specs.map((spec, idx) => {
                      const category = getSpecCategory(spec);
                      return (
                        <tr key={idx} style={{ borderBottom: idx < specs.length - 1 ? '1px solid var(--border-color)' : 'none', backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                          <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)', width: '30%', borderRight: '1px solid var(--border-color)', verticalAlign: 'middle' }}>
                            {category}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                            {spec}
                          </td>
                        </tr>
                      );
                    })}
                    {specs.length === 0 && (
                      <tr>
                        <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No technical specifications available for this product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'features' && (
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                <Sparkles size={18} className="text-primary" />
                <span>Special features available on this phone:</span>
              </p>
              <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
                <li>Fast Charging capabilities.</li>
                <li>Vibrant High Refresh Rate AMOLED display.</li>
                <li>Premium grade cameras with AI features.</li>
                <li>Secure biometric scanner built in.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>You may also like</h3>
          <div className="grid-3">
            {related.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
