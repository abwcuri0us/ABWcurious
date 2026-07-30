'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const partnerLogos = [
  { src: '/svg-logos/partners/acer.svg', alt: 'Acer' },
  { src: '/svg-logos/partners/adobe.svg', alt: 'Adobe' },
  { src: '/svg-logos/partners/amd.svg', alt: 'AMD' },
  { src: '/svg-logos/partners/asus.svg', alt: 'ASUS' },
  { src: '/svg-logos/partners/autodesk.svg', alt: 'Autodesk' },
  { src: '/svg-logos/partners/bitdefender.svg', alt: 'Bitdefender' },
  { src: '/svg-logos/partners/cisco.svg', alt: 'Cisco' },
  { src: '/svg-logos/partners/dell.svg', alt: 'Dell' },
  { src: '/svg-logos/partners/google-cloud.svg', alt: 'Google Cloud' },
  { src: '/svg-logos/partners/google.svg', alt: 'Google' },
  { src: '/svg-logos/partners/hp.svg', alt: 'HP' },
  { src: '/svg-logos/partners/ibm.svg', alt: 'IBM' },
  { src: '/svg-logos/partners/intel.svg', alt: 'Intel' },
  { src: '/svg-logos/partners/kaspersky.svg', alt: 'Kaspersky' },
  { src: '/svg-logos/partners/lenovo.svg', alt: 'Lenovo' },
  { src: '/svg-logos/partners/microsoft.svg', alt: 'Microsoft' },
  { src: '/svg-logos/partners/nvidia.svg', alt: 'NVIDIA' },
  { src: '/svg-logos/partners/oracle.svg', alt: 'Oracle' },
  { src: '/svg-logos/partners/red-hat.svg', alt: 'Red Hat' },
  { src: '/svg-logos/partners/veeam.svg', alt: 'Veeam' },
  { src: '/svg-logos/partners/vmware.svg', alt: 'VMware' },
  { src: '/svg-logos/partners/zoho.svg', alt: 'Zoho' },
];

export default function TechPartnersMarquee() {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated light blue background for better logo visibility (dark mode only) */}
      <div className="absolute inset-0 dark:bg-blue-500/10 animate-pulse hidden dark:block" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,transparent_70%)] animate-pulse hidden dark:block" style={{ animationDuration: '3s' }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block text-xs font-semibold tracking-[0.25em] uppercase text-primary mb-3">
            Technology Partners
          </span>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Trusted by Industry{' '}
            <span className="text-gradient-cyan">Leaders</span>
          </h2>
          <p className="text-foreground/70 text-sm sm:text-base max-w-xl mx-auto mt-2">
            We collaborate with the world's top technology providers to deliver
            enterprise-grade solutions.
          </p>
        </motion.div>

        {/* Marquee Track */}
        <div className="relative bg-white dark:bg-white/20 py-4 my-2 rounded-xl shadow-sm border border-black/5 dark:border-white/10 overflow-hidden">
          {/* Fade edges with gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-white dark:from-transparent via-white/80 dark:via-transparent to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-white dark:from-transparent via-white/80 dark:via-transparent to-transparent pointer-events-none" />

          {/* Scrolling row */}
          <motion.div
            className="flex gap-8 sm:gap-12 items-center"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 40,
                ease: 'linear',
              },
            }}
          >
            {/* Duplicate logos for seamless infinite scroll */}
            {[...partnerLogos, ...partnerLogos].map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: 100, height: 48 }}
              >
                <div className="rounded-lg p-2 flex items-center justify-center w-full h-full">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={80}
                    height={32}
                    style={{ width: 'auto', height: 'auto' }}
                    className="max-h-8 object-contain hover:scale-110 transition-all duration-300 dark:brightness-100"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
