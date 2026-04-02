'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [customApps, setCustomApps] = useState<any[]>([]);
  
  const pathname = usePathname();

  // Authentication Evaluation Cycle
  useEffect(() => {
    setIsAuth(localStorage.getItem('abw_auth') === 'true');
    setCustomApps(JSON.parse(localStorage.getItem('abw_custom_apps') || '[]'));
  }, [pathname]);

  // Theme Core Intercept
  useEffect(() => {
    if (isThemeDark) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }, [isThemeDark]);

  // Scroll Intercept
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="fixed-top d-flex justify-content-center transition-all" 
      style={{ 
        pointerEvents: 'none', 
        zIndex: 1030, 
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', 
        top: isScrolled ? '15px' : '0px',
        padding: isScrolled ? '0 1rem' : '0'
      }}
    >
      <nav 
        className={`navbar navbar-expand-lg navbar-dark p-0 shadow-lg transition-all ${isScrolled ? 'rounded-pill glass-panel' : ''}`} 
        style={{ 
          pointerEvents: 'auto', 
          width: '100%', 
          maxWidth: isScrolled ? '1200px' : '100%', 
          background: isScrolled ? 'rgba(10, 10, 20, 0.85)' : 'rgba(5, 5, 10, 0.4)', 
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(5px)', 
          border: isScrolled ? '1px solid rgba(0, 242, 254, 0.2)' : 'none',
          borderBottom: !isScrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0, 242, 254, 0.2)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className={`container-fluid ${isScrolled ? 'px-4 py-2' : 'px-md-5 px-3 py-3'} transition-all`}>
          
          {/* Logo Assembly */}
          <Link href="/" className="navbar-brand d-flex align-items-center">
            <div className="position-relative d-flex align-items-center me-2" style={{ width: isScrolled ? 60 : 75, height: isScrolled ? 58 : 71, transition: 'all 0.4s', flexShrink: 0 }}>
              <Image
                src="/images/logo.png"
                alt="ABWcurious Logo"
                width={isScrolled ? 60 : 75}
                height={isScrolled ? 58 : 71}
                priority
                loading="eager"
                sizes="75px"
                style={{ transition: 'all 0.4s', objectFit: 'contain' }}
              />
            </div>
          </Link>

          {/* Mobile Toggler */}
          <button type="button" className="navbar-toggler shadow-none border-0 pe-0" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Desktop & Mobile Menu Array */}
          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            
            {/* Primary Navigation Links */}
            <div className={`navbar-nav mx-auto ${isScrolled ? 'gap-1' : 'gap-3'} transition-all`}>
              <Link href="/" className={`nav-item nav-link fw-bold ${pathname === '/' ? 'active text-primary' : ''}`}>Home</Link>
              <Link href="/about" className={`nav-item nav-link fw-bold ${pathname === '/about' ? 'active text-primary' : ''}`}>About</Link>
              
              <div className={`nav-item nav-link fw-bold dropdown ${isDropdownOpen ? 'show' : ''}`} onMouseEnter={() => setIsDropdownOpen(true)} onMouseLeave={() => setIsDropdownOpen(false)}>
                <span className="cursor-pointer">Services <i className="fa fa-chevron-down ms-1" style={{ fontSize: '0.7rem', opacity: 0.7 }}></i></span>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="dropdown-menu border-0 shadow-lg rounded-4 overflow-hidden position-absolute top-100 mt-2 p-2"
                      style={{ background: 'rgba(15, 15, 25, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 242, 254, 0.2)' }}
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <Link href="/services/web-development" className="dropdown-item text-white-50 hover-text-white py-2 rounded-3 transition-colors">Web Development</Link>
                      <Link href="/services/mobile-development" className="dropdown-item text-white-50 hover-text-white py-2 rounded-3 transition-colors">Mobile Development</Link>
                      <Link href="/services/cyber-security" className="dropdown-item text-white-50 hover-text-white py-2 rounded-3 transition-colors">Cyber Security</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <Link href="/cyber-intelligence" className={`nav-item nav-link fw-bold ${pathname === '/cyber-intelligence' ? 'active text-primary' : ''}`}>Security</Link>
              <Link href="/contact" className={`nav-item nav-link fw-bold ${pathname === '/contact' ? 'active text-primary' : ''}`}>Contact</Link>
            </div>

            {/* Application Matrix & Auth Suite */}
            <div className="d-flex align-items-center justify-content-center mt-3 mt-lg-0 gap-3">
              
              {/* Google-Style 9-Dots Apps Drawer (AUTH LOCKED) */}
              <div className="position-relative" onMouseEnter={() => isAuth && setIsAppsOpen(true)} onMouseLeave={() => setIsAppsOpen(false)}>
                <button 
                  className="btn btn-link text-white p-2 d-flex align-items-center justify-content-center rounded-circle hover-bg-light transition-colors" 
                  onClick={() => {
                    if (!isAuth) {
                      alert("⚠️ Nexus Guard: You must Log In to access the ABW Curious Applications.");
                    } else {
                      setIsAppsOpen(!isAppsOpen);
                    }
                  }}
                  title={isAuth ? "ABW Ecosystem Apps" : "Locked: Log in to access Apps"}
                >
                  {isAuth ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  )}
                </button>

                <AnimatePresence>
                  {isAppsOpen && isAuth && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="position-absolute dropdown-menu show border-0 shadow-lg rounded-4 p-3"
                      style={{ right: 0, top: '45px', width: '320px', background: 'rgba(15, 15, 25, 0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0, 242, 254, 0.3)' }}
                    >
                      <h6 className="text-white-50 border-bottom border-secondary pb-2 mb-3 px-2 small fw-bold text-uppercase">ABW Internal Ecosystem</h6>
                      <div className="row g-2">
                        {/* Blogger App */}
                        <div className="col-4 text-center">
                          <Link href="/apps/blogger" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45 }}><i className="fa fa-pen text-dark fs-5"></i></div>
                            <span className="text-white small fw-medium">Blogger</span>
                          </Link>
                        </div>
                        {/* Tasks App */}
                        <div className="col-4 text-center">
                          <Link href="/apps/tasks" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-info rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45 }}><i className="fa fa-check-square text-dark fs-5"></i></div>
                            <span className="text-white small fw-medium">Tasks</span>
                          </Link>
                        </div>
                        {/* Calculator App */}
                        <div className="col-4 text-center">
                          <Link href="/apps/calculator" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45 }}><i className="fa fa-calculator text-dark fs-5"></i></div>
                            <span className="text-white small fw-medium">Calc</span>
                          </Link>
                        </div>
                        {/* Calendar App */}
                        <div className="col-4 text-center">
                          <Link href="/apps/calendar" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45 }}><i className="fa fa-calendar-alt text-white fs-5"></i></div>
                            <span className="text-white small fw-medium">Calendar</span>
                          </Link>
                        </div>
                        {/* Clock App */}
                        <div className="col-4 text-center">
                          <Link href="/apps/clock" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-success rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45 }}><i className="fa fa-clock text-white fs-5"></i></div>
                            <span className="text-white small fw-medium">Clock</span>
                          </Link>
                        </div>
                        {/* Study Spark Legacy */}
                        <div className="col-4 text-center">
                          <a href="https://studyspark.tech/" target="_blank" rel="noopener noreferrer" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45, background: 'linear-gradient(135deg, #FF9800, #F44336)' }}><i className="fa fa-graduation-cap text-white fs-5"></i></div>
                            <span className="text-white small fw-medium">StudySpark</span>
                          </a>
                        </div>
                        {/* Custom Admin Injected Apps */}
                        {customApps.map((app: any, idx: number) => (
                           <div key={`custom-${idx}`} className="col-4 text-center">
                             <a href={app.url} target="_blank" rel="noopener noreferrer" className="d-flex flex-column align-items-center text-decoration-none p-2 rounded-3 hover-bg-light transition-colors">
                               <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mb-2 shadow" style={{ width: 45, height: 45, background: 'linear-gradient(135deg, #06BBCC, #2196f3)' }}><i className={`fa fa-${app.icon} text-white fs-5`}></i></div>
                               <span className="text-white small fw-medium text-truncate w-100">{app.name}</span>
                             </a>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secure Authentication Portal */}
              <div className="d-none d-lg-flex align-items-center gap-2 ms-2 ps-3 border-start border-secondary py-1">
                {isAuth ? (
                  <>
                    <Link href="/dashboard" className="btn btn-info text-dark rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center hover-scale" style={{ transition: 'all 0.3s' }}>Dashboard</Link>
                    <button onClick={() => { localStorage.removeItem('abw_auth'); localStorage.removeItem('abw_role'); window.location.reload(); }} className="btn btn-outline-danger rounded-pill px-3 fw-bold shadow-sm hover-glow">Log Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn btn-outline-info rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center justify-content-center hover-glow" style={{ borderWidth: '2px', transition: 'all 0.3s' }}>Log In</Link>
                    <Link href="/login?mode=join" className="btn btn-primary rounded-pill px-4 fw-bold shadow-lg d-flex align-items-center justify-content-center hover-scale" style={{ background: 'linear-gradient(135deg, #06BBCC, #2196f3)', border: 'none', transition: 'all 0.3s' }}>Sign Up</Link>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
