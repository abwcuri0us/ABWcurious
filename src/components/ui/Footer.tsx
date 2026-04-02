'use client';

import Link from 'next/link';

const footerLinks = {
  quickLinks: [
    { label: 'About Us',       href: '/about' },
    { label: 'Contact Us',     href: '/contact' },
    { label: 'Security',       href: '/cyber-intelligence' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ],
  services: [
    { label: 'Web Development',      href: '/services/web-development' },
    { label: 'Mobile Development',   href: '/services/mobile-development' },
    { label: 'Cyber Security',       href: '/services/cyber-security' },
    { label: 'AI & ML Solutions',    href: '/services/ai-ml' },
    { label: 'Professional Training',href: '/services/training' },
    { label: 'Digital Marketing',    href: '/services/digital-marketing' },
  ],
  careers: [
    { label: 'Internships',    href: '/internships', icon: 'fa-briefcase', highlight: true },
    { label: 'Join Our Team',  href: '/login?mode=join',    icon: 'fa-user-plus' },
    { label: 'Career Guidance',href: '/services/career-guidance', icon: 'fa-compass' },
  ],
  social: [
    { label: 'GitHub',    href: 'https://github.com/abwcuri0us',                                icon: 'fa-github' },
    { label: 'YouTube',   href: 'https://www.youtube.com/@ABWcurious',                          icon: 'fa-youtube' },
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/company/abwcurious',                  icon: 'fa-linkedin-in' },
    { label: 'Instagram', href: 'https://www.instagram.com/abwcurious',                         icon: 'fa-instagram' },
    { label: 'Facebook',  href: 'https://www.facebook.com/people/ABWcurious/61579618321899/',   icon: 'fa-facebook-f' },
    { label: 'X',         href: 'https://x.com/abwcurious',                                     icon: 'bi-twitter-x', isBootstrap: true },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="text-light"
      aria-label="Site footer"
      style={{
        background: 'rgba(5, 5, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 242, 254, 0.12)',
        marginTop: '5rem',
      }}
    >
      {/* ── Main footer grid ── */}
      <div className="container py-5">
        <div className="row g-5">

          {/* Col 1 — Contact */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4" style={{ letterSpacing: '1px' }}>
              <i className="fa fa-satellite-dish me-2 text-primary" />
              Get In Touch
            </h5>
            <ul className="list-unstyled mb-4" style={{ lineHeight: 2 }}>
              <li>
                <i className="fa fa-map-marker-alt me-2 text-primary" />
                Vashi, Navi Mumbai, MH, India
              </li>
              <li>
                <i className="fa fa-phone-alt me-2 text-primary" />
                <a href="tel:+918108915402" className="text-light text-decoration-none">
                  +91 8108915402
                </a>
              </li>
              <li>
                <i className="fa fa-envelope me-2 text-primary" />
                <a href="mailto:info@abwcurious.com" className="text-light text-decoration-none">
                  info@abwcurious.com
                </a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="d-flex flex-wrap gap-2">
              {footerLinks.social.map(({ label, href, icon, isBootstrap }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="btn btn-square btn-outline-primary"
                  style={{ width: 36, height: 36, fontSize: 14, transition: 'all 0.3s ease' }}
                >
                  <i className={`${isBootstrap ? 'bi' : 'fab'} ${icon}`} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4" style={{ letterSpacing: '1px' }}>
              <i className="fa fa-link me-2 text-primary" />
              Quick Links
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-1">
              {footerLinks.quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-light text-decoration-none d-inline-flex align-items-center gap-2 py-1"
                    style={{ transition: 'color 0.2s ease, transform 0.2s ease' }}
                  >
                    <span
                      className="text-primary"
                      style={{ fontSize: '0.6rem', opacity: 0.7 }}
                    >▶</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Our Services */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4" style={{ letterSpacing: '1px' }}>
              <i className="fa fa-cogs me-2 text-primary" />
              Our Services
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-1">
              {footerLinks.services.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-light text-decoration-none d-inline-flex align-items-center gap-2 py-1"
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    <span className="text-primary" style={{ fontSize: '0.6rem', opacity: 0.7 }}>▶</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Careers ← NEW dedicated column */}
          <div className="col-lg-3 col-md-6">
            <h5 className="text-white fw-bold mb-4" style={{ letterSpacing: '1px' }}>
              <i className="fa fa-user-tie me-2 text-primary" />
              Careers
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-2">
              {footerLinks.careers.map(({ label, href, icon, highlight }) => (
                <li key={label}>
                  {highlight ? (
                    /* Internships gets a glowing pill treatment */
                    <Link
                      href={href}
                      className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold"
                      style={{
                        background: 'rgba(0, 242, 254, 0.1)',
                        border: '1px solid rgba(0, 242, 254, 0.35)',
                        color: '#00f2fe',
                        textDecoration: 'none',
                        boxShadow: '0 0 15px rgba(0,242,254,0.15)',
                        transition: 'all 0.3s ease',
                        fontSize: '0.9rem',
                      }}
                    >
                      <i className={`fa ${icon}`} />
                      {label}
                      <span
                        className="ms-1 rounded-pill px-2 text-dark fw-bold"
                        style={{ background: '#00f2fe', fontSize: '0.65rem', letterSpacing: '1px' }}
                      >
                        OPEN
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href={href}
                      className="text-light text-decoration-none d-inline-flex align-items-center gap-2 py-1"
                      style={{ transition: 'color 0.2s ease' }}
                    >
                      <i className={`fa ${icon} text-primary`} style={{ width: 16 }} />
                      {label}
                    </Link>
                  )}
                </li>
              ))}

              {/* Hiring badge */}
              <li className="mt-3">
                <div
                  className="rounded-3 p-3"
                  style={{
                    background: 'rgba(0,242,254,0.05)',
                    border: '1px solid rgba(0,242,254,0.12)',
                  }}
                >
                  <div className="text-primary fw-bold small mb-1">
                    <i className="fa fa-circle me-1" style={{ fontSize: '0.5rem', animation: 'glowPulse 2s infinite' }} />
                    We&apos;re Hiring!
                  </div>
                  <div className="text-light" style={{ fontSize: '0.78rem', opacity: 0.8 }}>
                    Students &amp; freshers welcome. Apply for internships in Web Dev, AI/ML, Cybersecurity &amp; more.
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="container py-3">
          <div className="row align-items-center g-2">
            <div className="col-md-6 text-center text-md-start">
              <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>
                &copy; {year}{' '}
                <Link href="/" className="text-primary text-decoration-none fw-semibold">
                  ABWcurious
                </Link>
                . All Rights Reserved.
              </span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-inline-flex flex-wrap justify-content-center justify-content-md-end gap-3" style={{ fontSize: '0.82rem' }}>
                <Link href="/"            className="text-light text-decoration-none" style={{ opacity: 0.7 }}>Home</Link>
                <Link href="/about"       className="text-light text-decoration-none" style={{ opacity: 0.7 }}>About</Link>
                <Link href="/internships" className="text-primary text-decoration-none fw-semibold">Internships</Link>
                <Link href="/privacy"     className="text-light text-decoration-none" style={{ opacity: 0.7 }}>Privacy</Link>
                <Link href="/terms"       className="text-light text-decoration-none" style={{ opacity: 0.7 }}>Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}