import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getAllUsers as getAllUsersAuth, removeUser } from '../api/authService';
import { getAllUsers, deleteUser, updateUser } from '../api/userService';
import { getAllClaims, approveClaim, rejectClaim } from '../api/claimService';
import { getAllItems, getAllItemsForAdmin, updateItemStatus, deleteItem } from '../api/itemService';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'; 

const AdminSecurity = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get('view') || 'claims'); 
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]); 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const theme = {
    primary: "#003366",
    secondary: "#002244",
    accent: "#c5a059",
    success: "#28a745",
    danger: "#dc3545"
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch all data for dashboard statistics
      const [claimsResult, usersResult, itemsResult] = await Promise.all([
        getAllClaims().catch(e => ({ success: false, error: e })),
        getAllUsers().catch(e => ({ success: false, error: e })),
        getAllItemsForAdmin().catch(e => ({ success: false, error: e }))
      ]);

      if (claimsResult?.success) setClaims(Array.isArray(claimsResult.data) ? claimsResult.data : []);
      else console.error('Claims fetch failed:', claimsResult?.error || claimsResult);

      if (usersResult?.success) setUsers(Array.isArray(usersResult.data) ? usersResult.data : []);
      else console.error('Users fetch failed:', usersResult?.error || usersResult);

      if (itemsResult?.success) setItems(Array.isArray(itemsResult.data) ? itemsResult.data : []);
      else console.error('Items fetch failed:', itemsResult?.error || itemsResult);
    } catch (err) {
      console.error("Fetch Error:", err);
      setClaims([]);
      setUsers([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when view changes
  useEffect(() => {
    fetchData();
  }, [view]);

  // Sync view state with URL params
  useEffect(() => {
    const currentView = searchParams.get('view') || 'claims';
    setView(currentView);
  }, [searchParams]);

  // Update URL when view changes
  const handleViewChange = (newView) => {
    setSearchParams({ view: newView });
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this student account?")) return;
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        alert("User account removed successfully.");
      }
    } catch (err) {
      alert(err.message || "Failed to connect to server.");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const actionText = newStatus === 'approved' ? "APPROVE" : "REJECT";
    if (!window.confirm(`Are you sure you want to ${actionText} this claim?`)) return;
    const adminNote = prompt(`Optional: Add a note for the claimant (or press OK to skip):`) || '';

    try {
      const result = newStatus === 'approved'
        ? await approveClaim(id, adminNote)
        : await rejectClaim(id, adminNote);
      if (result.success) {
        alert(newStatus === 'approved' ? "Claim approved!" : "Claim rejected.");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Cannot connect to server.");
    }
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    const actionText = newStatus === 'approved' ? "APPROVE" : "REJECT";
    if (!window.confirm(`Are you sure you want to ${actionText} this item?`)) return;

    try {
      const result = await updateItemStatus(itemId, newStatus);
      if (result.success) {
        alert(newStatus === 'approved' ? "Item approved!" : "Item rejected.");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Cannot connect to server.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      const result = await deleteItem(itemId);
      if (result.success) {
        alert("Item deleted successfully.");
        fetchData();
      }
    } catch (err) {
      alert(err.message || "Cannot connect to server.");
    }
  };

  // Calculate chart data
  const itemsByCategory = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  
  const categoryChartData = Object.entries(itemsByCategory).map(([name, value]) => ({ name, value }));
  
  const claimsByStatus = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusChartData = [
    { name: 'Pending', value: claimsByStatus.pending || 0 },
    { name: 'Approved', value: claimsByStatus.approved || 0 },
    { name: 'Rejected', value: claimsByStatus.rejected || 0 }
  ];

  const COLORS = { Pending: '#ffc107', Approved: '#28a745', Rejected: '#dc3545' };

  const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;

  return (
        <>
        <div className="mb-5">
          <p className="text-muted m-0 small">Administrative Control Panel</p>
          <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>
            Dashboard Overview
          </h2>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 p-4 h-100" style={{ background: 'linear-gradient(135deg, #003366 0%, #002244 100%)', color: '#fff' }}>
              <h6 className="fw-bold m-0 opacity-75">Total Users</h6>
              <h2 className="fw-bold m-0 mt-2">{users.length}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 p-4 h-100" style={{ background: 'linear-gradient(135deg, #c5a059 0%, #a08040 100%)', color: '#003366' }}>
              <h6 className="fw-bold m-0 opacity-75">Total Items</h6>
              <h2 className="fw-bold m-0 mt-2">{items.length}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 p-4 h-100" style={{ background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', color: '#fff' }}>
              <h6 className="fw-bold m-0 opacity-75">Total Claims</h6>
              <h2 className="fw-bold m-0 mt-2">{claims.length}</h2>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 p-4 h-100" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', color: '#003366' }}>
              <h6 className="fw-bold m-0 opacity-75">Pending Claims</h6>
              <h2 className="fw-bold m-0 mt-2">{pendingClaimsCount}</h2>
            </div>
          </div>
        </div>

        
        <div className="row g-4 mb-5">
          <div className="col-md-8">
            <div className="card border-0 p-4 h-100">
              <h5 className="fw-bold mb-4" style={{ color: theme.primary }}>Items by Category</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill={theme.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 p-4 h-100">
              <h5 className="fw-bold mb-4" style={{ color: theme.primary }}>Claims by Status</h5>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} label>
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-muted m-0 small">Data Management</p>
          <h2 className="fw-bold m-0 mt-1" style={{ color: theme.primary }}>
            {view === 'users' ? 'User Accounts Control' : view === 'items' ? 'Item Management' : 'Claim Verification'}
          </h2>
        </div>

        <div className="d-flex gap-2 mb-4">
          <button className={`btn rounded-pill px-4 fw-bold ${view === 'claims' ? 'text-white' : 'btn-outline-secondary'}`}
            style={view === 'claims' ? { backgroundColor: theme.primary } : {}}
            onClick={() => handleViewChange('claims')}>
            Claims
          </button>
          <button className={`btn rounded-pill px-4 fw-bold ${view === 'items' ? 'text-white' : 'btn-outline-secondary'}`}
            style={view === 'items' ? { backgroundColor: theme.accent } : {}}
            onClick={() => handleViewChange('items')}>
            Items
          </button>
          <button className={`btn rounded-pill px-4 fw-bold ${view === 'users' ? 'text-white' : 'btn-outline-secondary'}`}
            style={view === 'users' ? { backgroundColor: theme.secondary } : {}}
            onClick={() => handleViewChange('users')}>
            Users
          </button>
        </div>

        <div className="card border-0 p-4 mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="small text-muted text-uppercase">
                <tr style={{ borderBottom: `2px solid ${theme.accent}33` }}>
                  {view === 'claims' && <th className="pb-3 border-0">Image</th>}
                  {view === 'items' && <th className="pb-3 border-0">Image</th>}
                  <th className="pb-3 border-0">{view === 'users' ? 'Student Name' : view === 'items' ? 'Item Name' : 'Item Name'}</th>
                  <th className="pb-3 border-0 text-center">{view === 'users' ? 'ID Number' : view === 'items' ? 'Posted By' : 'Claimer Name'}</th>
                  {view === 'claims' && <th className="pb-3 border-0 text-center">Proof</th>}
                  {view === 'items' && <th className="pb-3 border-0 text-center">Category</th>}
                  <th className="pb-3 border-0 text-center">Status</th>
                  <th className="pb-3 border-0 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={view === 'claims' ? 6 : view === 'items' ? 6 : 5} className="text-center py-5">Syncing data...</td></tr>
                ) : (
                  <>
                    {/* VIEW: USERS */}
                    {view === 'users' && (
                      users.length === 0 ? (
                        <tr><td colSpan="5">
                          <div className="claf-empty-state">
                            <div className="empty-icon">--</div>
                            <div className="empty-title">No registered users</div>
                            <div className="empty-text">User accounts will appear here once students register.</div>
                          </div>
                        </td></tr>
                      ) : (
                        users.map(u => (
                          <tr key={u._id}>
                            <td className="py-4 fw-bold" style={{ color: theme.primary }}>{u.name}</td>
                            <td className="text-center text-muted">{u.studentId || '---'}</td>
                            <td className="text-center">
                              <span className="badge bg-success-subtle text-success px-3 py-2">ACTIVE</span>
                            </td>
                            <td className="text-end">
                              <button onClick={() => handleRemoveUser(u._id)} className="btn btn-sm btn-outline-danger border-0">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )
                    )}

                    {/* VIEW: ITEMS */}
                    {view === 'items' && (
                      items.length === 0 ? (
                        <tr><td colSpan="6">
                          <div className="claf-empty-state">
                            <div className="empty-icon">--</div>
                            <div className="empty-title">No items found</div>
                            <div className="empty-text">Items will appear here once students report them.</div>
                          </div>
                        </td></tr>
                      ) : (
                        items.map((item) => (
                          <tr key={item._id}>
                            <td className="py-4">
                              {item.imageUrls && item.imageUrls.length > 0 && (
                                <img
                                  src={item.imageUrls[0]}
                                  alt={item.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                            </td>
                            <td className="py-4">
                              <strong style={{ color: theme.primary }}>{item.name || item.title}</strong>
                            </td>
                            <td className="text-center">
                              <div className="small">
                                <div className="fw-bold">{item.reportedBy?.name || 'Unknown'}</div>
                                {item.reportedBy?.email && (
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{item.reportedBy.email}</div>
                                )}
                              </div>
                            </td>
                            <td className="text-center small">{item.category}</td>
                            <td className="text-center">
                              <span className="badge px-3 py-2"
                                    style={{
                                      backgroundColor: item.status === 'pending' ? '#fff3cd' : item.status === 'approved' ? '#e5f9e0' : item.status === 'rejected' ? '#ffe5e5' : '#d1e7dd',
                                      color: item.status === 'pending' ? '#856404' : item.status === 'approved' ? theme.success : item.status === 'rejected' ? theme.danger : '#0f5132'
                                    }}>
                                {item.status}
                              </span>
                            </td>
                            <td className="text-end">
                              {item.status === 'pending' ? (
                                <div className="d-flex gap-2 justify-content-end">
                                  <button onClick={() => handleUpdateItemStatus(item._id, 'approved')} className="btn btn-sm btn-success px-3 border-0 fw-bold">Approve</button>
                                  <button onClick={() => handleUpdateItemStatus(item._id, 'rejected')} className="btn btn-sm btn-outline-danger px-3 border-0 bg-light fw-bold">Reject</button>
                                  <button onClick={() => handleDeleteItem(item._id)} className="btn btn-sm btn-danger px-3 border-0 fw-bold">Delete</button>
                                </div>
                              ) : (
                                <div className="d-flex gap-2 justify-content-end">
                                  <span className={`fw-bold small ${item.status === 'approved' ? 'text-success' : item.status === 'rejected' ? 'text-danger' : 'text-muted'}`}>
                                    {item.status === 'approved' ? 'Approved' : item.status === 'rejected' ? 'Rejected' : item.status}
                                  </span>
                                  <button onClick={() => handleDeleteItem(item._id)} className="btn btn-sm btn-outline-danger px-2 border-0 bg-light fw-bold">Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )
                    )}

                    {/* VIEW: CLAIMS */}
                    {view === 'claims' && (
                      claims.length === 0 ? (
                        <tr><td colSpan="6">
                          <div className="claf-empty-state">
                            <div className="empty-icon">--</div>
                            <div className="empty-title">No claims for review</div>
                            <div className="empty-text">When students submit claims, they will appear here for approval.</div>
                          </div>
                        </td></tr>
                      ) : (
                        claims.map((claim) => (
                          <tr key={claim._id}>
                            <td className="py-4">
                              {claim.itemId?.imageUrls && claim.itemId.imageUrls.length > 0 && (
                                <img
                                  src={claim.itemId.imageUrls[0]}
                                  alt={claim.itemId.name}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                            </td>
                            <td className="py-4">
                              <strong style={{ color: theme.primary }}>{claim.itemId?.name || 'Deleted Item'}</strong>
                            </td>
                            <td className="text-center text-muted">{claim.claimantId?.name || 'Unknown'}</td>
                            <td className="text-center small text-muted">{claim.message || 'No proof provided'}</td>
                            <td className="text-center">
                              <span className="badge px-3 py-2"
                                    style={{
                                      backgroundColor: claim.status === 'pending' ? '#fff3cd' : claim.status === 'approved' ? '#e5f9e0' : '#ffe5e5',
                                      color: claim.status === 'pending' ? '#856404' : claim.status === 'approved' ? theme.success : theme.danger
                                    }}>
                                {claim.status}
                              </span>
                            </td>
                            <td className="text-end">
                              {claim.status === 'pending' ? (
                                <div className="d-flex gap-2 justify-content-end">
                                  <button onClick={() => handleUpdateStatus(claim._id, 'approved')} className="btn btn-sm btn-success px-3 border-0 fw-bold">Approve</button>
                                  <button onClick={() => handleUpdateStatus(claim._id, 'rejected')} className="btn btn-sm btn-outline-danger px-3 border-0 bg-light fw-bold">Reject</button>
                                </div>
                              ) : (
                                <span className={`fw-bold small ${claim.status === 'approved' ? 'text-success' : 'text-danger'}`}>
                                  {claim.status === 'approved' ? 'Approved' : 'Rejected'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
  );
};

export default AdminSecurity;
