'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Hero = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => setIsLoaded(true), []);

  const heroSlides = [
    {
      id: 1,
      title: "Let's Start Career With Us",
      subtitle: "Online learning, Training & Job",
      description: "Join us for your better future",
      primaryButton: { text: "Read More", href: "#" },
      secondaryButton: { text: "Join Now", href: "/join-now" },
      theme: 'holographic-planet'
    },
    {
      id: 2,
      title: "Professional Development",
      subtitle: "Skill Enhancement & Growth",
      description: "Transform your career with expert guidance",
      primaryButton: { text: "Learn More", href: "/about" },
      secondaryButton: { text: "Get Started", href: "/join-now" },
      theme: 'holographic-ship'
    }
  ];

  if (!isLoaded) return null;

  return (
    <div className="hero-section position-relative" style={{ minHeight: '100vh', background: 'transparent' }}>
      
      {/* 3D Space Physics Globals */}
      <style>{`
        @keyframes floatSpace {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes spinPlanet {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseHolo {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 40px rgba(0,242,254,0.5); }
          50% { opacity: 0.9; box-shadow: 0 0 90px rgba(0,242,254,0.9); }
        }
        @keyframes ringSpin {
          0% { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(0deg); }
          100% { transform: translate(-50%, -50%) rotateX(70deg) rotateZ(360deg); }
        }
        .hero-swiper {
          height: 100vh;
          width: 100%;
        }
        .hero-slide {
          height: 100%;
          width: 100%;
        }
      `}</style>

      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
        pagination={{ clickable: true, el: '.swiper-pagination' }}
        className="hero-swiper"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="hero-slide">
            <div className="position-relative w-100 h-100 d-flex align-items-center" style={{ background: 'rgba(5, 5, 10, 0.6)' }}>
              
              {/* Dynamic Action Holograms */}
              <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
                {slide.theme === 'holographic-planet' && (
                  <motion.div 
                    className="position-absolute top-50 end-0 translate-middle-y me-5 d-none d-lg-block" 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    <div style={{ width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, rgba(6,187,204,0.9), rgba(15,23,42,0.8))', animation: 'spinPlanet 40s linear infinite', boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.8), 0 0 50px rgba(6,187,204,0.4)', border: '2px solid rgba(0,242,254,0.3)', position: 'relative' }}>
                      {/* Saturn Rings */}
                      <div className="position-absolute top-50 start-50" style={{ width: '700px', height: '700px', border: '15px solid rgba(0,242,254,0.2)', borderTopColor: 'rgba(0,242,254,0.8)', borderBottomColor: 'rgba(33,150,243,0.8)', borderRadius: '50%', animation: 'ringSpin 20s linear infinite', filter: 'blur(2px)' }}></div>
                    </div>
                  </motion.div>
                )}

                {slide.theme === 'holographic-ship' && (
                  <motion.div 
                    className="position-absolute top-50 end-0 translate-middle-y me-5 d-none d-lg-block" 
                    style={{ animation: 'floatSpace 6s ease-in-out infinite' }}
                    initial={{ opacity: 0, x: 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                    {/* CSS Interceptor Spaceship */}
                     <div className="position-relative" style={{ width: '400px', height: '200px', transform: 'rotate(-15deg)' }}>
                        {/* Main Hull */}
                        <div className="position-absolute top-50 start-50 translate-middle" style={{ width: '300px', height: '80px', background: 'linear-gradient(90deg, rgba(6,187,204,0.9), rgba(33,150,243,0.6))', borderRadius: '50% 50% 50% 50% / 100% 100% 40% 40%', boxShadow: '0 0 40px rgba(0,242,254,0.5)', border: '2px solid rgba(255,255,255,0.4)' }}></div>
                        {/* Cockpit */}
                        <div className="position-absolute top-0 start-50 translate-middle-x mt-4" style={{ width: '120px', height: '50px', background: 'rgba(5, 5, 20, 0.9)', borderRadius: '50px 50px 0 0', border: '3px solid #0dcaf0', boxShadow: 'inset 0 0 20px #0dcaf0' }}></div>
                        {/* Wings */}
                        <div className="position-absolute top-50 start-50 translate-middle ms-4" style={{ width: '250px', height: '180px', borderRight: '80px solid rgba(33,150,243,0.5)', borderTop: '50px solid transparent', borderBottom: '50px solid transparent', filter: 'blur(1px)' }}></div>
                        {/* Engine Thruster */}
                        <div className="position-absolute align-items-center" style={{ width: '150px', height: '40px', background: 'linear-gradient(to left, #0dcaf0, transparent)', left: '-100px', top: '80px', borderRadius: '20px', animation: 'pulseHolo 0.5s infinite alternate', filter: 'blur(4px)' }}></div>
                     </div>
                  </motion.div>
                )}
              </div>

              {/* Text Matrix */}
              <div className="container position-relative z-1 h-100 d-flex align-items-center">
                <div className="row w-100">
                  <div className="col-sm-10 col-lg-7">
                    <motion.h5 
                      className="text-primary text-uppercase mb-3 fw-bold" 
                      style={{ letterSpacing: '3px', textShadow: '0 0 15px rgba(0,242,254,0.8)' }}
                      initial={{ opacity: 0, x: -50 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      {slide.title}
                    </motion.h5>
                    <motion.h1 
                      className="display-2 text-white mb-4 fw-bold lh-sm" 
                      style={{ textShadow: '0 5px 20px rgba(0,0,0,0.8)' }}
                      initial={{ opacity: 0, x: -50 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      {slide.subtitle}
                    </motion.h1>
                    <motion.p 
                      className="fs-4 text-light fw-medium mb-5 pb-2 opacity-100" 
                      style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
                      initial={{ opacity: 0, x: -50 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      {slide.description}
                    </motion.p>
                    <motion.div 
                      className="d-flex gap-4 flex-wrap" 
                      initial={{ opacity: 0, y: 50 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <Link href={slide.primaryButton.href} className="btn btn-primary rounded-pill py-3 px-5 fw-bold shadow-lg" style={{ background: 'linear-gradient(90deg, #06BBCC, #2196f3)', border: 'none', transition: 'all 0.3s' }}>
                        {slide.primaryButton.text}
                      </Link>
                      <Link href={slide.secondaryButton.href} className="btn btn-outline-light rounded-pill py-3 px-5 fw-bold shadow-sm" style={{ borderWidth: '2px', transition: 'all 0.3s' }}>
                        {slide.secondaryButton.text}
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Swiper Controls */}
      <div className="swiper-button-prev d-none d-md-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', left: '30px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff' }}></div>
      <div className="swiper-button-next d-none d-md-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', right: '30px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#fff' }}></div>
    </div>
  );
};

export default Hero;
