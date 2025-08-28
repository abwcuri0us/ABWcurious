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
    <div className="min-vh-100">
      <div className="container-fluid bg-primary py-5 mb-5">
        <div className="container text-center text-white">
          <motion.h1 className="display-4 mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Cyber Intelligence</motion.h1>
          <p className="lead text-white-75">Advanced cybersecurity solutions and training to protect your digital assets.</p>
        </div>
      </div>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {services.map((s, i) => (
              <motion.div key={i} className="col-lg-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="bg-white rounded-3 shadow p-4 h-100">
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: 64, height: 64 }}>{s.icon}</div>
                    <div>
                      <h3 className="h4 text-dark mb-1">{s.title}</h3>
                      <p className="text-muted mb-0">{s.description}</p>
                    </div>
                  </div>
                  <div className="row row-cols-2 g-2">
                    {s.features.map((f, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2">
                        <span className="d-inline-block rounded-circle bg-primary" style={{ width: 8, height: 8 }}></span>
                        <span className="text-muted small">{f}</span>
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


