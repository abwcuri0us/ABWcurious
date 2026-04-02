"use client";

import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ServicePage() {
  const params = useParams();
  const rawId = typeof params?.id === 'string' ? params.id : '';
  const serviceTitle = rawId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const serviceData: Record<string, any> = {
    'web-development': {
      title: 'Web Development',
      description: 'End-to-end web architectures built with bleeding-edge full-stack technologies.',
      techStacks: ['React JS', 'Next.js 14 App Router', 'Node.js', 'Express', 'MongoDB / Prisma', 'PostgreSQL', 'Tailwind CSS', 'Framer Motion 3D Mechanics'],
      tiers: [
        { name: 'Basic Portfolio', price: '₹14,999', icon: 'bi-window', offers: ['5 Pages Design', 'Responsive UI', '1 Month Support', 'Basic SEO'] },
        { name: 'Corporate Site', price: '₹29,999', icon: 'bi-building', offers: ['CMS Integration', 'Custom Branding', 'Advanced SEO', 'Analytics Setup'] },
        { name: 'E-Commerce', price: '₹49,999', icon: 'bi-cart4', offers: ['Full Storefront', 'Payment Gateway (Razorpay)', 'Inventory System', 'Admin Dashboard'] }
      ]
    },
    'mobile-development': {
      title: 'Mobile Development',
      description: 'Flawless Native and Cross-Platform applications for all global mobile ecosystems.',
      techStacks: ['Swift (iOS Native)', 'Kotlin & Java (Android Native)', 'Flutter (Hybrid Engine)', 'React Native', 'Firebase Cloud Services', 'SQLite / CoreData'],
      tiers: [
        { name: 'Android OS (Kotlin)', price: '₹39,999', icon: 'bi-android2', offers: ['Native Performance', 'Play Store Setup', 'Local Database', 'Google APIs'] },
        { name: 'iOS App (Swift)', price: '₹49,999', icon: 'bi-apple', offers: ['Premium UI/UX', 'App Store Setup', 'iOS Core Data', 'Apple Services Integration'] },
        { name: 'Hybrid (Flutter)', price: '₹69,999', icon: 'bi-phone-flip', offers: ['Cross-Platform Codebase', 'Fast Deployment', 'Custom Animations', 'Unified Backend'] }
      ]
    },
    'cyber-security': {
      title: 'Cyber Security',
      description: 'Military-grade encryption, threat monitoring, and advanced penetration testing paradigms.',
      techStacks: ['Kali Linux', 'Metasploit Framework', 'Wireshark Network Analyzers', 'Burp Suite', 'Python Automation Scripting', 'OWASP Top 10 Standards', 'AES-256 Bit Encryption'],
      tiers: [
        { name: 'Vulnerability Assessment', price: '₹19,999', icon: 'bi-shield-check', offers: ['Automated Scans', 'Risk Reporting', 'Patch Recommendations', '1 Retest'] },
        { name: 'Penetration Testing', price: '₹44,999', icon: 'bi-incognito', offers: ['Manual Exploitation', 'Deep Network Scan', 'Web App Testing', 'Executive Summary'] },
        { name: 'Enterprise Audit', price: '₹99,999', icon: 'bi-shield-lock-fill', offers: ['Red Teaming', 'Compliance Audit', 'Social Engineering', 'Annual Retainer'] }
      ]
    }
  };

  const data = serviceData[rawId] || {
    title: serviceTitle || 'Premium Service',
    description: 'Explore our advanced capabilities designed to elevate your technical infrastructure.',
    techStacks: ['C++', 'Python', 'JavaScript Arrays', 'Docker Containerization', 'AWS Cloud Matrix'],
    tiers: [
      { name: 'Standard Package', price: 'Custom Quote', icon: 'bi-cpu', offers: ['Core Features', 'Architecture Design', 'Deployment', 'Priority Support'] }
    ]
  };

  return (
    <div className="min-vh-100 pt-5">
      <div className="container-fluid pt-5 mt-5 pb-5 mb-5" style={{ background: 'rgba(5, 5, 10, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <motion.h1 
            className="display-4 mb-3 fw-bold text-primary" 
            style={{ textShadow: '0 0 20px rgba(0,242,254,0.4)' }}
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h1>
          
          <motion.p 
            className="lead text-white-50 mx-auto" style={{ maxWidth: 700 }}
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {data.description}
          </motion.p>
          
          {/* Tech Stacks Array */}
          <motion.div 
            className="d-flex justify-content-center flex-wrap gap-2 mt-4 mx-auto" 
            style={{ maxWidth: '800px' }}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }}
          >
            {data.techStacks.map((tech: string, idx: number) => (
               <span 
                 key={idx} 
                 className="badge bg-dark border border-info border-opacity-50 px-3 py-2 text-info shadow-sm" 
                 style={{ boxShadow: '0 0 10px rgba(0,242,254,0.15)', fontSize: '0.85rem' }}
               >
                 {tech}
               </span>
            ))}
          </motion.div>

        </div>
      </div>

      <div className="container py-5 mt-4">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6">
            <h3 className="text-white fw-bold mb-4">Our Deployment Methodology</h3>
            <p className="text-white-50 lh-lg">
              We leverage an agile, iterative workflow combined with strict quality assurance and automated CI/CD pipelines. This ensures that every deployment is highly stable, inherently secure, and engineered to scale seamlessly across global nodes.
            </p>
            <ul className="text-light list-unstyled mt-4 d-flex flex-column gap-3">
              <li><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i> <strong>Phase 1:</strong> Architecture & Feasibility Mapping</li>
              <li><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i> <strong>Phase 2:</strong> Prototyping & UX Orchestration</li>
              <li><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i> <strong>Phase 3:</strong> Development & Algorithmic Integration</li>
              <li><i className="bi bi-arrow-right-circle-fill text-primary me-2"></i> <strong>Phase 4:</strong> Security Audits & Production Deployment</li>
            </ul>
          </div>
          <div className="col-lg-6">
            <div className="glass-card p-4 rounded-4" style={{ background: 'rgba(0,242,254,0.02)', border: '1px solid rgba(0,242,254,0.1)' }}>
               <h4 className="text-white mb-3"><i className="bi bi-info-circle text-info me-2"></i> Why Choose ABWcurious?</h4>
               <p className="text-white-50 mb-0">Unlike standard agencies, we encode military-grade encryption and futuristic aesthetic principles into the DNA of every project. Your software won't just work—it will dominate.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5 mb-5">
        <div className="row g-4 justify-content-center">
          {data.tiers.map((tier: any, i: number) => (
            <motion.div 
              key={i} className="col-lg-4 col-md-6" 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5, z: 30 }}
              style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
            >
              <div 
                className="glass-card p-4 p-lg-5 h-100 border-0 rounded-4 position-relative overflow-hidden" 
                style={{ transform: 'translateZ(20px)', background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(0,242,254,0.15)' }}
              >
                <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: 72, height: 72, background: 'rgba(0,242,254,0.1)', boxShadow: '0 0 20px rgba(0,242,254,0.2)' }}>
                  <i className={`bi ${tier.icon} text-primary fs-2`} style={{ transform: 'translateZ(10px)' }}></i>
                </div>
                <h4 className="text-white mb-2 fw-bold" style={{ transform: 'translateZ(15px)' }}>{tier.name}</h4>
                <div className="mb-4" style={{ transform: 'translateZ(20px)' }}>
                  <span className="display-6 fw-bold text-primary" style={{ textShadow: '0 0 10px rgba(0,242,254,0.3)' }}>{tier.price}</span>
                </div>
                <div style={{ transform: 'translateZ(5px)' }}>
                  {tier.offers.map((offer: string, idx: number) => (
                    <div key={idx} className="d-flex align-items-center gap-3 mb-2">
                       <i className="bi bi-check-circle-fill text-primary" style={{ fontSize: '1rem' }}></i>
                       <span className="text-white-50 fw-medium">{offer}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5" style={{ transform: 'translateZ(25px)' }}>
                  <Link href={`/checkout?plan=${encodeURIComponent(tier.name)}&price=${encodeURIComponent(tier.price)}&service=${encodeURIComponent(data.title)}`} className="btn btn-outline-primary w-100 rounded-pill py-2 fw-bold d-block text-center">Deploy Plan</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
