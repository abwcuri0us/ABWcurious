import type { Metadata } from 'next';
import ContactForm from '@/components/forms/ContactForm';
import FeedbackForm from '@/components/forms/FeedbackForm';

export const metadata: Metadata = {
  title: 'Contact Us | ABWcurious',
  description: 'Get in touch with ABWcurious for IT support, cybersecurity, web development, AI/ML solutions, digital marketing, and EdTech training inquiries.',
};

export default function ContactPage() {
  return (
    <div className="min-vh-100 pt-5">
      {/* Hero Banner */}
      <div className="container-fluid pt-5 mt-5 pb-5"
        style={{ background: 'rgba(5,5,10,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <span className="badge px-3 py-2 mb-3 fw-semibold rounded-pill"
            style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', color: '#00f2fe', fontSize: 13 }}>
            📬 Get In Touch
          </span>
          <h1 className="display-4 text-white mb-3 fw-bold">Contact Us</h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 600 }}>
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond within 24 hours.
          </p>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0">
              <li className="breadcrumb-item"><a className="text-white-50" href="/">Home</a></li>
              <li className="breadcrumb-item active text-white" aria-current="page">Contact</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Contact Info + Form */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Info Cards */}
          <div className="col-lg-5">
            <h2 className="display-6 text-white mb-2 fw-bold">Let&apos;s Talk</h2>
            <p className="text-white-50 mb-4">Ready to start your learning journey or have questions about our services? Our team is here to help.</p>

            {[
              { icon: '📧', label: 'Email Us', value: 'info@abwcurious.com', href: 'mailto:info@abwcurious.com' },
              { icon: '📞', label: 'Call Us', value: '+91 8108915402', href: 'tel:+918108915402' },
              { icon: '📍', label: 'Visit Us', value: 'Vashi, Navi Mumbai, Maharashtra 400703', href: undefined },
              { icon: '🕐', label: 'Office Hours', value: 'Mon–Sat: 9:00 AM – 7:00 PM IST', href: undefined },
            ].map((item, i) => (
              <div key={i} className="d-flex align-items-start gap-4 mb-4 p-4 rounded-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: 56, height: 56, background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.2)', fontSize: 24 }}>
                  {item.icon}
                </div>
                <div>
                  <h6 className="text-white mb-1 fw-bold">{item.label}</h6>
                  {item.href
                    ? <a href={item.href} className="text-white-50 text-decoration-none" style={{ wordBreak: 'break-all' }}>{item.value}</a>
                    : <span className="text-white-50">{item.value}</span>}
                </div>
              </div>
            ))}

            {/* Social Links */}
            <div className="mt-3">
              <p className="text-white-50 small mb-3">Connect with us:</p>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { label: '🐦 Twitter', href: 'https://x.com/abwcurious' },
                  { label: '💼 LinkedIn', href: 'https://www.linkedin.com/company/abwcurious' },
                  { label: '📸 Instagram', href: 'https://www.instagram.com/abwcurious' },
                  { label: '▶️ YouTube', href: 'https://www.youtube.com/@ABWcurious' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="btn btn-sm px-3 py-2 text-white fw-semibold"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 13 }}>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-7">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="container-fluid py-5" style={{ background: 'rgba(5,5,10,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div className="row g-5 align-items-start">
            {/* Feedback intro */}
            <div className="col-lg-4">
              <span className="badge px-3 py-2 mb-3 fw-semibold rounded-pill"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7', fontSize: 13 }}>
                ⭐ Share Your Experience
              </span>
              <h2 className="text-white fw-bold mb-3">We Value Your Opinion</h2>
              <p className="text-white-50">
                Your feedback helps us continuously improve our services, training programs, and student experience. Take a moment to share how we did.
              </p>
              <div className="mt-4 p-4 rounded-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-white fw-bold mb-1">🏆 Why Rate Us?</p>
                <ul className="text-white-50 small ps-3">
                  <li>Help future students make better decisions</li>
                  <li>Drive improvements in our courses</li>
                  <li>Recognise our team&apos;s hard work</li>
                </ul>
              </div>
            </div>
            {/* Feedback Form */}
            <div className="col-lg-8">
              <div className="glass-card p-4 p-md-5 rounded-4"
                style={{ border: '1px solid rgba(168,85,247,0.15)', background: 'rgba(168,85,247,0.03)' }}>
                <FeedbackForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
