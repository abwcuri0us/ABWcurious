'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="container-fluid glass-panel border-top border-white border-opacity-10 text-light footer pt-5 mt-5">
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-4">Get In Touch</h4>
            <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>Vashi, Navi Mumbai, Maharashtra, India</p>
            <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+91 8108915402</p>
            <p className="mb-2"><i className="fa fa-envelope me-3"></i>abwcurious.pvtltd@gmail.com</p>
            <div className="d-flex pt-2">
              <a className="btn btn-square btn-outline-light me-1" href="https://github.com/abwcuri0us" target="_blank"><i className="fab fa-github"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="https://www.youtube.com/@ABWcurious" target="_blank"><i className="fab fa-youtube"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="https://www.linkedin.com/company/abwcurious" target="_blank"><i className="fab fa-linkedin-in"></i></a>
              <a className="btn btn-square btn-outline-light me-1" href="https://www.instagram.com/abwcurious" target="_blank"><i className="fab fa-instagram"></i></a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-4">Quick Links</h4>
            <Link className="btn btn-link" href="/about">About Us</Link>
            <Link className="btn btn-link" href="/contact">Contact Us</Link>
            <Link className="btn btn-link" href="/join-now">Join Now</Link>
            <Link className="btn btn-link" href="/cyber-intelligence">Security</Link>
            <Link className="btn btn-link" href="/privacy">Privacy Policy</Link>
            <Link className="btn btn-link" href="/terms">Terms & Conditions</Link>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-4">Our Services</h4>
            <Link className="btn btn-link" href="/services/web-development">Web Development</Link>
            <Link className="btn btn-link" href="/services/mobile-development">Mobile Development</Link>
            <Link className="btn btn-link" href="/services/cyber-security">Cyber Security</Link>
            <Link className="btn btn-link" href="/services/training">Professional Training</Link>
            <Link className="btn btn-link" href="/services/career-guidance">Career Guidance</Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; {currentYear} <Link className="border-bottom" href="/">ABW Curious Learning</Link>, All Right Reserved.
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-menu">
                <Link href="/">Home</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/privacy">Privacy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
