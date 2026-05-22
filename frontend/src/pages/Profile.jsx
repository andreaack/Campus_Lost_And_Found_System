import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserClaims } from '../api/claimService';
import { getMyItems, markRecovered } from '../api/itemService';

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [claims, setClaims] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [error, setError] = useState('');

  const theme = {
    primary: "#003366",
    secondary: "#002244",
    accent: "#c5a059",
    info: "#007bff",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#856404",
    warningBg: "#fff3cd",
    successBg: "#e5f9e0",
    dangerBg: "#ffe5e5"
  };

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const userId = user._id || user.id;
      const result = await getUserClaims(userId);
      if (result.success) setClaims(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    setItemsLoading(true);
    try {
      const result = await getMyItems();
      if (result.success) setMyItems(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.warn('My items fetch failed:', err.message);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleMarkRecovered = async (itemId) => {
    if (!window.confirm('Mark this item as recovered?')) return;
    try {
      const r = await markRecovered(itemId);
      if (r.success) {
        alert('Item marked as recovered!');
        fetchMyItems();
      }
    } catch (err) {
      alert(err.message || 'Action failed.');
    }
  };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchActivity();
    fetchMyItems();
  }, []);

  const statusStyle = (status) => ({
    backgroundColor:
      status === 'approved' ? theme.successBg :
      status === 'rejected' ? theme.dangerBg : theme.warningBg,
    color:
      status === 'approved' ? theme.success :
      status === 'rejected' ? theme.danger : theme.warning
  });

  return (
    <>
      <div className="mb-5">
        <p className="text-muted m-0 small">Account Settings</p>
        <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>My Profile</h2>
      </div>

      <div className="row g-4">
        {/* User Card */}
        <div className="col-md-4">
          <div className="card border-0 p-4 text-center h-100 bg-light">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto shadow-lg mb-4"
                 style={{ width: '100px', height: '100px', backgroundColor: theme.accent, fontSize: '36px' }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h4 className="fw-bold mb-1" style={{ color: theme.primary }}>{user?.name}</h4>
            <p className="text-muted small mb-1">{user?.email}</p>
            <p className="text-muted small mb-3 text-capitalize">
              {user?.role === 'admin' ? 'System Administrator' : `Student ID: ${user?.studentId || 'N/A'}`}
            </p>
            <span className="badge text-success px-4 py-2" style={{ backgroundColor: theme.successBg }}>
              Verified User
            </span>
          </div>
        </div>

        {/* Claim Activity */}
        <div className="col-md-8">
          <div className="card border-0 p-4 mb-4">
            <h5 className="fw-bold mb-4" style={{ color: theme.primary }}>My Claim Requests</h5>
            {error && <div className="alert alert-danger py-2">{error} <button className="btn btn-sm btn-link" onClick={fetchActivity}>Retry</button></div>}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="small text-muted text-uppercase">
                  <tr>
                    <th className="pb-3 border-0">Item</th>
                    <th className="pb-3 border-0 text-center">Date</th>
                    <th className="pb-3 border-0 text-end">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
                  ) : claims.length > 0 ? (
                    claims.map((claim) => (
                      <tr key={claim._id}>
                        <td className="py-3">
                          <strong style={{ color: theme.primary }}>
                            {claim.item?.name || claim.itemId?.name || 'Deleted Item'}
                          </strong>
                          <br />
                          <small className="text-muted">{claim.item?.category || claim.itemId?.category}</small>
                        </td>
                        <td className="small text-muted text-center">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-end">
                          <span className="badge px-3 py-2 text-uppercase" style={statusStyle(claim.status)}>
                            {claim.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="text-center py-4 text-muted">No claim requests yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* My Reported Items */}
          <div className="card border-0 p-4">
            <h5 className="fw-bold mb-4" style={{ color: theme.primary }}>My Reported Items</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="small text-muted text-uppercase">
                  <tr>
                    <th className="pb-3 border-0">Item</th>
                    <th className="pb-3 border-0 text-center">Type</th>
                    <th className="pb-3 border-0 text-center">Status</th>
                    <th className="pb-3 border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsLoading ? (
                    <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
                  ) : myItems.length > 0 ? (
                    myItems.map((item) => (
                      <tr key={item._id} style={{ cursor: 'pointer' }}>
                        <td className="py-3" onClick={() => navigate(`/item-detail/${item._id}`)}>
                          <strong style={{ color: theme.primary }}>{item.name}</strong>
                          <br />
                          <small className="text-muted">{item.category}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge" style={{ backgroundColor: item.type === 'lost' ? '#fde8e8' : '#e8f5e9', color: item.type === 'lost' ? '#c62828' : '#2e7d32' }}>
                            {item.type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="badge px-3 py-2 text-uppercase" style={statusStyle(item.status === 'approved' ? 'approved' : item.status === 'recovered' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending')}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {(item.status === 'approved' || item.status === 'pending') && (
                            <button
                              onClick={() => handleMarkRecovered(item._id)}
                              className="btn btn-sm fw-bold"
                              style={{ backgroundColor: theme.successBg, color: theme.success, border: 'none' }}>
                              Mark Recovered
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="text-center py-4 text-muted">No reported items yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
