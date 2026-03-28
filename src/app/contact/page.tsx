import ContactForm from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <div className="min-vh-100 pt-5">
      <div className="container-fluid pt-5 mt-5 pb-5 mb-5" style={{ background: 'rgba(5, 5, 10, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <h1 className="display-4 text-white mb-3 fw-bold">Contact Us</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0">
              <li className="breadcrumb-item"><a className="text-white-50" href="/">Home</a></li>
              <li className="breadcrumb-item active text-white" aria-current="page">Contact</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-6">
            <h2 className="display-6 text-white mb-3 fw-bold">Get In Touch</h2>
            <p className="text-white-50 mb-5">Ready to start your learning journey? Have questions about our services?</p>

            <div className="d-flex align-items-start gap-4 mb-4">
              <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.2)' }}><span className="fs-3">📧</span></div>
              <div><h5 className="mb-2 text-white">Email</h5><a href="mailto:abwcurious.pvtltd@gmail.com" className="text-white-50">Info@abwcurious.com</a></div>
            </div>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.2)' }}><span className="fs-3">📞</span></div>
              <div><h5 className="mb-2 text-white">Phone</h5><a href="tel:+01234567890" className="text-white-50">+91 8108915402</a></div>
            </div>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64, background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.2)' }}><span className="fs-3">📍</span></div>
              <div><h5 className="mb-2 text-white">Office</h5><span className="text-white-50">Vashi, Navi Mumbai, Maharashtra, India</span></div>
            </div>
          </div>

          <div className="col-lg-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
