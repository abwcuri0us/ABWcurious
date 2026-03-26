import JoinForm from '@/components/forms/JoinForm';

export default function JoinNowPage() {
  return (
    <div className="min-vh-100 pt-5">
      <div className="container-fluid pt-5 mt-5 pb-5 mb-5" style={{ background: 'rgba(5, 5, 10, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container text-center text-white pt-4">
          <h1 className="display-4 mb-2">Join Us</h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0">
              <li className="breadcrumb-item"><a className="text-white-50" href="/">Home</a></li>
              <li className="breadcrumb-item active text-white" aria-current="page">Join Now</li>
            </ol>
          </nav>
        </div>
      </div>

      <JoinForm />
    </div>
  );
}
