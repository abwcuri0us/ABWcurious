import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">
        <div className="glass-card p-4 p-md-5 mx-auto" style={{ maxWidth: 800 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <Shield size={40} className="text-primary" />
            <h1 className="fw-bold text-white mb-0">Privacy Policy</h1>
          </div>
          
          <div className="text-white-50" style={{ lineHeight: 1.8 }}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h4 className="text-white mt-4 mb-3">1. Information We Collect</h4>
            <p>At ABW Curious Learning, we collect information that you manually provide us via our contact and join requests forms. This includes your name, email address, date of birth, and location.</p>

            <h4 className="text-white mt-4 mb-3">2. How We Use Your Information</h4>
            <p>We use the data provided to contact you regarding your inquiries, enroll you in training programs, and improve your digital learning experience. We do not sell your data to third parties.</p>

            <h4 className="text-white mt-4 mb-3">3. Data Security</h4>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information in our systems.</p>

            <h4 className="text-white mt-4 mb-3">4. Contact Us</h4>
            <p>If there are any questions regarding this privacy policy, you may contact us using the information on our website footer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
