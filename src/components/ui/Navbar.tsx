'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/cyber-intelligence', label: 'Cyber-intelligence' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top ${isHome && !isScrolled ? 'bg-transparent' : 'bg-dark shadow'} p-0`}>
      <div className="container px-2">
        <div className="d-flex align-items-center justify-content-between w-100">
          <Link href="/" className="navbar-brand d-flex align-items-center px-2 px-lg-3">
            <h2 className="m-0 text-primary">
              <Image src="/images/logo.png" alt="ABW Curious Logo" width={84} height={80} className="me-2" />
            </h2>
          </Link>

          <button type="button" className="navbar-toggler me-4 d-lg-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <div className="navbar-nav ms-auto p-2 p-lg-0">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-item nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}

              <div className="nav-item dropdown position-relative">
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen((s) => !s);
                  }}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  Service
                </a>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="dropdown-menu fade-down m-0 position-absolute top-100 start-0 bg-white shadow rounded py-2 min-w-100 z-50"
                      onMouseEnter={() => setIsDropdownOpen(true)}
                      onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                      <Link href="/services/web-development" className="dropdown-item px-4 py-2">Web Development</Link>
                      <Link href="/services/mobile-development" className="dropdown-item px-4 py-2">Mobile Development</Link>
                      <Link href="/services/cyber-security" className="dropdown-item px-4 py-2">Cyber Security</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <Link href="/join-now" className="btn btn-primary py-1 px-lg-3 d-none d-lg-block">
              Join Now
              <i className="fa fa-arrow-right ms-3"></i>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


