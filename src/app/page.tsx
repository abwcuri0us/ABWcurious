'use client';

import { useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Hero from '@/components/ui/Hero';
import ServiceCard from '@/components/ui/ServiceCard';
import { Globe, Smartphone, Shield, GraduationCap, Users, Target, BookOpen, Award } from 'lucide-react';

export default function Home() {
  const services = [
    { icon: <Globe size={32} />, title: "Web Development", description: "Modern web applications with cutting-edge technologies and responsive design.", delay: 0.1 },
    { icon: <Smartphone size={32} />, title: "Mobile Development", description: "Native and cross-platform mobile apps for iOS and Android devices.", delay: 0.2 },
    { icon: <Shield size={32} />, title: "Cyber Security", description: "Comprehensive security solutions to protect your digital assets.", delay: 0.3 },
    { icon: <GraduationCap size={32} />, title: "Professional Training", description: "Industry-focused training programs to enhance your skills.", delay: 0.4 },
    { icon: <Users size={32} />, title: "Team Building", description: "Collaborative learning environments for team development.", delay: 0.5 },
    { icon: <Target size={32} />, title: "Career Guidance", description: "Personalized career counseling and development planning.", delay: 0.6 },
    { icon: <BookOpen size={32} />, title: "Online Learning", description: "Flexible online courses accessible from anywhere, anytime.", delay: 0.7 },
    { icon: <Award size={32} />, title: "Certification", description: "Industry-recognized certifications to boost your credentials.", delay: 0.8 }
  ];

  return (
    <div className="home-page">
      <Hero />

      <motion.section 
        className="py-5 bg-light"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <motion.h2 
                className="display-5 text-dark mb-3"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Welcome to <span className="text-primary">ABW Curious Learning</span>
              </motion.h2>
              <motion.p 
                className="lead text-muted mb-3"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                We are dedicated to providing high-quality online learning experiences, professional training programs, and career development opportunities.
              </motion.p>
              <motion.p 
                className="lead text-muted mb-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                With our expert instructors and comprehensive curriculum, we help students and professionals achieve their goals through innovative learning methods.
              </motion.p>
              <motion.div 
                className="d-flex flex-wrap gap-3"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <a href="/about" className="btn btn-primary">Learn More</a>
                <a href="/join-now" className="btn btn-outline-primary">Get Started</a>
              </motion.div>
            </div>

            <div className="col-lg-6">
              <motion.div 
                className="position-relative rounded-3 overflow-hidden shadow-lg"
                style={{ height: 400 }}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <img src="/images/about1.jpeg" alt="ABW Curious Learning" className="w-100 h-100 object-fit-cover" />
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(6,187,204,0.2)' }}></div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-5"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container">
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="display-5 text-dark mb-3">Our <span className="text-primary">Services</span></h2>
            <p className="lead text-muted">We offer a comprehensive range of services designed to meet your learning and development needs.</p>
          </motion.div>
          <div className="row g-4">
            {services.map((s, i) => (
              <ServiceCard key={i} icon={s.icon} title={s.title} description={s.description} delay={s.delay} />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="py-5 bg-primary"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container text-center text-white">
          <motion.h2 
            className="display-5 mb-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Ready to Start Your Learning Journey?
          </motion.h2>
          <motion.p 
            className="lead mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Join thousands of learners who have transformed their careers.
          </motion.p>
          <motion.div 
            className="d-flex flex-wrap gap-3 justify-content-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <a href="/join-now" className="btn btn-light">Join Now</a>
            <a href="/contact" className="btn btn-outline-light">Contact Us</a>
          </motion.div>
        </div>
      </motion.section>

      <style jsx>{`
        .home-page {
          overflow-x: hidden;
        }

        .btn {
          transition: all 0.3s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-primary:hover {
          box-shadow: 0 4px 12px rgba(6, 187, 204, 0.3);
        }

        .btn-outline-primary:hover {
          box-shadow: 0 4px 12px rgba(6, 187, 204, 0.2);
        }

        .btn-light:hover {
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
        }

        .btn-outline-light:hover {
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

      `}</style>
    </div>
  );
}
