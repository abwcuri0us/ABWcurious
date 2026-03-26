'use client';

import { motion } from 'framer-motion';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const ServiceCard = ({ icon, title, description, delay = 0 }: ServiceCardProps) => {
  return (
    <motion.div
      className="col-lg-3 col-sm-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, rotateX: 8, rotateY: -8, z: 50 }}
      transition={{ duration: 0.4, delay }}
      viewport={{ once: true }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      <div 
        className="service-item glass-card text-center pt-3 h-100 border-0"
        style={{ transform: 'translateZ(30px)', background: 'rgba(10, 10, 20, 0.8)', backdropFilter: 'blur(16px)' }}
      >
        <div className="p-4" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(20px)' }}>
          <div className="mb-4">
            <div className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: 64, height: 64, fontSize: 24, background: 'rgba(0, 242, 254, 0.1)', boxShadow: '0 0 15px rgba(0,242,254,0.2)' }}>
              {icon}
            </div>
          </div>
          <h5 className="mb-3 text-white fw-semibold" style={{ transform: 'translateZ(30px)' }}>{title}</h5>
          <p style={{ color: '#e2e8f0', transform: 'translateZ(10px)' }}>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
