import JoinForm from '@/components/forms/JoinForm';

export default function JoinNowPage() {
  return (
    <div className="min-vh-100">
      <div className="container-fluid bg-primary py-5 mb-5">
        <div className="container text-center text-white">
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
