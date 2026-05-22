import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/claf.png';
import bgImage from '../assets/neu.jpg';

const Landing = () => {
  const [buttonClick, setButtonClick] = useState(null);
  const [stats, setStats] = useState({ items: 0, users: 0, recovered: 0 });

  const handleButtonClick = (btn) => {
    setButtonClick(btn);
    setTimeout(() => setButtonClick(null), 300);
  };

  useEffect(() => {
    // Animate stats on load
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        setStats({
          items: Math.floor(1500 * progress),
          users: Math.floor(500 * progress),
          recovered: Math.floor(1200 * progress)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setStats({ items: 1500, users: 500, recovered: 1200 });
        }
      }, interval);

      return () => clearInterval(timer);
    };

    animateStats();
  }, []);

  return (
    <div style={styles.container}>
      {/* Background image */}
      <img src={bgImage} alt="" style={styles.backgroundImage} />
      {/* Background watermark */}
      <img src={logo} alt="" style={styles.watermark} />

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.content}>
          <img src={logo} alt="Campus Lost & Found" style={styles.logo} />
          <h1 style={styles.title}>Campus Lost & Found</h1>
          <p style={styles.tagline}>
            Connecting lost items with their rightful owners across campus.
          </p>
          <div style={styles.buttons}>
            <Link 
              to="/login" 
              style={{...styles.loginBtn, ...(buttonClick === 'login' ? styles.buttonClicked : {})}}
              onClick={() => handleButtonClick('login')}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              style={{...styles.signupBtn, ...(buttonClick === 'signup' ? styles.buttonClicked : {})}}
              onClick={() => handleButtonClick('signup')}
            >
              Sign Up
            </Link>
          </div>
        </div>
        <div style={styles.scrollIndicator}>
          <div style={styles.scrollArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5"></path>
            </svg>
          </div>
          <div style={styles.scrollText}>Scroll to explore</div>
        </div>
      </div>

      {/* Statistics Section */}
      <div style={styles.statsSection}>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.items}+</div>
            <div style={styles.statLabel}>Items Reported</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.users}+</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.recovered}+</div>
            <div style={styles.statLabel}>Items Recovered</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Why Choose CLAF?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Easy Reporting</h3>
            <p style={styles.featureDesc}>Report lost or found items with photos and detailed descriptions in seconds.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Quick Search</h3>
            <p style={styles.featureDesc}>Smart search with filters to find your items quickly by category, location, or keywords.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Secure Claims</h3>
            <p style={styles.featureDesc}>Submit claims with verification details to ensure items return to rightful owners.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 style={styles.featureTitle}>Real-time Updates</h3>
            <p style={styles.featureDesc}>Get instant notifications when your items are found or claims are approved.</p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={styles.howItWorksSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Report or Search</h3>
            <p style={styles.stepDesc}>Report a lost item or search through found items on campus.</p>
          </div>
          <div style={styles.stepArrow}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Submit Claim</h3>
            <p style={styles.stepDesc}>Found your item? Submit a claim with verification details.</p>
          </div>
          <div style={styles.stepArrow}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Get Verified</h3>
            <p style={styles.stepDesc}>Admin reviews your claim and approves if verified.</p>
          </div>
          <div style={styles.stepArrow}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c5a059" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>4</div>
            <h3 style={styles.stepTitle}>Recover Item</h3>
            <p style={styles.stepDesc}>Pick up your item from the designated location.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2026 Campus Lost & Found. All rights reserved.</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 8s ease-in-out infinite',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.15,
    zIndex: 0,
  },
  watermark: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    objectFit: 'contain',
    opacity: 0.04,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    animation: 'rotateWatermark 30s linear infinite',
    zIndex: 0,
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  content: {
    textAlign: 'center',
    padding: '40px',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    animation: 'bounce 2s infinite',
  },
  scrollArrow: {
    fontSize: '2rem',
    color: '#c5a059',
    fontWeight: '700',
  },
  scrollText: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  logo: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    marginBottom: '24px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    animation: 'float 3s ease-in-out infinite',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.5px',
    animation: 'slideUp 0.5s ease-out 0.5s both',
  },
  tagline: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 40px 0',
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.5',
    animation: 'fadeIn 0.5s ease-out 0.8s both',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    animation: 'fadeIn 0.5s ease-out 1s both',
  },
  loginBtn: {
    padding: '14px 40px',
    backgroundColor: '#003366',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(0,51,102,0.3)',
  },
  signupBtn: {
    padding: '14px 40px',
    backgroundColor: 'transparent',
    color: '#c5a059',
    fontWeight: '600',
    fontSize: '1rem',
    borderRadius: '8px',
    textDecoration: 'none',
    border: '2px solid #c5a059',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  buttonClicked: {
    animation: 'buttonPulse 0.3s ease-out',
  },
  statsSection: {
    padding: '80px 20px',
    background: 'rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  statsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '30px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    padding: '30px 40px',
    borderRadius: '16px',
    textAlign: 'center',
    minWidth: '200px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#c5a059',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuresSection: {
    padding: '100px 20px',
    background: 'rgba(0,0,0,0.1)',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '60px',
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    padding: '40px 30px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
  },
  featureDesc: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
  },
  howItWorksSection: {
    padding: '100px 20px',
    background: 'rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  stepsContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  step: {
    flex: '1',
    minWidth: '200px',
    textAlign: 'center',
    padding: '20px',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c5a059, #003366)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 auto 20px',
  },
  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
  },
  stepArrow: {
    fontSize: '2rem',
    color: '#c5a059',
    fontWeight: '700',
  },
  footer: {
    padding: '40px 20px',
    background: 'rgba(0,0,0,0.3)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  footerText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    margin: 0,
  },
};

export default Landing;
