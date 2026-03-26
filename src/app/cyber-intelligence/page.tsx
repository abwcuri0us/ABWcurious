"use client";
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Zap } from 'lucide-react';

export default function CyberIntelligencePage() {
  const services = [
    { icon: <Shield className="w-12 h-12" />, title: "Security Audits", description: "Comprehensive security assessments to identify vulnerabilities and risks.", features: ["Penetration Testing","Vulnerability Assessment","Security Architecture Review","Compliance Audits"] },
    { icon: <Lock className="w-12 h-12" />, title: "Access Control", description: "Robust access control mechanisms to protect sensitive data.", features: ["Identity Management","Multi-factor Authentication","RBAC","Privilege Management"] },
    { icon: <Eye className="w-12 h-12" />, title: "Threat Monitoring", description: "24/7 monitoring and incident response to protect against attacks.", features: ["SIEM","Real-time Alerts","Incident Response","Forensics"] },
    { icon: <Zap className="w-12 h-12" />, title: "Security Training", description: "Cybersecurity training for employees and professionals.", features: ["Awareness","Technical Skills","IR","Best Practices"] },
  ];

  return (
    <div className="min-vh-100 pt-5">
      <div className="container-fluid pt-5 mt-5 pb-5 mb-5" style={{ background: 'rgba(5, 5, 10, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <motion.h1 className="display-3 text-white fw-bold mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Cyber Intelligence</motion.h1>
          <p className="lead text-white-50">Advanced cybersecurity solutions and training to protect your digital assets.</p>
        </div>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {services.map((s, i) => (
              <motion.div 
                key={i} className="col-lg-6" 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.03, rotateX: 6, rotateY: -6, z: 40 }}
                style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="glass-card rounded-4 p-4 p-lg-5 h-100 border-0 shadow-lg" 
                  style={{ background: 'rgba(10, 10, 20, 0.8)', border: '1px solid rgba(0,242,254,0.15)', transform: 'translateZ(30px)' }}
                >
                  <div className="d-flex align-items-start gap-4 mb-4" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}>
                    <div className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: 72, height: 72, background: 'rgba(0,242,254,0.1)', boxShadow: '0 0 20px rgba(0,242,254,0.2)' }}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 className="h4 text-white mb-2 fw-bold">{s.title}</h3>
                      <p className="text-light fw-medium mb-0">{s.description}</p>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-sm-2 g-3" style={{ transform: 'translateZ(10px)' }}>
                    {s.features.map((f, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-3">
                        <span className="d-inline-block rounded-circle bg-primary" style={{ width: 8, height: 8, boxShadow: '0 0 10px rgba(0,242,254,0.6)' }}></span>
                        <span className="text-light fw-medium small">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


