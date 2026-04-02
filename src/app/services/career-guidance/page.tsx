import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Career Guidance | ABWcurious',
  description: 'Get personalized career guidance, mentorship, mock interviews, and job placement support from ABWcurious experts in Navi Mumbai, India.',
};

const steps = [
  { n: '01', title: 'Career Assessment', desc: 'We begin with a deep-dive assessment of your skills, interests, education background, and career goals to understand exactly where you stand and where you want to go.', icon: '🎯' },
  { n: '02', title: 'Personalised Roadmap', desc: 'Our mentors craft a tailored career roadmap with specific milestones, skill-building targets, and timelines aligned to your dream role in tech, business, or creative fields.', icon: '🗺️' },
  { n: '03', title: 'Skill Training & Projects', desc: 'You receive curated training resources, live project experience, and industry assignments that add real credibility to your CV and LinkedIn profile.', icon: '💻' },
  { n: '04', title: 'Placement & Beyond', desc: 'From mock interviews to live job referrals, we stay with you until you land your role — and continue mentoring well beyond your first day on the job.', icon: '🚀' },
];

const services = [
  { icon: '📄', title: 'Resume Building & Review', desc: 'Our career coaches meticulously review and rebuild your resume to meet modern ATS standards and impress hiring managers at top tech companies.' },
  { icon: '🎤', title: 'Mock Interview Preparation', desc: 'Practice with real-world technical and HR interview simulations. Receive detailed feedback, improve your confidence, and master common interview patterns.' },
  { icon: '🔗', title: 'LinkedIn Profile Optimisation', desc: 'Get a recruiter-ready LinkedIn profile with an SEO-optimised headline, summary, skills, and portfolio links that get you noticed organically.' },
  { icon: '🧭', title: 'Career Roadmap Planning', desc: 'Whether you are a fresher or switching careers, we create a clear 6–12 month action plan covering skills, projects, certifications, and networking.' },
  { icon: '👨‍🏫', title: 'Industry Mentorship Sessions', desc: '1-on-1 live mentorship sessions with working professionals from software engineering, cybersecurity, data science, and product management domains.' },
  { icon: '🏢', title: 'Job Portal & Referral Access', desc: 'Gain access to our exclusive job board with curated openings, plus direct referrals to 200+ company partners across India and abroad.' },
  { icon: '📜', title: 'Certification Guidance', desc: 'We help you identify the right certifications (AWS, Google, CompTIA, Microsoft, etc.) that add maximum value to your specific career target.' },
  { icon: '💡', title: 'Soft Skills & Communication', desc: 'Master professional communication, email etiquette, presentation skills, and team collaboration — the traits that turn good developers into great leaders.' },
];

const testimonials = [
  { name: 'Aarav Sharma', role: 'Software Engineer @ TCS', text: 'ABWcurious helped me transition from a non-CS background to landing my first software engineering role in just 8 months. The mock interviews were incredibly realistic!', stars: 5 },
  { name: 'Priya Mehta', role: 'Cybersecurity Analyst @ Infosys', text: 'The career roadmap they created for me was spot-on. I went from zero cybersecurity knowledge to a certified analyst with a full-time job offer. 10/10 recommend!', stars: 5 },
  { name: 'Rohit Verma', role: 'Frontend Developer @ Startup', text: 'The LinkedIn optimisation alone tripled my recruiter messages in 2 weeks. The entire guidance program is genuinely transformative and worth every rupee.', stars: 5 },
];

