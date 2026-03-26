'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { loginDashboardUser, registerDashboardUser } from '@/app/actions';

export default function AuthPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLoc, setRegLoc] = useState('');
  const [regDesignation, setRegDesignation] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');

  // Sniff URL for Direct Join routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'join') {
        setTimeout(() => setIsFlipped(true), 300);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setLoginError('');

    const res = await loginDashboardUser(loginEmail, loginPass);
    setIsLoading(false);

    if (!res.success || !res.user) {
      setLoginError(res.error || 'Authentication Failed');
    } else {
      localStorage.setItem('abw_auth', 'true');
      localStorage.setItem('abw_role', res.user.role);
      localStorage.setItem('abw_user_id', res.user.id);
      localStorage.setItem('abw_user_profile', JSON.stringify(res.user));
      router.push('/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setRegError('');
    
    const res = await registerDashboardUser({
      name: regName, email: regEmail, password: regPass, contact: regPhone, 
      designation: regDesignation, role: 'user'
    });
    
    setIsLoading(false);
    if (!res.success) {
      setRegError(res.error || 'Registration Failed');
    } else {
      alert('Node Activation Complete! Access granted.');
      setIsFlipped(false);
      setLoginEmail(regEmail);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5 position-relative z-1" style={{ perspective: '1200px' }}>
      
      {/* Dynamic 3D Environment Wrapper */}
      <motion.div 
        className="w-100 position-relative" 
        style={{ maxWidth: 450, transformStyle: 'preserve-3d', height: '650px' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.9, type: 'spring', stiffness: 50, damping: 15 }}
      >
        
        {/* Front Face: Log In Portal */}
        <div 
          className="position-absolute w-100 h-100 glass-card p-4 p-md-5 rounded-4 shadow-lg d-flex flex-column align-items-center overflow-hidden" 
          style={{ backfaceVisibility: 'hidden', background: 'rgba(10, 10, 20, 0.85)', border: '1px solid rgba(0, 242, 254, 0.4)' }}
        >
          <div className="text-center mb-4 mt-3">
            <div className="d-inline-block p-3 rounded-circle mb-3" style={{ background: 'rgba(0, 242, 254, 0.1)', boxShadow: '0 0 25px rgba(0,242,254,0.3)' }}>
              <Lock size={32} className="text-primary" />
            </div>
            <h2 className="fw-bold text-white mb-2" style={{ letterSpacing: '1px' }}>Welcome Back</h2>
            <p className="text-light fw-medium small">Secure logic portal access</p>
          </div>

          <form onSubmit={handleLogin} className="w-100 d-flex flex-column gap-4 flex-grow-1 mt-2">
            {loginError && <div className="alert alert-danger py-2 small fw-bold text-center mb-0">{loginError}</div>}
            <div className="position-relative">
              <label className="form-label text-info small fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>Email Address</label>
              <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} className="form-control bg-dark text-white border-info border-opacity-25 py-3 shadow-none focus-ring focus-ring-info" required />
            </div>
            <div className="position-relative">
              <label className="form-label text-info small fw-bold mb-1" style={{ letterSpacing: '0.5px' }}>Core Password</label>
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} value={loginPass} onChange={e=>setLoginPass(e.target.value)} className="form-control bg-dark text-white border-info border-opacity-25 py-3 border-end-0 shadow-none focus-ring focus-ring-info" required />
                <button type="button" className="input-group-text bg-dark border-info border-opacity-25 border-start-0 text-white-50 hover-text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
              className="btn btn-primary w-100 mt-4 py-3 fw-bold shadow-lg text-uppercase"
              style={{ letterSpacing: '1px', background: 'linear-gradient(90deg, #06BBCC, #2196f3)' }}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner-border spinner-border-sm" /> : 'Log In'}
            </motion.button>
          </form>

          <p className="text-white text-center mt-5 mb-0 fw-medium">
            Don't have an account? <span className="text-primary fw-bold cursor-pointer hover-text-white transition-colors ms-1 text-decoration-underline" onClick={() => setIsFlipped(true)}>Join Now</span>
          </p>
        </div>

        {/* Back Face: Join Now Portal */}
        <div 
          className="position-absolute w-100 h-100 glass-card p-4 rounded-4 shadow-lg d-flex flex-column align-items-center overflow-hidden" 
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(15, 10, 30, 0.9)', border: '1px solid rgba(224, 64, 251, 0.4)', overflowY: 'auto' }}
        >
          <style>{`
            .join-now-scroll::-webkit-scrollbar { width: 5px; }
            .join-now-scroll::-webkit-scrollbar-thumb { background: rgba(224, 64, 251, 0.5); border-radius: 5px; }
          `}</style>
          
          <div className="w-100 h-100 join-now-scroll overflow-y-auto pe-2">
            <div className="text-center mb-3">
              <div className="d-inline-block p-2 rounded-circle mb-2" style={{ background: 'rgba(224, 64, 251, 0.1)', boxShadow: '0 0 20px rgba(224, 64, 251, 0.3)' }}>
                <UserPlus size={24} color="#e040fb" />
              </div>
              <h3 className="fw-bold text-white mb-1">Create Account</h3>
              <p className="text-light opacity-75 small mb-0">Join the ABW Nexus</p>
            </div>

            <form onSubmit={handleRegister} className="d-flex flex-column gap-3 w-100">
              {regError && <div className="alert alert-danger py-2 small fw-bold text-center mb-0">{regError}</div>}
              <div><input type="text" placeholder="Full Name" value={regName} onChange={e=>setRegName(e.target.value)} className="form-control bg-dark text-white border-white border-opacity-25 py-2 shadow-none" required /></div>
              <div><input type="text" placeholder="Designation / Role" value={regDesignation} onChange={e=>setRegDesignation(e.target.value)} className="form-control bg-dark text-white border-white border-opacity-25 py-2 shadow-none" required /></div>
              <div><input type="tel" placeholder="Phone Number" value={regPhone} onChange={e=>setRegPhone(e.target.value)} className="form-control bg-dark text-white border-white border-opacity-25 py-2 shadow-none" required /></div>
              <div><input type="text" placeholder="Location" value={regLoc} onChange={e=>setRegLoc(e.target.value)} className="form-control bg-dark text-white border-white border-opacity-25 py-2 shadow-none" required /></div>
              <div><input type="email" placeholder="Email Address" value={regEmail} onChange={e=>setRegEmail(e.target.value)} className="form-control bg-dark text-white border-white border-opacity-25 py-2 shadow-none" required /></div>
              
              <div className="input-group">
                <input type={showPassword ? "text" : "password"} value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="Secure Password" className="form-control bg-dark text-white border-white border-opacity-25 py-2 border-end-0 shadow-none" required />
                <button type="button" className="input-group-text bg-dark border-white border-opacity-25 border-start-0 text-white hover-text-primary" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" 
                className="btn text-white w-100 mt-2 py-2 fw-bold shadow-lg"
                style={{ background: 'linear-gradient(90deg, #ab47bc, #e040fb)' }}
                disabled={isLoading}
              >
                {isLoading ? <span className="spinner-border spinner-border-sm" /> : 'Initialize Profile'}
              </motion.button>
            </form>

            <p className="text-white-50 text-center mt-4 mb-2 small fw-medium">
              Already have credentials? <span className="text-white fw-bold cursor-pointer hover-text-info transition-colors ms-1 text-decoration-underline" onClick={() => setIsFlipped(false)}>Log In</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
