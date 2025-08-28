'use client';

import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="container-fluid bg-dark text-light footer pt-5 mt-5">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-4">Get In Touch</h4>
            <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>Vashi, Navi Mumbai, Maharashtra, India</p>
            <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+917045360444</p>
            <p className="mb-2"><i className="fa fa-envelope me-3"></i>info@abwcurious.com</p>
            <div className="d-flex pt-2">
              <a className="btn btn-square btn-outline-light me-1" href="#"><i className="fab fa-twitter"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="#"><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="#"><i className="fab fa-youtube"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="#"><i className="fab fa-linkedin-in"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="#"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-4">Quick Links</h4>
            <Link className="btn btn-link" href="/about">About Us</Link>
            <Link className="btn btn-link" href="/contact">Contact Us</Link>
            <Link className="btn btn-link" href="/join-now">Join Now</Link>
            <Link className="btn btn-link" href="/cyber-intelligence">Cyber Intelligence</Link>
            <Link className="btn btn-link" href="/privacy">Privacy Policy</Link>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-4">Our Services</h4>
            <Link className="btn btn-link" href="/services/web-development">Web Development</Link>
            <Link className="btn btn-link" href="/services/mobile-development">Mobile Development</Link>
            <Link className="btn btn-link" href="/services/cyber-security">Cyber Security</Link>
            <Link className="btn btn-link" href="/services/training">Professional Training</Link>
            <Link className="btn btn-link" href="/services/career-guidance">Career Guidance</Link>
          </div>

          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-4">Newsletter</h4>
            <p>Subscribe to our newsletter for updates</p>
            <div className="position-relative mx-auto" style={{ maxWidth: '400px' }}>
              <input className="form-control border-0 rounded-pill w-100 ps-4 pe-5 py-3" type="text" placeholder="Your Email" style={{ height: '48px' }} />
              <button type="button" className="btn shadow-none position-absolute top-0 end-0 mt-1 me-2">
                <i className="fa fa-paper-plane text-primary fs-4"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; {currentYear} <a className="border-bottom" href="#">ABW Curious Learning</a>, All Right Reserved.
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link href="/">Home</Link>
                <Link href="/cookies">Cookies</Link>
                <Link href="/help">Help</Link>
                <Link href="/faq">FQAs</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;


