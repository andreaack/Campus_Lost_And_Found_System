import React, { useState } from 'react';

const SearchFilters = ({ onSearch, onClear }) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [location, setLocation] = useState('All Locations');

  const categories = ['All Categories', 'Electronics', 'Clothing', 'Bags', 'Accessories', 'Documents', 'Keys', 'Others'];
  const locations = ['All Locations', 'Canteen', '3rd Floor Main Building', 'Library', 'Gym', 'Parking Lot', 'Laboratory', 'Classroom', 'Others'];

  const handleApply = () => {
    onSearch({ keyword, category, location });
  };

  const handleClear = () => {
    setKeyword('');
    setCategory('All Categories');
    setLocation('All Locations');
    onClear();
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-light">
      <div className="row g-3 align-items-end">
        <div className="col-md-4">
          <label className="form-label fw-bold small text-muted text-uppercase mb-2">Search Keyword</label>
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="Search items..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold small text-muted text-uppercase mb-2">Category</label>
          <select className="form-select rounded-3" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label fw-bold small text-muted text-uppercase mb-2">Location</label>
          <select className="form-select rounded-3" value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
        <div className="col-md-2 d-flex gap-2">
          <button className="btn btn-outline-secondary rounded-3 flex-grow-1 fw-bold" onClick={handleClear}>Clear</button>
          <button className="btn text-white rounded-3 flex-grow-1 fw-bold" style={{ backgroundColor: '#003366' }} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
