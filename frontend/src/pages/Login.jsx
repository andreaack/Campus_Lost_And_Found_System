import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clafLogo from '../assets/claf.png';
import puzzleHero from '../assets/fl.png';
import { loginUser } from '../api/authService'; 

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [shake, setShake] = useState(false);
    const [loading, setLoading] = useState(false); 

    const branding = {
      primary: "#003366",
      accent: "#c5a059"
    };

    
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
                console.error('[LOGIN] ERR_NETWORK — Failed to reach:', requestedURL);
                console.error('[LOGIN] Full config:', err.config);
                alert(`Network error: Unable to connect to ${requestedURL}. Is the backend running?`);
            } else {
                alert(err.message || "Invalid credentials or Server Error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
      <div className="container-fluid vh-100 p-0 d-flex align-items-center justify-content-center bg-light">
        <div className={`row shadow-lg bg-white rounded-4 overflow-hidden w-100 m-2 ${shake ? 'anim-shake' : ''}`} style={{ maxWidth: '1000px', minHeight: '600px' }}>
         {/* LEFT SIDE: FORM */}
         <div className="col-md-6 p-4 p-md-5 anim-slide-in-right">
           <div className="text-center mb-5">
             <img src={clafLogo} alt="CLAF" style={{ width: '100px' }} className="img-fluid mb-3" />
             <h4 className="fw-bold mt-2" style={{ color: branding.primary, letterSpacing: '1px' }}>CAMPUS LOST & FOUND</h4>
             <div className="mx-auto" style={{ width: '60px', height: '4px', backgroundColor: branding.accent, borderRadius: '2px' }}></div>
           </div>

           <h2 className="fw-bold mb-1" style={{ color: branding.primary }}>Welcome Back</h2>
           <p className="text-muted mb-4 small">Find what's lost, return what's found.</p>
           
           <form onSubmit={onSignIn}>
               <div className="mb-3">
                   <label className="form-label fw-bold small" style={{ color: branding.primary }}>Email address</label>
                   <input 
                       type="email" 
                       className="form-control form-control-lg bg-light border-0 fs-6 shadow-sm" 
                       placeholder="name@neu.edu.ph" 
                       value={email} 
                       onChange={(e) => setEmail(e.target.value)} 
                       required 
                   />
               </div>
               <div className="mb-4">
                   <label className="form-label fw-bold small" style={{ color: branding.primary }}>Password</label>
                   <div className="input-group">
                       <input 
                           type={showPassword ? 'text' : 'password'} 
                           className="form-control form-control-lg bg-light border-0 fs-6 shadow-sm" 
                           placeholder="••••••••••••" 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           required 
                       />
                       <button 
                           type="button" 
                           className="btn bg-light border-0" 
                           onClick={() => setShowPassword(!showPassword)}
                       >
                           {showPassword ? 'Hide' : 'Show'}
                       </button>
                   </div>
               </div>

               <div className="d-flex justify-content-between mb-4 mt-2">
                   <div className="form-check">
                       <input type="checkbox" className="form-check-input" id="remember" />
                       <label className="form-check-label small" htmlFor="remember">Remember me</label>
                   </div>
                   <a href="#" className="small text-decoration-none fw-bold link-underline" style={{ color: branding.accent }}>Forgot password?</a>
               </div>

               <button 
                   type="submit" 
                   className={`btn btn-lg w-100 fw-bold mb-3 shadow text-white ${loading ? 'anim-pulse' : ''}`} 
                   style={{ backgroundColor: branding.primary, border: 'none' }}
                   disabled={loading}
               >
                   {loading ? 'Authenticating...' : 'Sign In'}
               </button>
           </form>
           
           <p className="text-center small text-secondary">
               Don't have an account? <Link to="/signup" className="fw-bold text-decoration-none link-underline" style={{ color: branding.primary }}>Sign up</Link>
           </p>
       </div>

       {/* RIGHT SIDE: HERO SECTION */}
       <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-0 position-relative anim-slide-in-left">
           <img src={puzzleHero} alt="Background" className="w-100 h-100 object-fit-cover position-absolute top-0 start-0" />
           <div className="w-100 h-100 position-absolute" style={{ backgroundColor: branding.primary, opacity: '0.7', zIndex: 1 }}></div>
           
           <div className="text-center p-5 position-relative" style={{ zIndex: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', borderRadius: '15px', border: '1px solid rgba(255, 255, 255, 0.2)', margin: '20px' }}>
               <h1 className="display-6 fw-bold mb-3" style={{ color: branding.accent }}>Item Hunters</h1>
               <p className="fs-6 fw-light text-white">Efficiently connecting lost items to their rightful owners on campus.</p>
               <hr className="mx-auto" style={{ width: '50px', borderColor: branding.accent, borderWidth: '3px' }} />
               <p className="small mt-4 text-white opacity-75">New Era University • Lost & Found System</p>
           </div>
       </div>

       </div>
   </div>
  );
};

export default Login;