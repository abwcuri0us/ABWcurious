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
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      <div className="service-item text-center pt-3 h-100">
        <div className="p-4">
          <div className="mb-4">
            <div className="mx-auto bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center text-primary" style={{ width: 64, height: 64, fontSize: 24 }}>
              {icon}
            </div>
          </div>
          <h5 className="mb-3 text-dark fw-semibold">{title}</h5>
          <p className="text-muted">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;


