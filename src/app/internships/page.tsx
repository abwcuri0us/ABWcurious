import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Briefcase,
  Star,
  Users,
  GraduationCap,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Internships at ABWcurious | Apply Now',
  description:
    'Kickstart your tech career with an internship at ABWcurious. Gain hands-on experience in IT, cybersecurity, web development, digital marketing, and AI/ML. Apply now!',
  keywords:
    'internship, tech internship, IT internship, cybersecurity internship, web development internship, ABWcurious, Navi Mumbai',
};

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform';

const perks = [
  { icon: <GraduationCap size={22} />, text: 'Real-world project experience' },
  { icon: <Star size={22} />, text: 'Mentoring by industry professionals' },
  { icon: <CheckCircle size={22} />, text: 'Certificate of Completion' },
  { icon: <Users size={22} />, text: 'Collaborative team environment' },
  { icon: <Clock size={22} />, text: 'Flexible duration & schedules' },
  { icon: <MapPin size={22} />, text: 'Remote / Vashi, Navi Mumbai' },
];

const tracks = [
  { label: 'Web Development', icon: 'fa-laptop-code', color: '#00f2fe' },
  { label: 'Cybersecurity', icon: 'fa-shield-alt', color: '#4facfe' },
  { label: 'Digital Marketing', icon: 'fa-bullhorn', color: '#06BBCC' },
  { label: 'AI & Machine Learning', icon: 'fa-brain', color: '#a78bfa' },
  { label: 'Mobile Development', icon: 'fa-mobile-alt', color: '#34d399' },
  { label: 'IT Support', icon: 'fa-headset', color: '#fbbf24' },
];

