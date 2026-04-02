// Lightweight route loading fallback — pure CSS, no Framer Motion
export default function Loading() {
  return (
    <div
      className="vh-100 d-flex flex-column align-items-center justify-content-center position-fixed top-0 start-0 w-100"
      style={{ zIndex: 99999, background: 'rgba(5, 5, 10, 0.97)', backdropFilter: 'blur(20px)' }}
    >
      <style>{`
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px #0dcaf0; }
          50%     { box-shadow: 0 0 50px #0dcaf0, 0 0 80px rgba(13,202,240,0.4); }
        }
        .ring-outer {
          width: 80px; height: 80px; border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #0dcaf0;
          border-right-color: rgba(13,202,240,0.3);
          animation: spinRing 1s linear infinite;
        }
        .ring-inner {
          width: 52px; height: 52px; border-radius: 50%;
          border: 3px solid transparent;
          border-bottom-color: #a855f7;
          border-left-color: rgba(168,85,247,0.3);
          animation: spinRing 0.7s linear infinite reverse;
        }
        .core-dot {
          width: 18px; height: 18px; border-radius: 50%;
          background: radial-gradient(circle, #0dcaf0, #0d6efd);
          animation: glowPulse 1.5s ease infinite;
        }
        @keyframes blink { 0%,100%{ opacity:0.3; } 50%{ opacity:1; } }
        .load-text { animation: blink 1.5s ease infinite; }
      `}</style>

      <div className="position-relative d-flex align-items-center justify-content-center" style={{ width: 90, height: 90 }}>
        <div className="ring-outer position-absolute" />
        <div className="ring-inner position-absolute" />
        <div className="core-dot position-absolute" />
      </div>

      <p className="load-text mt-4 fw-bold text-white-50" style={{ letterSpacing: 4, fontSize: 13 }}>
        LOADING...
      </p>
    </div>
  );
}
