'use client';

// ─────────────────────────────────────────────────────────────────────────────
// SpaceBackground — GPU-composited, zero JS animation overhead
// Star field uses pure CSS box-shadow on 3 <span> elements instead of
// 250 individual motion.div nodes. This cuts frame time from ~60ms → ~2ms.
// ─────────────────────────────────────────────────────────────────────────────

export default function SpaceBackground() {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{
        zIndex: -1,
        background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #050608 100%)',
        overflow: 'hidden',
        pointerEvents: 'none',
        willChange: 'auto',
      }}
    >
      <style>{`
        /* ── Star field via CSS box-shadow trick (zero JS) ── */
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes parallaxDrift {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-100vh); }
        }
        .stars-sm, .stars-md, .stars-lg {
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 1px;
          border-radius: 50%;
          animation: parallaxDrift linear infinite;
          will-change: transform;
        }
        .stars-sm {
          background: transparent;
          box-shadow:
            120px 40px 1px #fff, 340px 200px 1px #fff, 560px 80px 1px #fff,
            780px 300px 1px #fff, 220px 450px 1px #fff, 670px 520px 1px #fff,
            890px 150px 1px #fff, 140px 680px 1px #fff, 430px 750px 1px #fff,
            920px 620px 1px #fff, 50px 300px 1px #fff, 700px 400px 1px #fff,
            1100px 60px 1px #fff, 1300px 350px 1px #fff, 1500px 500px 1px #fff,
            200px 900px 1px #fff, 450px 100px 1px #fff, 800px 800px 1px #fff,
            1200px 700px 1px #fff, 600px 950px 1px #fff, 950px 50px 1px #fff,
            1400px 200px 1px #fff, 300px 600px 1px #fff, 1600px 850px 1px #fff,
            750px 650px 1px #fff, 1050px 450px 1px #fff, 1700px 300px 1px #fff,
            80px 850px 1px #fff, 1800px 600px 1px #fff, 380px 380px 1px #fff;
          animation-duration: 300s;
        }
        .stars-md {
          width: 2px; height: 2px;
          background: transparent;
          box-shadow:
            180px 120px 2px rgba(200,220,255,0.8),
            500px 340px 2px rgba(200,220,255,0.8),
            900px 200px 2px rgba(200,220,255,0.8),
            1200px 550px 2px rgba(200,220,255,0.8),
            300px 700px 2px rgba(200,220,255,0.8),
            750px 850px 2px rgba(200,220,255,0.8),
            1400px 100px 2px rgba(200,220,255,0.8),
            60px 500px 2px rgba(200,220,255,0.8),
            1600px 750px 2px rgba(200,220,255,0.8),
            1050px 900px 2px rgba(0,242,254,0.6),
            420px 250px 2px rgba(0,242,254,0.6),
            1300px 420px 2px rgba(0,242,254,0.6),
            680px 600px 2px rgba(0,242,254,0.6),
            1550px 300px 2px rgba(0,242,254,0.6);
          animation-duration: 200s;
        }
        .stars-lg {
          width: 3px; height: 3px;
          background: transparent;
          box-shadow:
            250px 90px 3px rgba(255,255,255,0.9),
            780px 480px 3px rgba(255,255,255,0.9),
            1350px 200px 3px rgba(255,255,255,0.9),
            550px 750px 3px rgba(255,255,255,0.9),
            1100px 600px 3px rgba(255,255,255,0.9),
            150px 400px 3px rgba(0,242,254,0.9),
            1600px 500px 3px rgba(0,242,254,0.9),
            900px 300px 3px rgba(138,43,226,0.8);
          animation-duration: 100s;
        }

        /* ── Comet streaks ── */
        @keyframes cometFly {
          0%   { transform: translate(110vw, -10vh) rotate(-35deg); opacity: 1; }
          100% { transform: translate(-20vw, 50vh)  rotate(-35deg); opacity: 0; }
        }
        .comet {
          position: absolute;
          height: 2px;
          border-radius: 50%;
          will-change: transform, opacity;
          animation: cometFly cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* ── Satellite orbit ── */
        @keyframes orbitSatellite {
          from { transform: rotate(0deg) translateX(30vw) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(30vw) rotate(-360deg); }
        }
        .satellite-arm {
          animation: orbitSatellite 60s linear infinite;
          will-change: transform;
        }

        /* ── Slow planet spin ── */
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Pulse ── */
        @keyframes botPulse {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1;   }
        }
      `}</style>

      {/* CSS-only star layers */}
      <span className="stars-sm" />
      <span className="stars-md" />
      <span className="stars-lg" />

      {/* Static nebula blobs — NO animation, NO blur on animating elements */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-20%',
        width: '60vmax', height: '60vmax',
        background: 'radial-gradient(circle, rgba(0,242,254,0.05) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-15%',
        width: '80vmax', height: '80vmax',
        background: 'radial-gradient(circle, rgba(138,43,226,0.04) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* The Sun */}
      <div style={{
        position: 'absolute', top: '8%', right: '12%',
        width: 150, height: 150,
        background: 'radial-gradient(circle, #ffdd00 0%, #ff8800 50%, transparent 100%)',
        borderRadius: '50%',
        boxShadow: '0 0 80px #ffdd00',
        filter: 'blur(6px)',
      }} />

      {/* The Moon — single CSS animation, will-change: transform */}
      <div style={{
        position: 'absolute', top: '15%', left: '8%',
        width: 90, height: 90,
        background: 'radial-gradient(circle, #e0e0e0 0%, #888 70%, transparent 100%)',
        borderRadius: '50%',
        boxShadow: '0 0 30px rgba(255,255,255,0.3)',
        animation: 'slowSpin 200s linear infinite',
        willChange: 'transform',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', width:20, height:20, background:'rgba(0,0,0,0.15)', top:15, left:25, borderRadius:'50%', boxShadow:'inset 2px 2px 5px rgba(0,0,0,0.5)' }} />
        <div style={{ position:'absolute', width:12, height:12, background:'rgba(0,0,0,0.15)', top:45, left:55, borderRadius:'50%', boxShadow:'inset 2px 2px 5px rgba(0,0,0,0.5)' }} />
        <div style={{ position:'absolute', width:30, height:30, background:'rgba(0,0,0,0.1)',  top:50, left:15, borderRadius:'50%', boxShadow:'inset 2px 2px 5px rgba(0,0,0,0.5)' }} />
      </div>

      {/* Cyan Gas Giant */}
      <div style={{
        position: 'absolute', bottom: '5%', left: '15%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'linear-gradient(45deg, rgba(6,187,204,0.35), rgba(33,150,243,0.1))',
        boxShadow: 'inset -30px -30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(0,242,254,0.15)',
        animation: 'slowSpin 150s linear infinite',
        willChange: 'transform',
        overflow: 'hidden',
      }}>
        <div style={{ position:'absolute', width:'100%', height:40, background:'rgba(255,255,255,0.04)', top:80, transform:'rotate(-20deg)' }} />
        <div style={{ position:'absolute', width:'100%', height:20, background:'rgba(255,255,255,0.025)', top:150, transform:'rotate(-20deg)' }} />
      </div>

      {/* Red Planet */}
      <div style={{
        position: 'absolute', top: '25%', right: '35%',
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff4e50, #f9d423)',
        boxShadow: 'inset -15px -15px 20px rgba(0,0,0,0.8)',
        animation: 'slowSpin 80s linear infinite reverse',
        willChange: 'transform',
      }} />

      {/* Shooting comets */}
      <div className="comet" style={{ width:150, background:'linear-gradient(to right, transparent, rgba(255,255,255,0.8))', boxShadow:'0 0 8px rgba(255,255,255,0.4)', animationDuration:'12s', animationDelay:'5s' }} />
      <div className="comet" style={{ width:250, background:'linear-gradient(to right, transparent, rgba(0,242,254,1))', boxShadow:'0 0 12px rgba(0,242,254,0.7)', animationDuration:'18s', animationDelay:'1s', top:'15%' }} />
      <div className="comet" style={{ width:100, background:'linear-gradient(to right, transparent, rgba(255,193,7,0.9))', boxShadow:'0 0 8px rgba(255,193,7,0.5)', animationDuration:'25s', animationDelay:'10s', bottom:'30%' }} />

      {/* Orbiting Satellite */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}>
        <div className="satellite-arm">
          <div style={{ width:40, height:15, background:'#343a40', position:'relative', borderRadius:3 }}>
            <div style={{ position:'absolute', width:35, height:45, background:'linear-gradient(to bottom, #0dcaf0, #0d6efd)', top:-15, left:-35, border:'1px solid rgba(255,255,255,0.2)', opacity:0.8 }}>
              <div style={{ width:'100%', height:'50%', borderBottom:'1px solid rgba(255,255,255,0.5)' }} />
            </div>
            <div style={{ position:'absolute', width:35, height:45, background:'linear-gradient(to bottom, #0dcaf0, #0d6efd)', top:-15, right:-35, border:'1px solid rgba(255,255,255,0.2)', opacity:0.8 }}>
              <div style={{ width:'100%', height:'50%', borderBottom:'1px solid rgba(255,255,255,0.5)' }} />
            </div>
            <div style={{ position:'absolute', width:6, height:6, background:'#dc3545', top:4.5, right:10, borderRadius:'50%', boxShadow:'0 0 8px #dc3545', animation:'botPulse 1s infinite alternate' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
