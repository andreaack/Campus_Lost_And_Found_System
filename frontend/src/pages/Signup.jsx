import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clafLogo from '../assets/claf.png';
import puzzleHero from '../assets/fl.png'; 
import { signupUser } from '../api/authService'; 

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

    const branding = { primary: "#003366", accent: "#c5a059" };

    // Password strength calculator
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

    // ─── REFACTORED SIGNUP LOGIC ────────────────────────────────
    const onRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          
            const data = await signupUser({ 
                name: fullName, 
                studentId, 
                email, 
                password,
                adminSecret 
            });

            if (data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/'), 1500);
            }
        } catch (err) { 
            if (err.code === 'ERR_NETWORK') {
                const requestedURL = err.config?.baseURL + err.config?.url;
                console.error('[SIGNUP] ERR_NETWORK — Failed to reach:', requestedURL);
                console.error('[SIGNUP] Full config:', err.config);
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
        <div className="container-fluid vh-100 p-0 d-flex align-items-center justify-content-center bg-light">
            <div className="row shadow-lg bg-white rounded-4 overflow-hidden w-100 m-2" style={{ maxWidth: '1000px', minHeight: '650px', position: 'relative' }}>
                {/* LEFT SIDE: FORM */}
                <div className="col-md-6 p-4 p-md-5 anim-slide-in-left">
                    <div className="text-center mb-4">
                        <img src={clafLogo} alt="Logo" style={{ width: '80px' }} className="img-fluid mb-2" />
                        <h5 className="fw-bold" style={{ color: branding.primary }}>CAMPUS LOST & FOUND</h5>
                        <div className="mx-auto" style={{ width: '50px', height: '3px', backgroundColor: branding.accent }}></div>
                    </div>

                    <h2 className="fw-bold mb-1" style={{ color: branding.primary }}>Create an Account</h2>
                    <p className="text-muted mb-4 small">Join the community and help return lost items.</p>
                    
                    <form onSubmit={onRegister}>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">Full Name</label>
                            <input type="text" className="form-control bg-light border-0 shadow-sm" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">Student ID Number</label>
                            <input 
                                type="text" 
                                className={`form-control bg-light border-0 shadow-sm ${fieldErrors.studentId ? 'anim-shake' : ''}`} 
                                value={studentId} 
                                onChange={(e) => { setStudentId(e.target.value); setFieldErrors(prev => ({...prev, studentId: false})); }}
                                onBlur={() => handleBlur('studentId')}
                                required 
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">University Email</label>
                            <input 
                                type="email" 
                                className={`form-control bg-light border-0 shadow-sm ${fieldErrors.email ? 'anim-shake' : ''}`} 
                                value={email} 
                                onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({...prev, email: false})); }}
                                onBlur={() => handleBlur('email')}
                                required 
                            />
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">Password</label>
                            <input type="password" className="form-control bg-light border-0 shadow-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            {password && (
                                <div className="mt-1" style={{ height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div 
                                        style={{ 
                                            width: `${(passwordStrength / 4) * 100}%`, 
                                            height: '100%', 
                                            background: passwordStrength <= 1 ? '#dc3545' : passwordStrength === 2 ? '#ffc107' : '#28a745',
                                            transition: 'width 0.3s ease, background 0.3s ease'
                                        }} 
                                    />
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <label className="form-label fw-bold small">Confirm Password</label>
                            <div className="input-group">
                                <input 
                                    type="password" 
                                    className="form-control bg-light border-0 shadow-sm" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    required 
                                />
                                {confirmPassword && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        right: '40px', 
                                        top: '50%', 
                                        transform: 'translateY(-50%)', 
                                        fontSize: '1.2rem',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {passwordsMatch ? '✓' : '✗'}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-bold small text-muted">Admin Key (Optional)</label>
                            <input 
                                type="password" 
                                className="form-control bg-light border-0 shadow-sm" 
                                placeholder="Enter code for admin access"
                                value={adminSecret} 
                                onChange={(e) => setAdminSecret(e.target.value)} 
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-lg w-100 fw-bold mb-3 shadow text-white" 
                            style={{ backgroundColor: branding.primary, border: 'none', opacity: isFormValid ? 1 : 0.5, transition: 'opacity 0.2s ease' }}
                            disabled={loading || !isFormValid}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                    
                    <p className="text-center small text-secondary">
                        Already have an account? <Link to="/" className="fw-bold text-decoration-none" style={{ color: branding.primary }}>Sign in</Link>
                    </p>
                </div>

                {/* RIGHT SIDE: HERO SECTION */}
                <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-0 position-relative anim-slide-in-right">
                    <img src={puzzleHero} alt="Hero" className="w-100 h-100 object-fit-cover position-absolute top-0 start-0" />
                    <div className="w-100 h-100 position-absolute" style={{ backgroundColor: branding.primary, opacity: '0.7', zIndex: 1 }}></div>
                    
                    <div className="text-center p-5 position-relative" style={{ zIndex: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.2)', margin: '20px' }}>
                        <h1 className="display-5 fw-bold mb-3" style={{ color: branding.accent }}>Item Hunters</h1>
                        <p className="fs-5 fw-light text-white">Join the community in keeping our campus organized and helpful.</p>
                        <hr className="mx-auto" style={{ width: '50px', borderColor: branding.accent, borderWidth: '3px' }} />
                        <p className="small mt-4 text-white opacity-75">New Era University • Lost & Found System</p>
                    </div>
                </div>

                {/* Success Overlay */}
                {success && (
                    <div 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'fadeIn 0.3s ease-out'
                        }}
                    >
                        <div style={{ fontSize: '4rem', color: '#28a745', animation: 'checkmarkPop 0.4s ease-out' }}>✓</div>
                        <h2 style={{ color: branding.primary, marginTop: '1rem' }}>Account Created!</h2>
                        <p className="text-muted">Redirecting to login...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;