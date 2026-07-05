import React from 'react';

export const Sidebar = ({ categories, selectedCat, setSelectedCat }) => {
  return (
    <div className="card sidebar-filter">
      <div>
        <h3 className="filter-section-title">Filter by Brand</h3>
        <ul className="filter-list">
          <li
            className={`filter-item ${selectedCat === '' ? 'active' : ''}`}
            onClick={() => setSelectedCat('')}
          >
            All Brands
          </li>
          {categories.map((cat) => (
            <li
              key={cat._id}
              className={`filter-item ${selectedCat === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat._id)}
            >
              {cat.cat_title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
