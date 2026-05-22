import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clafLogo from '../assets/claf.png';
import puzzleHero from '../assets/fl.png';
import { loginUser, signupUser } from '../api/authService';

// Design System
const theme = {
  primary: '#1E40AF',
  navy: '#0F172A',
  white: '#FFFFFF',
  gold: '#D4AF37',
  goldLight: '#F5E6A3',
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
  }
};

// Landing Component
const Landing = () => {
  const [buttonClick, setButtonClick] = useState(null);

  const handleButtonClick = (btn) => {
    setButtonClick(btn);
    setTimeout(() => setButtonClick(null), 300);
  };

  return (
    <div style={landingStyles.container}>
      <div style={landingStyles.watermarkContainer}>
        <img src={clafLogo} alt="" style={landingStyles.watermark} />
      </div>
      <div style={landingStyles.content}>
        <div style={landingStyles.logoWrapper}>
          <img src={clafLogo} alt="Campus Lost & Found" style={landingStyles.logo} />
        </div>
        <h1 style={landingStyles.title}>Campus Lost & Found</h1>
        <p style={landingStyles.tagline}>
          Efficiently connecting lost items to their rightful owners on campus.
        </p>
        <div style={landingStyles.buttons}>
          <Link
            to="/login"
            style={{...landingStyles.loginBtn, ...(buttonClick === 'login' ? landingStyles.buttonClicked : {})}}
            onClick={() => handleButtonClick('login')}
          >
            Login
          </Link>
          <Link
            to="/signup"
            style={{...landingStyles.signupBtn, ...(buttonClick === 'signup' ? landingStyles.buttonClicked : {})}}
            onClick={() => handleButtonClick('signup')}
          >
            Sign Up
          </Link>
        </div>
        <p style={landingStyles.footer}>Item Hunters • University Campus System</p>
      </div>
    </div>
  );
};

