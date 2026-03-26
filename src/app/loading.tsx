'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center position-fixed top-0 start-0 w-100" style={{ zIndex: 99999, background: 'rgba(5, 5, 10, 0.95)', backdropFilter: 'blur(30px)' }}>
      {/* 3D Orbiting Planets & Meteors Engine */}
      <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: '250px', height: '250px', perspective: '1000px' }}>
         
         {/* Core Glowing Star */}
         <motion.div 
           className="position-absolute rounded-circle" 
           style={{ width: '60px', height: '60px', background: 'radial-gradient(circle, #0dcaf0, #0d6efd)', boxShadow: '0 0 50px #0dcaf0' }}
           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
           transition={{ duration: 3, repeat: Infinity }}
         />

         {/* Orbital Ring 1 (Purple) */}
         <motion.div 
           className="position-absolute"
           style={{ width: '180px', height: '4px', background: 'linear-gradient(90deg, transparent, #e040fb, transparent)', borderRadius: '50%', transformStyle: 'preserve-3d' }}
           animate={{ rotateZ: 360, rotateX: [60, 80, 60] }} 
           transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
         >
            {/* Satellite Geometry on Ring */}
            <div className="position-absolute rounded-circle bg-white" style={{ width: '10px', height: '10px', right: 0, top: '-3px', boxShadow: '0 0 15px #e040fb' }}></div>
         </motion.div>

         {/* Orbital Ring 2 (Cyan) */}
         <motion.div 
           className="position-absolute"
           style={{ width: '220px', height: '4px', background: 'linear-gradient(90deg, transparent, #06BBCC, transparent)', borderRadius: '50%', transformStyle: 'preserve-3d' }}
           animate={{ rotateZ: -360, rotateY: [60, 40, 60] }} 
           transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
         >
            {/* Spaceship Geometry on Ring */}
            <div className="position-absolute" style={{ width: '20px', height: '8px', left: 0, top: '-2px', background: '#fff', borderRadius: '10px', boxShadow: '0 0 15px #06BBCC', transform: 'rotate(90deg)' }}></div>
         </motion.div>

         {/* Free-Floating Meteor Path */}
         <motion.div 
           className="position-absolute rounded-pill" 
           style={{ width: '25px', height: '4px', background: 'linear-gradient(to right, #ff4e50, transparent)', boxShadow: '0 0 15px #ff4e50' }}
           animate={{ 
             x: [ -150, 0, 150 ],
             y: [ -150, 0, 150 ],
             opacity: [0, 1, 0],
             scale: [0.5, 1.5, 0.5]
           }} 
           transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
         />
      </div>
      
      {/* Holographic Loading Text */}
      <motion.h3 
        className="fw-bold mt-5 text-white" 
        style={{ letterSpacing: '6px', textShadow: '0 0 20px rgba(0,242,254,0.8)' }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        LOADING ABWCURIOUS
        <div className="d-flex justify-content-center gap-2 mt-3">
           <span className="spinner-grow spinner-grow-sm text-info" style={{ animationDelay: '0s' }} />
           <span className="spinner-grow spinner-grow-sm text-info" style={{ animationDelay: '0.2s' }} />
           <span className="spinner-grow spinner-grow-sm text-info" style={{ animationDelay: '0.4s' }} />
        </div>
      </motion.h3>
    </div>
  );
}
