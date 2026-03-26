'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SpaceBackground() {
  const [stars, setStars] = useState<{ id: number; size: number; top: string; left: string; duration: number }[]>([]);

  useEffect(() => {
    // Generate massive star field
    const newStars = Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 0.5,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: Math.random() * 4 + 2,
    }));
    setStars(newStars);
  }, []);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        zIndex: -1,
        background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #050608 100%)',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Complex Cosmic CSS Physics */}
      <style>{`
        @keyframes orbitSatellite {
          0% { transform: rotate(0deg) translateX(35vw) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(35vw) rotate(-360deg); }
        }
        @keyframes rocketShoot {
          0% { transform: translate(-10vw, 110vh) rotate(45deg); }
          100% { transform: translate(110vw, -20vh) rotate(45deg); }
        }
        @keyframes cometFly {
          0% { transform: translate(110vw, -10vh) rotate(-35deg); opacity: 1; }
          100% { transform: translate(-20vw, 50vh) rotate(-35deg); opacity: 0; }
        }
        @keyframes slowSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes botPulse {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 10px #0dcaf0; }
          50% { opacity: 1; box-shadow: 0 0 20px #0dcaf0; }
        }
      `}</style>

      {/* Parallax Stars Layer */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="position-absolute rounded-circle bg-white"
          style={{
            width: star.size,
            height: star.size,
            top: star.top,
            left: star.left,
            boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.8)`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
            y: [0, -10],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* The Sun (Glowing brightly in top right) */}
      <div 
        className="position-absolute" 
        style={{ top: '8%', right: '12%', width: '150px', height: '150px', background: 'radial-gradient(circle, #ffdd00 0%, #ff8800 50%, transparent 100%)', borderRadius: '50%', filter: 'blur(8px)', boxShadow: '0 0 120px #ffdd00' }}
      ></div>

      {/* The Moon (Cool cratered glow in top left) */}
      <motion.div 
        className="position-absolute" 
        style={{ top: '15%', left: '8%', width: '90px', height: '90px', background: 'radial-gradient(circle, #e0e0e0 0%, #888888 70%, transparent 100%)', borderRadius: '50%', boxShadow: '0 0 40px rgba(255,255,255,0.4)', overflow: 'hidden' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
      >
        <div className="position-absolute rounded-circle" style={{ width: '20px', height: '20px', background: 'rgba(0,0,0,0.15)', top: '15px', left: '25px', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)' }}></div>
        <div className="position-absolute rounded-circle" style={{ width: '12px', height: '12px', background: 'rgba(0,0,0,0.15)', top: '45px', left: '55px', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)' }}></div>
        <div className="position-absolute rounded-circle" style={{ width: '30px', height: '30px', background: 'rgba(0,0,0,0.1)', top: '50px', left: '15px', boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.5)' }}></div>
      </motion.div>

      {/* Deep Space Glowing Galaxies */}
      <motion.div className="position-absolute rounded-circle" style={{ width: '60vmax', height: '60vmax', background: 'radial-gradient(circle, rgba(0,242,254,0.06) 0%, rgba(0,0,0,0) 70%)', top: '-10%', left: '-20%', filter: 'blur(50px)' }} animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="position-absolute rounded-circle" style={{ width: '80vmax', height: '80vmax', background: 'radial-gradient(circle, rgba(138,43,226,0.04) 0%, rgba(0,0,0,0) 70%)', bottom: '-20%', right: '-15%', filter: 'blur(70px)' }} animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }} />

      {/* Massive Orbiting Cyan Gas Giant (Bottom Left) */}
      <motion.div 
        className="position-absolute" 
        style={{ bottom: '5%', left: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'linear-gradient(45deg, rgba(6,187,204,0.4), rgba(33,150,243,0.1))', boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.9), 0 0 50px rgba(0,242,254,0.2)' }} 
        animate={{ rotate: 360 }} 
        transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
      >
         {/* Gas Stripes */}
         <div className="position-absolute w-100" style={{ height: '40px', background: 'rgba(255,255,255,0.05)', top: '80px', transform: 'rotate(-20deg)' }}></div>
         <div className="position-absolute w-100" style={{ height: '20px', background: 'rgba(255,255,255,0.03)', top: '150px', transform: 'rotate(-20deg)' }}></div>
      </motion.div>

      {/* Deep Red Planet (Top Center-Right) */}
      <motion.div 
        className="position-absolute" 
        style={{ top: '25%', right: '35%', width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff4e50, #f9d423)', boxShadow: 'inset -15px -15px 20px rgba(0,0,0,0.8)' }} 
        animate={{ rotate: -360 }} 
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      >
      </motion.div>

      {/* Passing Rocket Interceptor */}
      <div className="position-absolute" style={{ animation: 'rocketShoot 30s linear infinite', zIndex: 1 }}>
        <div style={{ width: '60px', height: '25px', background: 'linear-gradient(to right, #6c757d, #adb5bd)', borderRadius: '30px 60px 60px 30px', position: 'relative', boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.5)' }}>
           {/* Rocket Window */}
           <div className="position-absolute rounded-circle bg-info" style={{ width: '12px', height: '12px', top: '6px', right: '15px', border: '2px solid #343a40' }}></div>
           {/* Rocket Tail Fins */}
           <div className="position-absolute bg-secondary" style={{ width: '15px', height: '10px', top: '-8px', left: '5px', transform: 'skewX(30deg)', borderRadius: '3px' }}></div>
           <div className="position-absolute bg-secondary" style={{ width: '15px', height: '10px', bottom: '-8px', left: '5px', transform: 'skewX(-30deg)', borderRadius: '3px' }}></div>
           {/* Rocket Engine Thrust */}
           <div className="position-absolute" style={{ width: '25px', height: '20px', background: 'linear-gradient(to right, #ffdd00, #ff4e50, transparent)', borderRadius: '50%', top: '2.5px', left: '-20px', filter: 'blur(2px)', animation: 'botPulse 0.2s infinite alternate' }}></div>
        </div>
      </div>

      {/* Orbiting Tech Satellite */}
      <div className="position-absolute top-50 start-50 translate-middle">
        <div style={{ animation: 'orbitSatellite 60s linear infinite' }}>
          <div style={{ width: '40px', height: '15px', background: '#343a40', position: 'relative', borderRadius: '3px' }}>
             {/* Solar Panels */}
             <div className="position-absolute" style={{ width: '35px', height: '45px', background: 'linear-gradient(to bottom, #0dcaf0, #0d6efd)', top: '-15px', left: '-35px', border: '1px solid rgba(255,255,255,0.2)', opacity: 0.8 }}>
                <div className="w-100 h-50 border-bottom border-white opacity-50"></div>
             </div>
             <div className="position-absolute" style={{ width: '35px', height: '45px', background: 'linear-gradient(to bottom, #0dcaf0, #0d6efd)', top: '-15px', right: '-35px', border: '1px solid rgba(255,255,255,0.2)', opacity: 0.8 }}>
                <div className="w-100 h-50 border-bottom border-white opacity-50"></div>
             </div>
             {/* Satellite Blink Radar */}
             <div className="position-absolute rounded-circle bg-danger" style={{ width: '6px', height: '6px', top: '4.5px', right: '10px', boxShadow: '0 0 10px #dc3545', animation: 'botPulse 1s infinite alternate' }}></div>
          </div>
        </div>
      </div>

      {/* Shooting Comets with Tails */}
      <div className="position-absolute" style={{ width: '150px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.8))', animation: 'cometFly 12s cubic-bezier(0.4, 0, 0.2, 1) infinite 5s', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}></div>
      <div className="position-absolute" style={{ width: '250px', height: '3px', background: 'linear-gradient(to right, transparent, rgba(0,242,254,1))', animation: 'cometFly 18s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s', top: '15%', borderRadius: '50%', boxShadow: '0 0 15px rgba(0,242,254,0.8)' }}></div>
      <div className="position-absolute" style={{ width: '100px', height: '1.5px', background: 'linear-gradient(to right, transparent, rgba(255,193,7,0.9))', animation: 'cometFly 25s cubic-bezier(0.4, 0, 0.2, 1) infinite 10s', bottom: '30%', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,193,7,0.6)' }}></div>

    </div>
  );
}
