import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import clafLogo from '../assets/claf.png';
import { getItems, createItem, getMyItems } from '../api/itemService';
import { submitClaim, getUserClaims } from '../api/claimService';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';

// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.search, filters.category, filters.status, filters.start, filters.end]);

  useEffect(() => {
    fetchMyItems();
  }, []);

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
        alert("Report submitted successfully! It will appear in the gallery.");
        setIsModalOpen(false);
        fetchItems();
        fetchMyItems();
        setNewItem({ title: '', description: '', category: 'electronics', location: '', status: 'Lost', dateFound: new Date().toISOString().split('T')[0] });
        setImageFiles([]);
        setImagePreviews([]);
      }
    } catch (err) {
      alert(err?.error?.message || err?.message || "Error submitting report.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const theme = { primary: "#003366", secondary: "#002244", accent: "#c5a059", success: "#28a745" };
  const resetFilters = () => setFilters({ search: "", category: "All Categories", location: "All Locations", status: "All Status", start: "", end: "" });

  return (
    <div className="container-fluid vh-100 p-0 d-flex bg-light text-dark overflow-hidden">
      <Sidebar user={user} darkMode={darkMode} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 p-md-5 overflow-auto bg-white">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <p className="text-muted m-0 small">Welcome to the Item Hunters Portal</p>
            <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>Item Gallery</h2>
          </div>
          <button className="btn fw-bold rounded-pill px-4 shadow-sm text-white border-0" style={{ backgroundColor: theme.primary }} onClick={() => setIsModalOpen(true)}>
            + Report New Item
          </button>
        </div>
        <div className="d-flex gap-2 mb-4">
          <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'all' ? 'text-white' : 'btn-outline-secondary'}`} style={activeTab === 'all' ? { backgroundColor: theme.primary } : {}} onClick={() => setActiveTab('all')}>
            All Items
          </button>
          <button className={`btn rounded-pill px-4 fw-bold ${activeTab === 'mine' ? 'text-white' : 'btn-outline-secondary'}`} style={activeTab === 'mine' ? { backgroundColor: theme.accent } : {}} onClick={() => setActiveTab('mine')}>
            My Reports ({myItems.length})
          </button>
        </div>
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
                    <tr key={item._id} onClick={() => navigate(`/item-detail/${item._id}`)} style={{ cursor: 'pointer', opacity: isRecovered ? 0.7 : 1, backgroundColor: isRecovered ? '#f8f9fa' : 'transparent' }}>
                      <td className="px-4 py-3 position-relative">
                        <div className="d-flex align-items-center gap-2">
                          <div className="fw-bold" style={{ color: isRecovered ? '#6c757d' : theme.primary }}>{item.name}</div>
                          {isRecovered && <span className="badge bg-success-subtle text-success small border border-success-subtle">RECOVERED</span>}
                          {item.status === 'pending' && <span className="badge bg-warning-subtle text-warning small border border-warning-subtle">PENDING</span>}
                        </div>
                        <div className="small text-muted text-truncate" style={{maxWidth: '250px'}}>{item.description}</div>
                      </td>
                      <td className="text-center small">{item.category}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${isRecovered ? 'bg-secondary text-white' : item.type === 'lost' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                          {item.type?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-end small text-muted">{new Date(item.dateLostFound).toLocaleDateString()}</td>
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
                  <input type="text" className="form-control bg-light border-0" placeholder="What did you lose/find?" required value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                </div>
                <div className="mb-3">
                  <label className="small fw-bold text-muted">DESCRIPTION</label>
                  <textarea className="form-control bg-light border-0" rows="2" placeholder="Provide details..." required value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})}></textarea>
                </div>
                <div className="mb-3">
                  <label className="small fw-bold text-muted">IMAGES (Max 3)</label>
                  <input type="file" className="form-control bg-light border-0" accept="image/*" multiple onChange={handleImageChange} />
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 d-flex gap-2">
                      {imagePreviews.map((preview, index) => <img key={index} src={preview} alt={`Preview ${index}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />)}
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
                    <input type="text" className="form-control bg-light border-0" placeholder="Where?" required value={newItem.location} onChange={(e) => setNewItem({...newItem, location: e.target.value})} />
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
                    <input type="date" className="form-control bg-light border-0" value={newItem.dateFound} onChange={(e) => setNewItem({...newItem, dateFound: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="btn w-100 fw-bold text-white py-2 rounded-pill shadow" style={{ backgroundColor: theme.primary }}>Submit Report</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ItemDetail Component
const ItemDetail = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const item = location.state?.item;
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!item) {
      navigate('/dashboard');
    }
  }, [item, navigate]);

  const theme = { primary: "#003366", secondary: "#002244", accent: "#c5a059", success: "#28a745", danger: "#dc3545", mutedbg: "rgba(255, 255, 255, 0.7)" };
  const isRecovered = item?.status?.toLowerCase() === 'claimed';

  const handleClaim = async () => {
    if (!user) {
      alert("Please log in to claim items.");
      return;
    }
    if (isRecovered) {
      alert("This item has already been recovered by its owner.");
      return;
    }
    const isConfirmed = window.confirm(`CONFIRM CLAIM: You are submitting a claim as ${user.name.toUpperCase()}.\n\nIs this information correct?`);
    if (!isConfirmed) return;
    const proof = prompt("VERIFICATION: Briefly describe a unique mark, content, or detail of this item to prove ownership:");
    if (!proof || proof.trim() === "") {
      alert("Claim cancelled. You must provide proof of ownership.");
      return;
    }
    setLoading(true);
    try {
      const payload = { itemId: item._id, claimerName: user.name, claimerId: user.studentId || user._id || user.id, proof: proof };
      const result = await submitClaim(payload);
      if (result.success) {
        alert("Claim request sent! Once approved, the item will be marked as RECOVERED. ✅");
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.message || "Failed to submit claim. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!item) return null;

  return (
    <div className="container-fluid vh-100 p-0 d-flex bg-light text-dark overflow-hidden">
      <Sidebar user={user} darkMode={darkMode} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 p-md-5 overflow-auto bg-white">
        <div className="mb-5 d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted m-0 small">Item Specification</p>
            <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>Item Details</h2>
          </div>
          <span className="badge px-4 py-2 mt-2" style={{ backgroundColor: isRecovered ? theme.success : (item.status.toLowerCase() === 'found' ? '#e5f9e0' : '#ffe5e5'), color: isRecovered ? '#fff' : (item.status.toLowerCase() === 'found' ? theme.success : theme.danger), border: isRecovered ? 'none' : `1px solid ${item.status.toLowerCase() === 'found' ? theme.success : theme.danger}` }}>
            {isRecovered ? 'RECOVERED' : `${item.status.toUpperCase()} ITEM`}
          </span>
        </div>
        <div className="row g-4">
          <div className="col-md-5">
            <div className="card border-0 h-100 d-flex align-items-center justify-content-center p-5 text-center bg-light">
              <img src={isRecovered ? "https://img.icons8.com/isometric/100/checked-user-male.png" : "https://img.icons8.com/isometric/100/camera.png"} alt="Status Icon" className="mb-4 opacity-75" style={{ width: '80px' }} />
              <h6 className="fw-bold text-muted">{isRecovered ? 'Item Successfully Returned' : 'No Photo Available'}</h6>
              <p className="small text-muted px-3">{isRecovered ? 'This record is kept for administrative transparency and proof of recovery.' : 'Images are only visible to authorized personnel for security and privacy reasons.'}</p>
            </div>
          </div>
          <div className="col-md-7">
            <div className="card border-0 p-4 h-100" style={{ backgroundColor: theme.mutedbg }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold m-0" style={{ color: theme.primary }}>{item.title}</h3>
                <span className="small text-muted fw-bold bg-white px-2 py-1 rounded shadow-sm border">ID: #{item._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="mb-4 small text-muted d-flex gap-4 flex-wrap">
                <span>Location: {item.location}</span>
                <span>Date: {new Date(item.dateFound).toLocaleDateString()}</span>
                <span>Category: {item.category}</span>
              </div>
              <hr className="my-3 opacity-10" />
              <div className="mb-4">
                <label className="small fw-bold text-muted mb-2 text-uppercase d-block">Public Description</label>
                <div className="bg-white rounded-3 p-3 border shadow-sm" style={{ minHeight: '100px' }}>
                  <p className="m-0 text-dark" style={{ lineHeight: '1.6' }}>{item.description}</p>
                </div>
              </div>
              <div className="alert border-0 rounded-3 mb-5" style={{ backgroundColor: isRecovered ? '#e5f9e0' : '#fff3cd', color: isRecovered ? theme.success : '#856404' }}>
                <div className="d-flex align-items-center gap-2 fw-bold small">{isRecovered ? 'TRANSACTION COMPLETED: Item returned to its rightful owner.' : 'NOTE: Claiming items requires verification and proof of ownership.'}</div>
              </div>
              <div className="mt-auto">
                <button onClick={handleClaim} disabled={loading || isRecovered} className="btn w-100 fw-bold py-3 text-white shadow-sm border-0" style={{ backgroundColor: isRecovered ? '#6c757d' : theme.primary, cursor: isRecovered ? 'not-allowed' : 'pointer', opacity: isRecovered ? 0.8 : 1 }}>
                  {loading ? 'Processing...' : isRecovered ? 'ALREADY RECOVERED' : 'Claim This Item'}
                </button>
                {isRecovered && <p className="text-center small mt-2 text-muted fw-bold">This item is no longer available for claim.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const Profile = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user'));
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = { primary: "#003366", secondary: "#002244", accent: "#c5a059", info: "#007bff", success: "#28a745", danger: "#dc3545", warning: "#856404", warningBg: "#fff3cd", successBg: "#e5f9e0", dangerBg: "#ffe5e5" };

  const fetchActivity = async () => {
    try {
      const userId = user.studentId || user._id || user.id;
      const result = await getUserClaims(userId);
      if (result.success) {
        setActivities(result.data);
      }
    } catch (err) {
      console.error("Activity Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivity();
      const interval = setInterval(fetchActivity, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container-fluid vh-100 p-0 d-flex bg-light text-dark overflow-hidden">
      <Sidebar user={user} darkMode={darkMode} toggleTheme={toggleTheme} onLogout={handleLogout} />
      <div className="flex-grow-1 p-4 p-md-5 overflow-auto bg-white">
        <div className="mb-5">
          <p className="text-muted m-0 small">Account Settings</p>
          <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>My Profile</h2>
        </div>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 p-4 text-center h-100 bg-light">
              <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto shadow-lg mb-4" style={{ width: '100px', height: '100px', backgroundColor: theme.accent, fontSize: '36px' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <h4 className="fw-bold mb-1" style={{ color: theme.primary }}>{user?.name}</h4>
              <p className="text-muted small mb-3 text-capitalize">{user?.role === 'admin' ? 'System Administrator' : `Student ID: ${user?.studentId || 'N/A'}`}</p>
              <span className="badge text-success px-4 py-2" style={{ backgroundColor: theme.successBg }}>Verified User</span>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card border-0 p-4">
              <h5 className="fw-bold mb-4" style={{ color: theme.primary }}>Recent System Activity</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="small text-muted text-uppercase">
                    <tr>
                      <th className="pb-3 border-0">Item Name</th>
                      <th className="pb-3 border-0 text-center">Date</th>
                      <th className="pb-3 border-0 text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="3" className="text-center py-4">Loading Activity...</td></tr>
                    ) : activities.length > 0 ? (
                      activities.map((claim) => (
                        <tr key={claim._id}>
                          <td className="py-3">
                            <strong style={{ color: theme.primary }}>{claim.itemId?.title || "Deleted Item"}</strong>
                            <br /><small className="text-muted">{claim.itemId?.category}</small>
                          </td>
                          <td className="small text-muted text-center">{new Date(claim.createdAt).toLocaleDateString()}</td>
                          <td className="text-end">
                            <span className="badge px-3 py-2 text-uppercase" style={{ backgroundColor: claim.status === 'approved' ? theme.successBg : claim.status === 'rejected' ? theme.dangerBg : theme.warningBg, color: claim.status === 'approved' ? theme.success : claim.status === 'rejected' ? theme.danger : theme.warning }}>
                              {claim.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="3">
                        <div className="claf-empty-state">
                          <div className="empty-icon">--</div>
                          <div className="empty-title">No activity yet</div>
                          <div className="empty-text">Your claim requests will appear here.</div>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Dashboard, ItemDetail, Profile };
