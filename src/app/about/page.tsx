import { Globe2, Target, Award } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-vh-100 pt-5 mt-5">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-3">About <span className="text-primary" style={{ textShadow: '0 0 15px rgba(0,242,254,0.5)' }}>Us</span></h1>
          <p className="lead text-white-50 mx-auto" style={{ maxWidth: 700 }}>
            ABW Curious Learning is a premier destination for mastering digital technologies, advancing enterprise capabilities, and shaping the future of web and cyber architecture.
          </p>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100 text-center">
              <Globe2 size={48} className="text-primary mb-4 mx-auto" />
              <h3 className="h4 text-white mb-3 fw-bold">Global Reach</h3>
              <p className="text-white-50">Impactful digital solutions designed to span continents. We train individuals and enterprises globally.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100 text-center">
              <Target size={48} className="text-primary mb-4 mx-auto" />
              <h3 className="h4 text-white mb-3 fw-bold">Our Mission</h3>
              <p className="text-white-50">To provide unparalleled tech education and software development services that drive real-world transformation.</p>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="glass-card p-4 h-100 text-center">
              <Award size={48} className="text-primary mb-4 mx-auto" />
              <h3 className="h4 text-white mb-3 fw-bold">Excellence</h3>
              <p className="text-white-50">A commitment to writing flawless code, building secure applications, and fostering the brightest talent.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-4 text-center">
          <h2 className="text-white fw-bold mb-4">Want to be part of the journey?</h2>
          <Link href="/join-now" className="btn btn-primary px-5 py-3">Join Our Network</Link>
        </div>
      </div>
    </div>
  );
}
