import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import clafLogo from '../assets/claf.png';
import { submitClaim, getClaimsForItem } from '../api/claimService';
import { getItemById, deleteItem, markRecovered } from '../api/itemService';
import { useTheme } from '../context/ThemeContext';

// Design System
const theme = {
  primary: '#1E3A8A',
  navy: '#0F172A',
  white: '#FFFFFF',
  gold: '#D4AF37',
  goldLight: '#FEF3C7',
  cream: '#FFFBF0',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
};

const ItemDetail = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [itemClaims, setItemClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [hasPendingClaim, setHasPendingClaim] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const isOwner = user && item?.reportedBy && (
    (typeof item.reportedBy === 'object' ? item.reportedBy._id : item.reportedBy) === (user._id || user.id)
  );
  const isAdmin = user?.role === 'admin';

  const fetchItem = async () => {
    setFetching(true);
    setError('');
    try {
      const result = await getItemById(id);
      if (result.success) setItem(result.data);
      else setError('Item not found');
    } catch (err) {
      setError(err.message || 'Failed to load item');
    } finally {
      setFetching(false);
    }
  };

  const fetchItemClaims = async () => {
    try {
      const result = await getClaimsForItem(id);
      if (result.success) {
        const claims = Array.isArray(result.data) ? result.data : [];
        setItemClaims(claims);
        setHasPendingClaim(claims.some(c => c.status === 'pending' && (c.claimant?._id === (user?._id || user?.id) || c.userId === (user?._id || user?.id))));
      }
    } catch (err) {
      // claims fetch failure shouldn't block page
      console.warn('Claims fetch failed:', err.message);
    }
  };

  useEffect(() => {
    if (!id) { navigate('/dashboard'); return; }
    fetchItem();
    fetchItemClaims();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      const r = await deleteItem(id);
      if (r.success) { alert('Item deleted.'); navigate('/dashboard'); }
    } catch (err) { alert(err.message || 'Delete failed.'); }
  };

  const handleMarkRecovered = async () => {
    if (!window.confirm('Mark this item as recovered?')) return;
    try {
      const r = await markRecovered(id);
      if (r.success) { alert('Item marked as recovered.'); fetchItem(); }
    } catch (err) { alert(err.message || 'Action failed.'); }
  };

  // Helper function para malaman kung ang item ay recovered na
  const isRecovered = item?.status?.toLowerCase() === 'recovered' || item?.status?.toLowerCase() === 'claimed';

  const handleClaim = async () => {
    if (!user) {
        alert("Please log in to claim items.");
        return;
    }

    if (isRecovered) {
        alert("This item has already been recovered by its owner.");
        return;
    }

    const claimerName = prompt("Enter your name to confirm this claim:", user.name);
    if (!claimerName || claimerName.trim() === "") {
        alert("Claim cancelled. Name is required.");
        return;
    }

    const proof = prompt("Briefly describe a unique mark or detail of this item to prove ownership:");
    if (!proof || proof.trim() === "") {
        alert("Claim cancelled. Proof of ownership is required.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        itemId: item._id,
        message: proof,
        verificationAnswers: [{ question: 'Proof of ownership', answer: proof }]
      };

      console.log('Submitting claim payload:', payload);
      const result = await submitClaim(payload);
      console.log('Claim result:', result);

      if (result.success) {
        alert("Claim request submitted successfully! Your claim is now pending admin approval. ✅");
        fetchItemClaims();
      } else {
        alert(result.message || "Claim submission failed.");
      }
    } catch (err) {
      console.error('Claim error:', err);
      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || "Failed to submit claim.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading item…</div>;
  if (error) return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <p style={{ color: theme.danger, marginBottom: 16 }}>{error}</p>
      <button onClick={fetchItem} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: theme.primary, color: '#fff', cursor: 'pointer' }}>Retry</button>
    </div>
  );
  if (!item) return null;

  return (
    <div style={styles.mainContent}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <p style={styles.headerSubtitle}>Item Specification</p>
            <h1 style={styles.headerTitle}>Item Details</h1>
          </div>
          <div style={styles.statusBadge}>
            {isRecovered ? 'RECOVERED' : `${item.status.toUpperCase()} ITEM`}
          </div>
        </div>

        {/* Content Grid */}
        <div style={styles.contentGrid}>
          {/* Left: Image Gallery */}
          <div style={styles.imageSection}>
            <div style={styles.imageCard}>
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <div style={styles.imageGallery}>
                  {item.imageUrls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${item.name} - Image ${index + 1}`}
                      style={{
                        ...styles.image,
                        ...(index === 0 ? styles.primaryImage : styles.thumbnailImage)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={styles.noImage}>
                  <div style={styles.noImageIcon}>📷</div>
                  <p style={styles.noImageText}>No Photo Available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Item Information */}
          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              {/* Title and ID */}
              <div style={styles.infoHeader}>
                <h2 style={styles.itemTitle}>{item.title || item.name}</h2>
                <div style={styles.itemIdBadge}>
                  ID #{item._id.slice(-6).toUpperCase()}
                </div>
              </div>

              {/* Poster Information */}
              {item.reportedBy && (
                <div style={styles.posterInfo}>
                  <span style={styles.posterLabel}>Posted by:</span>
                  <span style={styles.posterName}>
                    {typeof item.reportedBy === 'object' ? item.reportedBy.name : 'Anonymous'}
                  </span>
                  {typeof item.reportedBy === 'object' && item.reportedBy.email && (
                    <span style={styles.posterEmail}>{item.reportedBy.email}</span>
                  )}
                </div>
              )}

              {/* Metadata Chips */}
              <div style={styles.metadataContainer}>
                <div style={styles.metadataChip}>
                  <span style={styles.metadataLabel}>Location</span>
                  <span style={styles.metadataValue}>{item.location}</span>
                </div>
                <div style={styles.metadataChip}>
                  <span style={styles.metadataLabel}>Date</span>
                  <span style={styles.metadataValue}>{new Date(item.dateLostFound || item.dateFound).toLocaleDateString()}</span>
                </div>
                <div style={styles.metadataChip}>
                  <span style={styles.metadataLabel}>Category</span>
                  <span style={styles.metadataValue}>{item.category}</span>
                </div>
              </div>

              <div style={styles.divider}></div>

              {/* Description */}
              <div style={styles.descriptionSection}>
                <label style={styles.sectionLabel}>Public Description</label>
                <div style={styles.descriptionCard}>
                  <p style={styles.descriptionText}>{item.description}</p>
                </div>
              </div>

              {/* Warning Note */}
              <div style={{
                ...styles.warningBox,
                backgroundColor: isRecovered ? theme.gray[100] : theme.warningLight,
                borderColor: isRecovered ? theme.gray[300] : theme.warning
              }}>
                <div style={styles.warningContent}>
                  <span style={styles.warningIcon}>⚠</span>
                  <span style={styles.warningText}>
                    {isRecovered
                      ? 'TRANSACTION COMPLETED: Item returned to its rightful owner.'
                      : 'NOTE: Claiming items requires verification and proof of ownership. Your claim will be reviewed by an admin before approval.'}
                  </span>
                </div>
              </div>

              {/* Claim Button */}
              <div style={styles.actionSection}>
                <button
                  onClick={handleClaim}
                  disabled={loading || isRecovered}
                  style={{
                    ...styles.claimButton,
                    backgroundColor: isRecovered ? theme.gray[400] : theme.primary,
                    cursor: isRecovered ? 'not-allowed' : 'pointer',
                    opacity: isRecovered ? 0.7 : 1
                  }}
                >
                  {loading ? 'Processing...' : isRecovered ? 'ALREADY RECOVERED' : 'Claim This Item'}
                </button>

                {hasPendingClaim && !isRecovered && (
                  <p style={{ ...styles.recoveredNote, color: theme.warning }}>
                    You already have a pending claim on this item.
                  </p>
                )}

                {isRecovered && (
                  <p style={styles.recoveredNote}>
                    This item is no longer available for claim.
                  </p>
                )}

                {(isOwner || isAdmin) && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    {!isRecovered && (
                      <button onClick={handleMarkRecovered} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: theme.warning, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                        Mark as Recovered
                      </button>
                    )}
                    <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: theme.danger, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                      Delete Item
                    </button>
                  </div>
                )}

                {itemClaims.length > 0 && (
                  <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: theme.gray[50], border: `1px solid ${theme.gray[200]}` }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.gray[600], textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                      Existing Claims ({itemClaims.length})
                    </div>
                    {itemClaims.map(c => (
                      <div key={c._id} style={{ padding: '8px 0', borderTop: `1px solid ${theme.gray[200]}`, fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600 }}>{c.claimant?.name || c.userId?.name || 'User'}</span>
                        {' — '}
                        <span style={{ color: c.status === 'approved' ? theme.gold : c.status === 'rejected' ? theme.danger : theme.warning, fontWeight: 600, textTransform: 'uppercase' }}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// Styles
const styles = {
  // Main Content Styles
  mainContent: {
    padding: '32px 48px',
    overflow: 'auto',
    backgroundColor: theme.white,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  headerLeft: {
    flex: 1,
  },
  headerSubtitle: {
    margin: '0 0 8px 0',
    fontSize: '0.875rem',
    color: theme.gray[500],
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '2.25rem',
    fontWeight: '700',
    color: theme.navy,
    letterSpacing: '-0.5px',
  },
  statusBadge: {
    padding: '10px 24px',
    borderRadius: '24px',
    fontSize: '0.875rem',
    fontWeight: '600',
    backgroundColor: theme.dangerLight,
    color: theme.danger,
    border: `1px solid ${theme.danger}`,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  // Content Grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '32px',
  },
  // Image Section
  imageSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  imageCard: {
    backgroundColor: theme.gray[50],
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: `1px solid ${theme.gray[200]}`,
    height: '100%',
  },
  imageGallery: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  image: {
    width: '100%',
    borderRadius: '16px',
    objectFit: 'cover',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  },
  primaryImage: {
    maxHeight: '400px',
  },
  thumbnailImage: {
    maxHeight: '120px',
  },
  noImage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px',
  },
  noImageIcon: {
    fontSize: '4rem',
    opacity: 0.3,
  },
  noImageText: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: theme.gray[400],
  },
  // Info Section
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoCard: {
    backgroundColor: theme.cream,
    borderRadius: '20px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: `1px solid ${theme.gray[200]}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  itemTitle: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
    color: theme.navy,
    letterSpacing: '-0.5px',
  },
  itemIdBadge: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: theme.white,
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.gray[600],
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: `1px solid ${theme.gray[200]}`,
  },
  posterInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '24px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: theme.gray[50],
    border: `1px solid ${theme.gray[200]}`,
  },
  posterLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: theme.gray[500],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  posterName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: theme.gray[800],
  },
  posterEmail: {
    fontSize: '0.875rem',
    color: theme.gray[500],
  },
  metadataContainer: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  metadataChip: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: theme.white,
    border: `1px solid ${theme.gray[200]}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  metadataLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: theme.gray[500],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metadataValue: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: theme.gray[800],
  },
  divider: {
    height: '1px',
    backgroundColor: theme.gray[200],
    margin: '0 0 24px 0',
  },
  descriptionSection: {
    marginBottom: '24px',
  },
  sectionLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.gray[600],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  descriptionCard: {
    backgroundColor: theme.white,
    borderRadius: '16px',
    padding: '20px',
    border: `1px solid ${theme.gray[200]}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    minHeight: '120px',
  },
  descriptionText: {
    margin: 0,
    fontSize: '1rem',
    lineHeight: '1.7',
    color: theme.gray[700],
  },
  warningBox: {
    padding: '16px 20px',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '24px',
  },
  warningContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  warningIcon: {
    fontSize: '1.25rem',
  },
  warningText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: theme.warning,
  },
  actionSection: {
    marginTop: 'auto',
  },
  claimButton: {
    width: '100%',
    padding: '18px 32px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    color: theme.white,
    boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)',
    transition: 'all 0.2s ease',
  },
  recoveredNote: {
    margin: '12px 0 0 0',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.gray[500],
    textAlign: 'center',
  },
};

export default ItemDetail;