// Login Component
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (err.code === 'ERR_NETWORK') {
        const requestedURL = err.config?.baseURL + err.config?.url;
        alert(`Network error: Unable to connect to ${requestedURL}. Is the backend running?`);
      } else {
        alert(err.message || "Invalid credentials or Server Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        {/* Left Side - Form */}
        <div style={loginStyles.leftPanel}>
          <div style={loginStyles.header}>
            <img src={clafLogo} alt="ITEM HUNTERS" style={loginStyles.logo} />
            <h1 style={loginStyles.brandTitle}>ITEM HUNTERS</h1>
            <p style={loginStyles.brandSubtitle}>CAMPUS LOST & FOUND</p>
            <div style={loginStyles.accentLine}></div>
          </div>

          <h2 style={loginStyles.welcomeTitle}>Welcome Back</h2>
          <p style={loginStyles.welcomeSubtitle}>Find what's lost, return what's found.</p>

          <form onSubmit={onSignIn} style={loginStyles.form}>
            <div style={loginStyles.inputGroup}>
              <label style={loginStyles.label}>Email address</label>
              <input
                type="email"
                style={loginStyles.input}
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={loginStyles.inputGroup}>
              <label style={loginStyles.label}>Password</label>
              <div style={loginStyles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={{...loginStyles.input, ...loginStyles.passwordInput}}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  style={loginStyles.showPasswordBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={loginStyles.formOptions}>
              <label style={loginStyles.checkboxLabel}>
                <input type="checkbox" style={loginStyles.checkbox} />
                <span>Remember me</span>
              </label>
              <a href="#" style={loginStyles.forgotLink}>Forgot password?</a>
            </div>

            <button
              type="submit"
              style={{...loginStyles.submitBtn, ...(loading ? loginStyles.submitBtnLoading : {})}}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p style={loginStyles.signupPrompt}>
            Don't have an account? <Link to="/signup" style={loginStyles.signupLink}>Sign up</Link>
          </p>
        </div>

        {/* Right Side - Hero */}
        <div style={loginStyles.rightPanel} className="auth-hero-panel">
          <img src={puzzleHero} alt="Puzzle Illustration" style={loginStyles.heroImage} />
          <div style={loginStyles.heroOverlay}></div>
          <div style={loginStyles.heroContent}>
            <h1 style={loginStyles.heroTitle}>Item Hunters</h1>
            <p style={loginStyles.heroText}>
              Efficiently connecting lost items to their rightful owners on campus.
            </p>
            <div style={loginStyles.heroDivider}></div>
            <p style={loginStyles.heroFooter}>University Campus System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Signup Component
const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isFormValid = fullName && studentId && email && password && confirmPassword && passwordsMatch && passwordStrength >= 2;

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signupUser({ name: fullName, studentId, email, password, adminSecret });
      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        const requestedURL = err.config?.baseURL + err.config?.url;
        alert(`Network error: Unable to connect to ${requestedURL}. Is the backend running?`);
      } else {
        alert(err.message || "Signup failed. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = (field) => {
    const errors = {};
    if (field === 'email' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = true;
    }
    if (field === 'studentId' && studentId && studentId.length < 5) {
      errors.studentId = true;
    }
    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  return (
    <div style={signupStyles.container}>
      <div style={signupStyles.card}>
        {/* Left Side - Form */}
        <div style={signupStyles.leftPanel}>
          <div style={signupStyles.header}>
            <img src={clafLogo} alt="ITEM HUNTERS" style={signupStyles.logo} />
            <h1 style={signupStyles.brandTitle}>ITEM HUNTERS</h1>
            <p style={signupStyles.brandSubtitle}>CAMPUS LOST & FOUND</p>
            <div style={signupStyles.accentLine}></div>
          </div>

          <h2 style={signupStyles.welcomeTitle}>Create an Account</h2>
          <p style={signupStyles.welcomeSubtitle}>Join the community and help return lost items.</p>

          <form onSubmit={onRegister} style={signupStyles.form}>
            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>Full Name</label>
              <input
                type="text"
                style={signupStyles.input}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>Student ID Number</label>
              <input
                type="text"
                style={{...signupStyles.input, ...(fieldErrors.studentId ? signupStyles.inputError : {})}}
                placeholder="2024-12345"
                value={studentId}
                onChange={(e) => { setStudentId(e.target.value); setFieldErrors(prev => ({...prev, studentId: false})); }}
                onBlur={() => handleBlur('studentId')}
                required
              />
            </div>

            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>University Email</label>
              <input
                type="email"
                style={{...signupStyles.input, ...(fieldErrors.email ? signupStyles.inputError : {})}}
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: false})); }}
                onBlur={() => handleBlur('email')}
                required
              />
            </div>

            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>Password</label>
              <input
                type="password"
                style={signupStyles.input}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {password && (
                <div style={signupStyles.passwordStrengthBar}>
                  <div style={{
                    ...signupStyles.passwordStrengthFill,
                    width: `${(passwordStrength / 4) * 100}%`,
                    background: passwordStrength <= 1 ? theme.gray[400] : passwordStrength === 2 ? theme.gold : '#28a745'
                  }} />
                </div>
              )}
            </div>

            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>Confirm Password</label>
              <div style={signupStyles.passwordWrapper}>
                <input
                  type="password"
                  style={{...signupStyles.input, ...signupStyles.passwordInput}}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && (
                  <span style={signupStyles.passwordMatchIcon}>
                    {passwordsMatch ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>

            <div style={signupStyles.inputGroup}>
              <label style={signupStyles.label}>Admin Key (Optional)</label>
              <input
                type="password"
                style={signupStyles.input}
                placeholder="Enter code for admin access"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
              />
            </div>

            <button
              type="submit"
              style={{...signupStyles.submitBtn, ...(loading ? signupStyles.submitBtnLoading : {}), opacity: isFormValid ? 1 : 0.5}}
              disabled={loading || !isFormValid}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p style={signupStyles.signupPrompt}>
            Already have an account? <Link to="/" style={signupStyles.signupLink}>Sign in</Link>
          </p>
        </div>

        {/* Right Side - Hero */}
        <div style={signupStyles.rightPanel} className="auth-hero-panel">
          <img src={puzzleHero} alt="Puzzle Illustration" style={signupStyles.heroImage} />
          <div style={signupStyles.heroOverlay}></div>
          <div style={signupStyles.heroContent}>
            <h1 style={signupStyles.heroTitle}>Item Hunters</h1>
            <p style={signupStyles.heroText}>
              Join the community in keeping our campus organized and helpful.
            </p>
            <div style={signupStyles.heroDivider}></div>
            <p style={signupStyles.heroFooter}>University Campus System</p>
          </div>
        </div>

        {success && (
          <div style={signupStyles.successOverlay}>
            <div style={signupStyles.successIcon}>✓</div>
            <h2 style={signupStyles.successTitle}>Account Created!</h2>
            <p style={signupStyles.successText}>Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Landing Styles
const landingStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.navy} 0%, ${theme.primary} 50%, ${theme.navy} 100%)`,
    backgroundSize: '200% 200%',
    animation: 'gradientShift 8s ease-in-out infinite',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  watermark: {
    width: '700px',
    height: '700px',
    objectFit: 'contain',
    opacity: 0.03,
    animation: 'rotateWatermark 40s linear infinite',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '40px',
  },
  logoWrapper: {
    marginBottom: '32px',
  },
  logo: {
    width: '140px',
    height: '140px',
    objectFit: 'contain',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    animation: 'float 4s ease-in-out infinite',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: theme.white,
    margin: '0 0 16px 0',
    letterSpacing: '-1px',
    animation: 'slideUp 0.6s ease-out 0.3s both',
  },
  tagline: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.8)',
    margin: '0 0 48px 0',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.6',
    animation: 'fadeIn 0.6s ease-out 0.5s both',
  },
  buttons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    animation: 'fadeIn 0.6s ease-out 0.7s both',
  },
  loginBtn: {
    padding: '16px 48px',
    backgroundColor: theme.primary,
    color: theme.white,
    fontWeight: '600',
    fontSize: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(30, 64, 175, 0.4)',
    border: 'none',
  },
  signupBtn: {
    padding: '16px 48px',
    backgroundColor: 'transparent',
    color: theme.gold,
    fontWeight: '600',
    fontSize: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    border: '2px solid #D4AF37',
    transition: 'all 0.3s ease',
  },
  buttonClicked: {
    transform: 'scale(0.95)',
  },
  footer: {
    marginTop: '48px',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.5)',
    animation: 'fadeIn 0.6s ease-out 0.9s both',
  },
};

// Login Styles
const loginStyles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.gray[50],
    padding: '20px',
  },
  card: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    minHeight: '650px',
    backgroundColor: theme.white,
    borderRadius: '24px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  leftPanel: {
    flex: 1,
    padding: '48px 56px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '16px',
  },
  brandTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.primary,
    margin: '0 0 4px 0',
    letterSpacing: '1px',
  },
  brandSubtitle: {
    fontSize: '0.875rem',
    color: theme.gray[500],
    margin: '0 0 16px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  accentLine: {
    width: '60px',
    height: '3px',
    backgroundColor: theme.gold,
    margin: '0 auto',
    borderRadius: '2px',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.navy,
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '1rem',
    color: theme.gray[500],
    margin: '0 0 32px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.gray[700],
  },
  input: {
    padding: '14px 16px',
    fontSize: '1rem',
    border: '2px solid #E2E8F0',
    borderRadius: '12px',
    backgroundColor: theme.gray[50],
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: '80px',
  },
  showPasswordBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '8px 12px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    color: theme.gray[600],
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  forgotLink: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: theme.primary,
    textDecoration: 'none',
  },
  submitBtn: {
    padding: '16px',
    fontSize: '1rem',
    fontWeight: '600',
    color: theme.white,
    backgroundColor: theme.primary,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(30, 64, 175, 0.3)',
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  signupPrompt: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.gray[500],
    marginTop: '24px',
  },
  signupLink: {
    fontWeight: '600',
    color: theme.primary,
    textDecoration: 'none',
  },
  rightPanel: {
    flex: 1,
    position: 'relative',
    display: 'none',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme.primary,
    opacity: 0.75,
  },
  heroContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    maxWidth: '320px',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.gold,
    margin: '0 0 16px 0',
  },
  heroText: {
    fontSize: '1rem',
    color: theme.white,
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  heroDivider: {
    width: '50px',
    height: '3px',
    backgroundColor: theme.gold,
    margin: '0 auto 24px',
    borderRadius: '2px',
  },
  heroFooter: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
  },
};

// Signup Styles
const signupStyles = {
  ...loginStyles,
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.navy,
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '1rem',
    color: theme.gray[500],
    margin: '0 0 24px 0',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  passwordStrengthBar: {
    height: '4px',
    background: theme.gray[200],
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '8px',
  },
  passwordStrengthFill: {
    height: '100%',
    transition: 'width 0.3s ease, background 0.3s ease',
  },
  passwordMatchIcon: {
    position: 'absolute',
    right: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    transition: 'all 0.3s ease',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease-out',
  },
  successIcon: {
    fontSize: '5rem',
    color: '#28a745',
    marginBottom: '16px',
    animation: 'checkmarkPop 0.4s ease-out',
  },
  successTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.primary,
    margin: '0 0 8px 0',
  },
  successText: {
    fontSize: '1rem',
    color: theme.gray[500],
    margin: 0,
  },
};

// Responsive styles for desktop
const desktopStyles = {
  '@media (min-width: 768px)': {
    ...loginStyles,
    rightPanel: {
      display: 'block',
    },
  },
};

export { Landing, Login, Signup };