export default function CareerGuidancePage() {
  return (
    <div className="min-vh-100 pt-5" style={{ color: '#fff' }}>

      {/* ── Hero ── */}
      <div className="container-fluid pt-5 mt-5 pb-5 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(6,187,204,0.08) 0%, rgba(13,110,253,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container pt-4">
          <span className="badge px-3 py-2 mb-4 fw-semibold rounded-pill d-inline-block"
            style={{ background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', color: '#00f2fe', fontSize: 13 }}>
            🧭 Career Development Services
          </span>
          <h1 className="display-3 fw-bold mb-4" style={{ textShadow: '0 0 30px rgba(0,242,254,0.2)' }}>
            Shape Your Tech Career<br />
            <span style={{ background: 'linear-gradient(135deg,#06BBCC,#0d6efd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>With Confidence</span>
          </h1>
          <p className="lead text-white-50 mx-auto mb-5" style={{ maxWidth: 680 }}>
            From resume crafting to job placement, our expert mentors provide end-to-end career support designed for students, freshers, and professionals looking to upskill and grow in the tech industry.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link href="/join-now" className="btn btn-primary px-5 py-3 fw-bold rounded-3">
              Start My Career Journey →
            </Link>
            <Link href="/contact" className="btn btn-outline-info px-5 py-3 fw-bold rounded-3">
              Book a Free Session
            </Link>
          </div>
          {/* Stats strip */}
          <div className="row g-4 mt-5 justify-content-center">
            {[['500+','Students Placed'],['95%','Success Rate'],['200+','Company Partners'],['8+','Years Experience']].map(([n, l], i) => (
              <div key={i} className="col-6 col-md-3">
                <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="fw-bold mb-1" style={{ fontSize: 32, color: '#00f2fe' }}>{n}</div>
                  <div className="text-white-50 small">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What We Offer ── */}
      <div className="container py-5 my-3">
        <div className="text-center mb-5">
          <span className="badge px-3 py-2 mb-3 fw-semibold rounded-pill d-inline-block"
            style={{ background: 'rgba(13,110,253,0.1)', border: '1px solid rgba(13,110,253,0.3)', color: '#0d6efd', fontSize: 13 }}>
            ✨ Our Services
          </span>
          <h2 className="fw-bold display-6 text-white mb-3">Everything You Need to Succeed</h2>
          <p className="text-white-50 mx-auto" style={{ maxWidth: 560 }}>
            Our comprehensive career guidance ecosystem covers every aspect of your professional journey.
          </p>
        </div>
        <div className="row g-4">
          {services.map((s, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <div className="h-100 p-4 rounded-4 text-center cg-service-card"
                style={{ transition: 'all 0.3s' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h5 className="fw-bold text-white mb-2">{s.title}</h5>
                <p className="text-white-50 small mb-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4-Step Process ── */}
      <div className="container-fluid py-5" style={{ background: 'rgba(5,5,10,0.5)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-6 text-white mb-3">Your 4-Step Success Path</h2>
            <p className="text-white-50">A structured, proven process that takes you from where you are to where you want to be.</p>
          </div>
          <div className="row g-4">
            {steps.map((s, i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="p-4 rounded-4 h-100 position-relative"
                  style={{ background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.15)' }}>
                  <div className="position-absolute top-0 end-0 m-3 fw-bold" style={{ color: 'rgba(0,242,254,0.2)', fontSize: 48 }}>{s.n}</div>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                  <h5 className="fw-bold text-white mb-2">{s.title}</h5>
                  <p className="text-white-50 small mb-0">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="container py-5 my-3">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6 text-white mb-3">Success Stories</h2>
          <p className="text-white-50">Real outcomes from real students who trusted ABWcurious with their careers.</p>
        </div>
        <div className="row g-4 justify-content-center">
          {testimonials.map((t, i) => (
            <div key={i} className="col-md-4">
              <div className="p-4 rounded-4 h-100"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="d-flex mb-3" style={{ gap: 4 }}>
                  {[...Array(t.stars)].map((_, j) => <span key={j} style={{ color: '#06BBCC', fontSize: 18 }}>★</span>)}
                </div>
                <p className="text-white-50 mb-4 fst-italic">&ldquo;{t.text}&rdquo;</p>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: 42, height: 42, background: 'linear-gradient(135deg,#06BBCC,#0d6efd)', fontSize: 16 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="fw-bold text-white" style={{ fontSize: 14 }}>{t.name}</div>
                    <div className="text-white-50" style={{ fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="container pb-5 mb-5">
        <div className="p-5 rounded-4 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(6,187,204,0.12), rgba(13,110,253,0.12))', border: '1px solid rgba(0,242,254,0.2)' }}>
          <h2 className="fw-bold text-white mb-3">Have Any Doubts or Questions?</h2>
          <p className="text-white-50 mb-4 mx-auto" style={{ maxWidth: 560 }}>
            Our career advisors are available Monday to Saturday, 9AM–7PM IST. Whether you need clarity on our programs or want to speak with a mentor, we&apos;re just a message away.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <Link href="/contact" className="btn btn-primary px-5 py-3 fw-bold rounded-3">
              📬 Contact Our Team
            </Link>
            <a href="tel:+918108915402" className="btn btn-outline-info px-5 py-3 fw-bold rounded-3">
              📞 Call +91 8108915402
            </a>
          </div>
        </div>
      </div>
      <style>{`
        .cg-service-card {
           background: rgba(255,255,255,0.03);
           border: 1px solid rgba(255,255,255,0.07);
        }
        .cg-service-card:hover {
           background: rgba(0,242,254,0.04);
           border: 1px solid rgba(0,242,254,0.3);
           transform: translateY(-5px);
           box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
