import { FileText } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">
        <div className="glass-card p-4 p-md-5 mx-auto" style={{ maxWidth: 800 }}>
          <div className="d-flex align-items-center gap-3 mb-4">
            <FileText size={40} className="text-primary" />
            <h1 className="fw-bold text-white mb-0">Terms & Conditions</h1>
          </div>
          
          <div className="text-white-50" style={{ lineHeight: 1.8 }}>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h4 className="text-white mt-4 mb-3">1. Acceptance of Terms</h4>
            <p>By accessing and using the ABW Curious Learning platform, you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h4 className="text-white mt-4 mb-3">2. Description of Service</h4>
            <p>ABW Curious Learning provides users with access to a rich collection of resources, including various training materials, software development courses, and mentoring services.</p>

            <h4 className="text-white mt-4 mb-3">3. User Conduct</h4>
            <p>You agree to use our services only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site.</p>

            <h4 className="text-white mt-4 mb-3">4. Intellectual Property</h4>
            <p>All content included on this site, such as text, graphics, logos, and images, is the property of ABW Curious Learning and protected by international copyright laws.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
