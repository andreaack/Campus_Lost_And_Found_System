import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getItems, createItem, getMyItems } from '../api/itemService';
import SearchFilters from '../components/SearchFilters'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'electronics',
    location: '',
    status: 'Lost',
    dateFound: new Date().toISOString().split('T')[0]
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [filters, setFilters] = useState({
    search: "", category: "All Categories", location: "All Locations", status: "All Status", start: "", end: ""
  });

  // ─── FETCH ITEMS LOGIC ──────────────────────────────────────
  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await getItems(filters);
      if (result.success) {
        setInventory(result.data);
      }
    } catch (error) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const result = await getMyItems();
      if (result.success) {
        setMyItems(result.data);
      }
    } catch (error) {
      console.error("My Items Error:", error.message);
    }
  };

  // Initial load - fetch both items and my items
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchItems(), fetchMyItems()]);
      } catch (error) {
        console.error("Initial Load Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Debounced filter changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 100);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.search, filters.category, filters.status, filters.start, filters.end]);

  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert("Maximum 3 images allowed.");
      return;
    }
    setImageFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Session expired.");
    if (loading) return; // Prevent multiple submissions

    setLoading(true);

    const formData = new FormData();
    formData.append('type', newItem.status.toLowerCase());
    formData.append('name', newItem.title);
    formData.append('description', newItem.description);
    formData.append('category', newItem.category);
    formData.append('location', newItem.location);
    formData.append('dateLostFound', new Date(newItem.dateFound).toISOString());

    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const data = await createItem(formData);
      if (data.success) {
        // Optimistic UI update - add new item to inventory immediately
        if (data.data) {
          setInventory(prev => [data.data, ...prev]);
          setMyItems(prev => [data.data, ...prev]);
        }
        // Close modal and reset form
        setIsModalOpen(false);
        setNewItem({
          title: '', description: '', category: 'electronics',
          location: '', status: 'Lost', dateFound: new Date().toISOString().split('T')[0]
        });
        setImageFiles([]);
        setImagePreviews([]);
        // Refresh data from server to ensure consistency
        await Promise.all([fetchItems(), fetchMyItems()]);
        alert("Report submitted successfully! It will appear in the gallery.");
      }
    } catch (err) {
      alert(err?.error?.message || err?.message || "Error submitting report.");
    } finally {
      setLoading(false);
    }
  };

  const theme = { primary: "#003366", secondary: "#002244", accent: "#c5a059", success: "#28a745" };
  const resetFilters = () => setFilters({ search: "", category: "All Categories", location: "All Locations", status: "All Status", start: "", end: "" });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <p className="text-muted m-0 small">Welcome to the Item Hunters Portal</p>
          <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>Item Gallery</h2>
        </div>
        <button className="btn fw-bold rounded-pill px-4 shadow-sm text-white border-0" 
          style={{ backgroundColor: theme.primary }} onClick={() => setIsModalOpen(true)}>
          + Report New Item
        </button>
      </div>

      <div className="d-flex gap-2 mb-4">
        <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'all' ? 'text-white' : 'btn-outline-secondary'}`}
          style={activeTab === 'all' ? { backgroundColor: theme.primary } : {}}
          onClick={() => setActiveTab('all')}>
          All Items
        </button>
        <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'mine' ? 'text-white' : 'btn-outline-secondary'}`}
          style={activeTab === 'mine' ? { backgroundColor: theme.accent } : {}}
          onClick={() => setActiveTab('mine')}>
          My Reports ({myItems.length})
        </button>
      </div>

      <SearchFilters
        onSearch={(values) => {
          setFilters(prev => ({ ...prev, search: values.keyword, category: values.category, location: values.location }));
          fetchItems();
        }}
        onClear={() => {
          resetFilters();
          fetchItems();
        }}
      />

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3">ITEM DETAILS</th>
              <th className="text-center">CATEGORY</th>
              <th className="text-center">STATUS</th>
              <th className="text-end px-4">DATE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-5">Loading...</td></tr>
            ) : (activeTab === 'mine' ? myItems : inventory).length > 0 ? (
              (activeTab === 'mine' ? myItems : inventory).map((item) => {
                const isRecovered = item.status.toLowerCase() === 'recovered';
                return (
                  <tr 
                    key={item._id} 
                    onClick={() => navigate(`/item-detail/${item._id}`)} 
                    style={{ 
                      cursor: 'pointer',
                      opacity: isRecovered ? 0.7 : 1,
                      backgroundColor: isRecovered ? '#f8f9fa' : 'transparent'
                    }}
                  >
                    <td className="px-4 py-3 position-relative">
                      <div className="d-flex align-items-center gap-3">
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <img 
                            src={item.imageUrls[0]} 
                            alt={item.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <div>
                          <div className="fw-bold" style={{ color: isRecovered ? '#6c757d' : theme.primary }}>
                            {item.name}
                          </div>
                          {isRecovered && (
                            <span className="badge bg-success-subtle text-success small border border-success-subtle">
                              RECOVERED
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="badge bg-warning-subtle text-warning small border border-warning-subtle">
                              PENDING
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="small text-muted text-truncate" style={{maxWidth: '250px'}}>{item.description}</div>
                    </td>
                    <td className="text-center small">{item.category}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill px-3 py-2 ${
                        isRecovered 
                        ? 'bg-secondary text-white' 
                        : item.type === 'lost' 
                        ? 'bg-danger-subtle text-danger' 
                        : 'bg-success-subtle text-success'
                      }`}>
                        {item.type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end small text-muted">
                      {new Date(item.dateLostFound).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="4">
                <div className="claf-empty-state">
                  <div className="empty-icon">--</div>
                  <div className="empty-title">No items found</div>
                  <div className="empty-text">Be the first to report a lost or found item on campus.</div>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 rounded-4 border-0 shadow-lg">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold m-0" style={{ color: theme.primary }}>Report Item</h4>
                <button className="btn-close" onClick={() => setIsModalOpen(false)}></button>
              </div>
              <form onSubmit={handleItemSubmit}>
                <div className="mb-3">
                  <label className="small fw-bold text-muted">TITLE</label>
                  <input type="text" className="form-control bg-light border-0" placeholder="What did you lose/find?" required
                        value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="small fw-bold text-muted">DESCRIPTION</label>
                  <textarea className="form-control bg-light border-0" rows="2" placeholder="Provide details..." required
                            value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})}></textarea>
                </div>
                <div className="mb-3">
                  <label className="small fw-bold text-muted">IMAGES (Max 3)</label>
                  <input type="file" className="form-control bg-light border-0" accept="image/*" multiple
                        onChange={handleImageChange} />
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 d-flex gap-2">
                      {imagePreviews.map((preview, index) => (
                        <img key={index} src={preview} alt={`Preview ${index}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">CATEGORY</label>
                    <select className="form-select bg-light border-0" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})}>
                      <option value="electronics">Electronics</option>
                      <option value="clothing">Clothing</option>
                      <option value="documents">Documents</option>
                      <option value="accessories">Accessories</option>
                      <option value="bags">Bags</option>
                      <option value="keys">Keys</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">LOCATION</label>
                    <input type="text" className="form-control bg-light border-0" placeholder="Where?" required
                          value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} />
                  </div>
                </div>
                <div className="row g-2 mb-4">
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">STATUS</label>
                    <select className="form-select bg-light border-0" value={newItem.status} onChange={(e) => setNewItem({...newItem, status: e.target.value})}>
                      <option value="Lost">Lost</option>
                      <option value="Found">Found</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">DATE</label>
                    <input type="date" className="form-control bg-light border-0"
                          value={newItem.dateFound} onChange={(e) => setNewItem({...newItem, dateFound: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn w-100 fw-bold text-white py-2 rounded-pill shadow" style={{ backgroundColor: theme.primary }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
