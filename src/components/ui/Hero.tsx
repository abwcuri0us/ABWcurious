'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
      image: '/images/homepage1.jpg',
      title: "Let's Start Career With Us",
      subtitle: "Online learning, Training & Job",
      description: "Join us for your better future",
      primaryButton: { text: "Read More", href: "#" },
      secondaryButton: { text: "Join Now", href: "/join-now" }
    },
    {
      id: 2,
      image: '/images/homepage2.jpg',
      title: "Professional Development",
      subtitle: "Skill Enhancement & Growth",
      description: "Transform your career with expert guidance",
      primaryButton: { text: "Learn More", href: "/about" },
      secondaryButton: { text: "Get Started", href: "/join-now" }
    }
  ];

  if (!isLoaded) return null;

  return (
    <div className="hero-section">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{ nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }}
        pagination={{ clickable: true, el: '.swiper-pagination' }}
        className="hero-swiper"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="hero-slide">
            <div className="hero-slide-content">
              <Image src={slide.image} alt={slide.title} fill className="hero-image" priority={slide.id === 1} />
              <div className="hero-overlay">
                <div className="container h-100">
                  <div className="row h-100 align-items-center">
                    <div className="col-sm-10 col-lg-8">
                      <motion.h5 
                        className="text-primary text-uppercase mb-3 fw-bold" 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.2 }}
                      >
                        {slide.title}
                      </motion.h5>
                      <motion.h1 
                        className="display-2 text-white mb-4 fw-bold" 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.4 }}
                      >
                        {slide.subtitle}
                      </motion.h1>
                      <motion.p 
                        className="fs-4 text-white mb-4 pb-2" 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        {slide.description}
                      </motion.p>
                      <motion.div 
                        className="d-flex gap-3 flex-wrap" 
                        initial={{ opacity: 0, y: -50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.8, delay: 0.8 }}
                      >
                        <Link href={slide.primaryButton.href} className="btn btn-primary btn-lg py-3 px-5 fw-bold">
                          {slide.primaryButton.text}
                        </Link>
                        <Link href={slide.secondaryButton.href} className="btn btn-light btn-lg py-3 px-5 fw-bold">
                          {slide.secondaryButton.text}
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        <div className="swiper-button-next hero-nav-btn">
          <i className="bi bi-chevron-right"></i>
        </div>
        <div className="swiper-button-prev hero-nav-btn">
          <i className="bi bi-chevron-left"></i>
        </div>

        <div className="swiper-pagination hero-pagination"></div>
      </Swiper>

      <style jsx>{`
        .hero-section {
          height: 100vh;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .hero-swiper {
          height: 100vh;
          width: 100%;
        }

        .hero-slide {
          height: 100vh;
          width: 100%;
        }

        .hero-slide-content {
          position: relative;
          width: 100%;
          height: 100vh;
        }

        .hero-image {
          object-fit: cover;
          object-position: center;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(24,29,56,0.8) 0%, rgba(24,29,56,0.6) 100%);
          display: flex;
          align-items: center;
        }

        .hero-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.3s ease;
          color: #181d38;
        }

        .hero-nav-btn:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-50%) scale(1.1);
        }

        .swiper-button-next {
          right: 20px;
        }

        .swiper-button-prev {
          left: 20px;
        }

        .hero-pagination {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          margin: 0 5px;
        }

        .swiper-pagination-bullet-active {
          background: #06BBCC;
          transform: scale(1.2);
        }

        @media (max-width: 768px) {
          .hero-nav-btn {
            width: 40px;
            height: 40px;
          }

          .swiper-button-next {
            right: 10px;
          }

          .swiper-button-prev {
            left: 10px;
          }

          .hero-pagination {
            bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default Hero;


