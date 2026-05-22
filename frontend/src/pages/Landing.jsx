import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/claf.png';

const Landing = () => {
  const [buttonClick, setButtonClick] = useState(null);

  const handleButtonClick = (btn) => {
    setButtonClick(btn);
    setTimeout(() => setButtonClick(null), 300);
  };

  return (
    <div style={styles.container}>
      {/* Background watermark */}
      <img src={logo} alt="" style={styles.watermark} />

      {/* Content */}
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
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #003366 0%, #001a33 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 8s ease-in-out infinite',
    position: 'relative',
    overflow: 'hidden',
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
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '40px',
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
};

export default Landing;
