import ContactForm from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <div className="min-vh-100">
      <div className="container-fluid bg-primary py-5 mb-5">
        <div className="container text-center text-white">
          <h1 className="display-4 mb-2">Contact Us</h1>
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
            <h2 className="h1 text-dark mb-3">Get In Touch</h2>
            <p className="text-muted mb-4">Ready to start your learning journey? Have questions about our services?</p>

            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="flex-shrink-0 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>📧</div>
              <div><h6 className="mb-0">Email</h6><a href="mailto:info@abwcurious.com">info@abwcurious.com, sales@abwcurious.com</a></div>
            </div>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="flex-shrink-0 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>📞</div>
              <div><h6 className="mb-0">Phone</h6><a href="tel:+01234567890">+91 8108915402</a></div>
            </div>
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="flex-shrink-0 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>📍</div>
              <div><h6 className="mb-0">Office</h6><span>Vashi, Navi Mumbai, Maharashtra, India</span></div>
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