export default function InternshipsPage() {
  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">

        {/* ── Hero ── */}
        <div className="text-center mb-5">
          <div
            className="d-inline-flex align-items-center gap-2 rounded-pill px-4 py-2 mb-4"
            style={{ background: 'rgba(0,242,254,0.12)', border: '1px solid rgba(0,242,254,0.35)' }}
          >
            <Briefcase size={18} className="text-primary" />
            <span className="text-primary fw-bold small text-uppercase" style={{ letterSpacing: '2px' }}>
              Now Accepting Applications
            </span>
          </div>

          <h1 className="display-4 fw-bold text-white mb-3">
            Internships at{' '}
            <span className="text-primary" style={{ textShadow: '0 0 20px rgba(0,242,254,0.6)' }}>
              ABWcurious
            </span>
          </h1>

          <p className="lead text-white mx-auto mb-5" style={{ maxWidth: 680, opacity: 0.9 }}>
            Kickstart your tech career with hands-on experience. Work on real projects, learn from
            industry experts, and build the skills that employers are looking for.
          </p>

          {/* ── HERO APPLY BUTTON ── */}
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-5 py-3 fw-bold"
            style={{
              fontSize: '1.15rem',
              borderRadius: '3rem',
              letterSpacing: '0.5px',
              boxShadow: '0 0 30px rgba(0,242,254,0.5), 0 0 60px rgba(0,242,254,0.2)',
            }}
          >
            <i className="fa fa-paper-plane me-2" />
            Fill &amp; Submit Application Form
            <ExternalLink size={18} className="ms-2" style={{ verticalAlign: 'middle' }} />
          </a>
          <p className="text-white mt-3 small" style={{ opacity: 0.75 }}>
            <i className="fa fa-external-link-alt me-1 text-primary" />
            Opens in a new tab — Google Form
          </p>
        </div>

        {/* ── Internship Tracks ── */}
        <div className="row g-3 mb-5">
          {tracks.map(({ label, icon, color }) => (
            <div key={label} className="col-6 col-md-4 col-lg-2">
              <div className="glass-card p-3 text-center h-100">
                <i
                  className={`fa ${icon} fs-2 mb-2 d-block`}
                  style={{ color, filter: `drop-shadow(0 0 8px ${color}80)` }}
                />
                {/* VISIBLE label text */}
                <span className="text-white fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-5 align-items-start">

          {/* ── Left: Perks + Info ── */}
          <div className="col-lg-4">

            {/* Why Intern */}
            <div className="glass-card p-4 mb-4">
              <h3 className="h5 text-white fw-bold mb-4">
                <Star size={20} className="text-primary me-2" />
                Why Intern With Us?
              </h3>
              <div className="d-flex flex-column gap-3">
                {perks.map(({ icon, text }) => (
                  <div key={text} className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        background: 'rgba(0,242,254,0.15)',
                        color: '#00f2fe',
                        border: '1px solid rgba(0,242,254,0.3)',
                      }}
                    >
                      {icon}
                    </div>
                    {/* FULLY VISIBLE perk text */}
                    <span className="text-white fw-medium" style={{ fontSize: '0.95rem' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Program Details */}
            <div className="glass-card p-4 mb-4">
              <h3 className="h5 text-white fw-bold mb-3">
                <Clock size={20} className="text-primary me-2" />
                Program Details
              </h3>
              <div className="d-flex flex-column">
                {[
                  ['Duration', '1 – 3 Months'],
                  ['Mode', 'Remote / Hybrid'],
                  ['Stipend', 'Performance-Based'],
                  ['Location', 'Vashi, Navi Mumbai, MH'],
                  ['Eligibility', 'Students & Freshers'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="d-flex justify-content-between align-items-center py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {/* label */}
                    <span className="text-white fw-medium" style={{ fontSize: '0.9rem' }}>{k}</span>
                    {/* value */}
                    <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="glass-panel p-4 rounded-4 text-center">
              <p className="text-white fw-medium mb-3">Have questions about our internship program?</p>
              <Link
                href="/contact"
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
              >
                Contact Us <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* ── Right: Application CTA Card ── */}
          <div className="col-lg-8">
            <div
              className="glass-card p-0 text-center"
              style={{ borderRadius: '1.5rem', overflow: 'hidden' }}
            >
              {/* Fake browser bar */}
              <div
                className="d-flex align-items-center gap-2 px-4 py-3"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="d-flex gap-2">
                  {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                    <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <span
                  className="text-white ms-2 text-truncate"
                  style={{ fontSize: '0.72rem', opacity: 0.7, fontFamily: 'monospace' }}
                >
                  docs.google.com/forms/d/e/1FAIpQLSd6d_0Rpq0mt6UKqt9oM9eMwvoaGBZkbTpGlXshFBHFGc6G-Q/viewform
                </span>
              </div>

              {/* Apply section body */}
              <div className="p-5">
                {/* Icon ring */}
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 100,
                    height: 100,
                    background: 'rgba(0,242,254,0.1)',
                    border: '2px solid rgba(0,242,254,0.35)',
                    boxShadow: '0 0 40px rgba(0,242,254,0.2)',
                  }}
                >
                  <Briefcase
                    size={46}
                    className="text-primary"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(0,242,254,0.7))' }}
                  />
                </div>

                <h2 className="h2 text-white fw-bold mb-3">Ready to Apply?</h2>
                <p
                  className="text-white mb-5 mx-auto"
                  style={{ maxWidth: 440, lineHeight: 1.8, fontSize: '1.05rem', opacity: 0.9 }}
                >
                  Fill out our internship application form to get started.
                  Applications are reviewed on a rolling basis — <strong className="text-primary">don&apos;t wait!</strong>
                </p>

                {/* ── BIG APPLY BUTTON ── */}
                <a
                  href={FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary fw-bold d-inline-flex align-items-center gap-2 mb-4"
                  style={{
                    fontSize: '1.2rem',
                    padding: '1rem 2.5rem',
                    borderRadius: '3rem',
                    boxShadow: '0 0 30px rgba(0,242,254,0.45), 0 0 60px rgba(0,242,254,0.15)',
                    letterSpacing: '0.3px',
                  }}
                >
                  <i className="fa fa-paper-plane" />
                  Fill the Internship Form
                  <ExternalLink size={20} />
                </a>

                <p className="text-white" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  <i className="fa fa-lock me-2 text-primary" />
                  Secure Google Form &nbsp;·&nbsp; Opens in a new tab
                </p>
              </div>

              {/* ── Process Steps ── */}
              <div
                className="row g-0 text-start"
                style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
              >
                {[
                  { step: '01', title: 'Fill the Form', desc: 'Complete all required fields in the Google Form.' },
                  { step: '02', title: 'Review', desc: 'Our team reviews your application within 3–5 days.' },
                  { step: '03', title: 'Interview', desc: 'Selected candidates are invited for a short interview.' },
                  { step: '04', title: 'Onboard', desc: 'Get onboarded and start your internship journey!' },
                ].map(({ step, title, desc }, i, arr) => (
                  <div
                    key={step}
                    className="col-md-3 col-6 p-4"
                    style={{
                      borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <div className="text-primary fw-bold fs-4 mb-1" style={{ fontFamily: 'monospace' }}>
                      {step}
                    </div>
                    {/* VISIBLE step title */}
                    <div className="text-white fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{title}</div>
                    {/* VISIBLE step description */}
                    <div className="text-white" style={{ fontSize: '0.8rem', lineHeight: 1.6, opacity: 0.8 }}>
                      {desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
