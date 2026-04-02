import { Globe2, Target, Award, Eye, Heart, Lightbulb, Users, Shield, Cpu } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | ABWcurious - Empowering Businesses & Students',
  description:
    'Learn about ABWcurious — our mission to empower businesses and students through IT support, cybersecurity, web development, digital marketing, AI/ML solutions, and interactive training programs.',
};

export default function AboutPage() {
  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">

        {/* ── Hero Heading ── */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">
            About{' '}
            <span className="text-primary" style={{ textShadow: '0 0 15px rgba(0,242,254,0.5)' }}>
              Us
            </span>
          </h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 750 }}>
            ABWcurious is a premier destination for mastering digital technologies, advancing enterprise
            capabilities, and shaping the future of web, cyber, and AI architecture.
          </p>
        </div>

        {/* ── Why ABWcurious ── */}
        <div className="glass-card p-5 rounded-4 mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h2 className="h2 fw-bold text-white mb-4" style={{ textShadow: '0 0 12px rgba(0,242,254,0.3)' }}>
                Why{' '}
                <span className="text-primary">ABWcurious?</span>
              </h2>
              <p className="text-white-50 fs-5 mb-4" style={{ lineHeight: 1.8 }}>
                At ABWcurious, we are committed to empowering businesses and students alike in today&apos;s
                rapidly evolving digital landscape. We offer a comprehensive suite of services including{' '}
                <strong className="text-white">IT support</strong>,{' '}
                <strong className="text-white">cybersecurity solutions</strong>,{' '}
                <strong className="text-white">website &amp; application development</strong>,{' '}
                <strong className="text-white">digital marketing</strong>, and cutting-edge{' '}
                <strong className="text-white">AI &amp; Machine Learning solutions</strong> tailored to
                modern business needs.
              </p>
              <p className="text-white-50 fs-5 mb-4" style={{ lineHeight: 1.8 }}>
                Beyond services, our mission extends to nurturing future tech professionals. Through
                interactive training programs, animated educational videos, and hands-on learning, we equip
                students with real-world skills to grow and thrive in the technical world. Whether you&apos;re a
                company seeking digital transformation or a student aiming to break into IT,{' '}
                <span className="text-primary fw-bold">ABWcurious is your trusted partner in innovation and growth.</span>
              </p>

              {/* Social / Website Links */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <a
                  href="https://www.abwcurious.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary px-4 py-2"
                >
                  <i className="fa fa-globe me-2" />
                  www.abwcurious.com
                </a>
                <a
                  href="https://www.facebook.com/people/ABWcurious/61579618321899/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-square btn-outline-light"
                  title="Facebook"
                >
                  <i className="fab fa-facebook-f" />
                </a>
                <a
                  href="https://www.instagram.com/abwcurious"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-square btn-outline-light"
                  title="Instagram"
                >
                  <i className="fab fa-instagram" />
                </a>
                <a
                  href="https://x.com/abwcurious"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-square btn-outline-light"
                  title="Twitter / X"
                >
                  <i className="bi bi-twitter-x" />
                </a>
                <a
                  href="https://www.linkedin.com/company/abwcurious"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-square btn-outline-light"
                  title="LinkedIn"
                >
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>
            </div>

            <div className="col-lg-5 text-center">
              <div
                className="mx-auto d-flex align-items-center justify-content-center rounded-4"
                style={{
                  width: '100%',
                  maxWidth: 340,
                  height: 340,
                  background: 'rgba(0,242,254,0.05)',
                  border: '2px solid rgba(0,242,254,0.2)',
                  boxShadow: '0 0 60px rgba(0,242,254,0.1)',
                }}
              >
                <div className="text-center p-4">
                  <Cpu size={72} className="text-primary mb-3" style={{ filter: 'drop-shadow(0 0 12px rgba(0,242,254,0.6))' }} />
                  <h3 className="text-white fw-bold mb-2">Innovation</h3>
                  <p className="text-white-50 mb-0">Driving the future of technology &amp; education</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Vision & Mission ── */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    background: 'rgba(0,242,254,0.1)',
                    border: '1px solid rgba(0,242,254,0.3)',
                  }}
                >
                  <Eye size={28} className="text-primary" />
                </div>
                <h3 className="h3 text-white fw-bold mb-0">Our Vision</h3>
              </div>
              <p className="text-white-50" style={{ lineHeight: 1.8 }}>
                To be the leading digital empowerment platform globally — where every business can achieve
                seamless digital transformation and every student can access world-class tech education,
                bridging the gap between ambition and achievement in the technology sector.
              </p>
              <div className="mt-4 d-flex flex-wrap gap-2">
                {['Global Impact', 'Digital Transformation', 'Inclusive Education'].map((tag) => (
                  <span
                    key={tag}
                    className="badge rounded-pill px-3 py-2"
                    style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)', fontSize: '0.8rem' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-card p-4 h-100">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    background: 'rgba(0,242,254,0.1)',
                    border: '1px solid rgba(0,242,254,0.3)',
                  }}
                >
                  <Target size={28} className="text-primary" />
                </div>
                <h3 className="h3 text-white fw-bold mb-0">Our Mission</h3>
              </div>
              <p className="text-white-50" style={{ lineHeight: 1.8 }}>
                To provide unparalleled tech education and cutting-edge digital services — empowering
                businesses with IT support, cybersecurity, web &amp; app development, digital marketing, and
                AI/ML solutions, while equipping future professionals through interactive training, animated
                educational content, and hands-on real-world learning experiences.
              </p>
              <div className="mt-4 d-flex flex-wrap gap-2">
                {['IT Support', 'Cybersecurity', 'AI & ML', 'Training'].map((tag) => (
                  <span
                    key={tag}
                    className="badge rounded-pill px-3 py-2"
                    style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)', fontSize: '0.8rem' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Value Pillars ── */}
        <div className="row g-4 mb-5">
          {[
            {
              icon: <Globe2 size={40} />,
              title: 'Global Reach',
              desc: 'Impactful digital solutions designed to span continents. We train individuals and enterprises globally, delivering excellence across borders.',
            },
            {
              icon: <Shield size={40} />,
              title: 'Cybersecurity First',
              desc: 'Comprehensive security solutions to protect your digital assets — from threat detection to full incident response, your safety is our priority.',
            },
            {
              icon: <Lightbulb size={40} />,
              title: 'AI & Innovation',
              desc: 'Cutting-edge AI & Machine Learning solutions tailored to modern business needs, helping you stay ahead in an ever-evolving digital landscape.',
            },
            {
              icon: <Users size={40} />,
              title: 'Student Empowerment',
              desc: 'Through animated educational videos and hands-on programs, we equip students with real-world IT skills to grow and thrive in the technical world.',
            },
            {
              icon: <Heart size={40} />,
              title: 'Trusted Partner',
              desc: 'Whether you\'re a company seeking digital transformation or a student breaking into IT, ABWcurious is your trusted partner in innovation and growth.',
            },
            {
              icon: <Award size={40} />,
              title: 'Excellence',
              desc: 'A commitment to flawless code, secure applications, and fostering the brightest talent — we hold ourselves to the highest professional standards.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="col-lg-4 col-md-6">
              <div className="glass-card p-4 h-100 text-center">
                <div className="text-primary mb-3 mx-auto" style={{ filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.5))' }}>
                  {icon}
                </div>
                <h4 className="h5 text-white fw-bold mb-3">{title}</h4>
                <p className="text-white-50 mb-0" style={{ lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Services Overview ── */}
        <div className="glass-card p-5 rounded-4 mb-5">
          <h2 className="h3 fw-bold text-white text-center mb-4">
            What We{' '}
            <span className="text-primary">Offer</span>
          </h2>
          <div className="row g-3 text-center">
            {[
              { icon: 'fa-laptop-code', label: 'IT Support' },
              { icon: 'fa-shield-alt', label: 'Cybersecurity' },
              { icon: 'fa-globe', label: 'Web & App Development' },
              { icon: 'fa-bullhorn', label: 'Digital Marketing' },
              { icon: 'fa-brain', label: 'AI & Machine Learning' },
              { icon: 'fa-graduation-cap', label: 'Training Programs' },
            ].map(({ icon, label }) => (
              <div key={label} className="col-6 col-md-4 col-lg-2">
                <div
                  className="p-3 rounded-3 h-100"
                  style={{ background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.1)', transition: 'all 0.3s' }}
                >
                  <i className={`fa ${icon} text-primary fs-3 mb-2 d-block`} />
                  <small className="text-white-50 fw-medium">{label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="glass-panel p-5 rounded-4 text-center">
          <h2 className="text-white fw-bold mb-3">Want to be part of the journey?</h2>
          <p className="text-white-50 mb-4">
            Join our growing community of businesses and students shaping the future of technology.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link href="/join-now" className="btn btn-primary px-5 py-3">
              Join Our Network
            </Link>
            <Link href="/contact" className="btn btn-outline-primary px-5 py-3">
              Get in Touch
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
