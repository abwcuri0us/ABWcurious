import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-vh-100">
      {/* Header Start (matches static style + background image via .page-header) */}
      <div className="container-fluid bg-primary py-5 mb-5 page-header">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              <h1 className="display-3 text-white">About Us</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item"><a className="text-white" href="#">Home</a></li>
                  <li className="breadcrumb-item"><a className="text-white" href="#">Pages</a></li>
                  <li className="breadcrumb-item text-white active" aria-current="page">About</li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Service Start (icon grid) */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-code fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Web Development</h5>
                <p>Create modern, responsive, and scalable websites using cutting-edge technologies and frameworks.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-shield-alt fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Cyber Intelligence</h5>
                <p>Safeguard your systems with threat detection, vulnerability analysis, and advanced cybersecurity practices.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-chalkboard-teacher fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Education & Training</h5>
                <p>Empower learners with structured courses, real-world projects, and hands-on learning experiences in tech.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-headset fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">IT Support</h5>
                <p>Get reliable technical assistance, troubleshooting, and infrastructure support tailored to your business needs.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-mobile-alt fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Application Development</h5>
                <p>Develop powerful Android, iOS, and cross-platform apps designed for scalability and performance.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-robot fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">AI & Machine Learning</h5>
                <p>Leverage data with AI-powered insights, automation, and machine learning models that drive innovation.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-chart-line fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Trading & Finance</h5>
                <p>Master stock, crypto, and forex trading with market strategies, technical analysis, and risk management.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="service-item text-center pt-3 h-100">
              <div className="p-4">
                <i className="fa fa-video fa-3x text-primary mb-4"></i>
                <h5 className="mb-3">Animation & Video Editing</h5>
                <p>Bring your stories to life with professional animations, motion graphics, and video editing services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About (image + text) */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6" style={{ minHeight: 400 }}>
              <div className="position-relative h-100">
                <img className="img-fluid position-absolute w-100 h-100" src="/images/about1.jpeg" alt="About" style={{ objectFit: 'cover' }} />
              </div>
            </div>
            <div className="col-lg-6">
              <h6 className="section-title bg-white text-start text-primary pe-3">About Us</h6>
              <h1 className="mb-4">Welcome to ABW-Curious</h1>
              <p className="mb-4">At ABW-Curious, we believe in shaping a better world through tech-powered learning and innovation. Whether you're a curious learner or a business in need of modern IT solutions, we’ve got you covered.</p>
              <p className="mb-4">We offer a diverse range of hands-on courses in Web Development, Cyber Intelligence, AI & Machine Learning, and more — all guided by skilled instructors and real-world projects. We also deliver top-tier IT services including App Development, IT Support, Video Editing, and Trading & Finance consultancy — helping you scale your ideas into impact.</p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Web Development</p></div>
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Cyber Intelligence</p></div>
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Education & Training</p></div>
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>IT Support</p></div>
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>AI & Machine Learning</p></div>
                <div className="col-sm-6"><p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Trading & Finance</p></div>
              </div>
              <a className="btn btn-primary py-3 px-5 mt-2" href="#">Read More</a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section to match site theme */}
      <section className="py-5 bg-primary">
        <div className="container text-center text-white">
          <h2 className="display-6 mb-3">Ready to Get Started?</h2>
          <p className="lead mb-4">Join our community of learners and start your journey towards professional excellence today.</p>
          <div className="d-flex flex-wrap gap-3 justify-content-center">
            <a href="/join-now" className="btn btn-light">Join Now</a>
            <a href="/contact" className="btn btn-outline-light">Contact Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
