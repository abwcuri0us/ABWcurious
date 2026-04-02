'use client';

// Lightweight loading animation — pure CSS, zero Framer Motion
export default function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  // Use a simple timeout to call onComplete
  if (typeof window !== 'undefined') {
    setTimeout(() => onComplete(), 1200);
  }

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{ zIndex: 9999, background: 'radial-gradient(ellipse at center, #1b003a 0%, #0B0C10 70%, #000 100%)', overflow: 'hidden' }}
    >
      <style>{`
        @keyframes spinLogo { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
        @keyframes fillBar { from { width: 0%; } to { width: 100%; } }
        @keyframes fadeOut { 0%,80% { opacity:1; } 100% { opacity:0; pointer-events:none; } }
        @keyframes pulse3d { 0%,100% { box-shadow: 0 0 20px #00f2fe; } 50% { box-shadow: 0 0 50px #00f2fe, 0 0 80px rgba(0,242,254,0.4); } }
        .loader-wrap { animation: fadeOut 1.5s ease forwards; animation-delay: 0.8s; }
        .logo-spin { animation: spinLogo 2s ease forwards; }
        .progress-fill { animation: fillBar 0.9s cubic-bezier(0.4,0,0.2,1) forwards; }
        .logo-pulse { animation: pulse3d 1.5s ease infinite; }
        /* CSS star field */
        .loader-stars-sm, .loader-stars-md {
          position: absolute; top: 0; left: 0; width: 1px; height: 1px;
        }
        .loader-stars-sm {
          box-shadow: 80px 40px 1px #fff, 200px 150px 1px #fff, 450px 80px 1px #fff,
            600px 300px 1px #fff, 120px 500px 1px #fff, 750px 200px 1px #fff,
            900px 450px 1px #fff, 300px 700px 1px #fff, 1100px 100px 1px #fff,
            50px 600px 1px #fff, 1300px 500px 1px #fff, 700px 800px 1px #fff;
        }
        .loader-stars-md {
          width: 2px; height: 2px;
          box-shadow: 180px 200px 2px rgba(0,242,254,0.6), 500px 350px 2px rgba(0,242,254,0.6),
            800px 100px 2px rgba(0,242,254,0.6), 1200px 600px 2px rgba(0,242,254,0.6),
            350px 800px 2px rgba(138,43,226,0.6), 950px 700px 2px rgba(138,43,226,0.6);
        }
      `}</style>

      <span className="loader-stars-sm" />
      <span className="loader-stars-md" />

      <div className="loader-wrap d-flex flex-column align-items-center">
        {/* Logo */}
        <div style={{ width: 130, height: 130, marginBottom: 32, perspective: 600 }}>
          <div className="logo-spin logo-pulse" style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: 'rgba(0,242,254,0.05)', border: '2px solid rgba(0,242,254,0.3)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="ABWcurious" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Brand Name */}
        <h3 style={{ color: '#fff', letterSpacing: 6, textTransform: 'uppercase', textShadow: '0 0 15px rgba(0,242,254,0.8)', marginBottom: 20 }}>
          ABWCURIOUS
        </h3>

        {/* Progress bar */}
        <div style={{ width: 250, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }}>
          <div className="progress-fill" style={{ height: '100%', background: 'linear-gradient(90deg, transparent, #00f2fe, #fff)', boxShadow: '0 0 15px #00f2fe', borderRadius: 99 }} />
        </div>
        <p style={{ color: '#00f2fe', marginTop: 10, fontSize: 13, letterSpacing: 2 }}>INITIALIZING...</p>
      </div>
    </div>
  );
}
