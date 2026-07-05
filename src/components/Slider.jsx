import { API_BASE_URL } from '../config';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Slider = ({ slides }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="carousel-wrapper">
      {slides.map((slide, index) => {
        const bgImg = slide.slide_image.startsWith('http')
          ? slide.slide_image
          : `${API_BASE_URL}/uploads/${slide.slide_image}`;
        
        return (
          <div
            key={slide._id}
            className={`carousel-slide ${index === current ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${bgImg})`,
              backgroundSize: 'auto 100%',
              backgroundPosition: 'right center',
              backgroundColor: '#ffffff'
            }}
          >
            <div className="carousel-overlay-light">
              <h2 className="carousel-title">
                {slide.slide_name}
              </h2>
              <p className="carousel-desc">
                {slide.slide_name.toLowerCase().includes('iphone')
                  ? 'Titanium design, A17 Pro chip, Action button. Experience the power of the ultimate iPhone.'
                  : slide.slide_name.toLowerCase().includes('flip')
                  ? 'Pocket-sized perfection. Flex your style with the revolutionary cover window and folding design.'
                  : slide.slide_name.toLowerCase().includes('x100')
                  ? 'Co-engineered with ZEISS. Capture professional-grade portraits and cinematic details like never before.'
                  : slide.slide_name.toLowerCase().includes('find')
                  ? 'Flagship performance meets sleek design. Experience premium foldable tech.'
                  : slide.slide_name.toLowerCase().includes('s23')
                  ? 'Epic photos, powerful gaming, and sleek design. The fan-favorite flagship experience.'
                  : slide.slide_name.toLowerCase().includes('realme')
                  ? 'Speed meets style. Experience next-level performance and eye-catching aesthetics.'
                  : 'Discover the ultimate smart cart experience. Buy original branded mobiles at best deals.'}
              </p>
              <Link to="/shop" className="btn btn-primary" style={{ width: 'fit-content' }}>
                Shop Now
              </Link>
            </div>
          </div>
        );
      })}

      <button onClick={prevSlide} className="carousel-btn carousel-btn-prev" aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextSlide} className="carousel-btn carousel-btn-next" aria-label="Next slide">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
