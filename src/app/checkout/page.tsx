"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, Smartphone, AlertCircle, Lock } from 'lucide-react';
import { submitOrder } from '@/app/actions';

function CheckoutComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rawPlanName = searchParams?.get('plan') || 'Custom Enterprise Plan';
  const rawAmount = searchParams?.get('price') || 'Contact for Pricing';
  const rawService = searchParams?.get('service') || 'Software Deployment';

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail || !customerName || upiUtr.length < 5) return;
    setStatus('loading');

    const res = await submitOrder({
      customerName,
      customerEmail,
      planName: rawPlanName,
      serviceCategory: rawService,
      amount: rawAmount,
      upiUtrString: upiUtr
    });

    if (res.success) {
      setStatus('success');
      setTimeout(() => router.push('/dashboard'), 3000);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-vh-100 pt-5 d-flex align-items-center justify-content-center" style={{ background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #050608 100%)' }}>
      <div className="container py-5 mt-5">
        
        {status === 'success' ? (
           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center glass-card p-5 mx-auto rounded-4" style={{ maxWidth: 600 }}>
             <CheckCircle className="text-success mx-auto mb-4" size={80} />
             <h2 className="text-white fw-bold mb-3">Deployment Initiated!</h2>
             <p className="text-white-50">Your transaction reference has been secured in the ABWcurious network. Admin nodes will decrypt and verify your payment shortly.</p>
             <div className="spinner-border text-primary mt-4" role="status"></div>
           </motion.div>
        ) : (
          <div className="row g-5 justify-content-center">
            
            <motion.div className="col-lg-5" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
               <h2 className="display-6 fw-bold text-white mb-4">Finalize Deployment</h2>
               <div className="glass-card p-4 rounded-4 mb-4" style={{ border: '1px solid rgba(0,242,254,0.3)', background: 'rgba(0,242,254,0.05)' }}>
                  <div className="d-flex justify-content-between mb-3 border-bottom border-secondary pb-3">
                    <span className="text-white-50">Target Architecture</span>
                    <strong className="text-white bg-dark px-3 py-1 rounded-pill border">{rawService.toUpperCase()}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-white-50">Tier Specification</span>
                    <strong className="text-primary">{rawPlanName}</strong>
                  </div>
                  <div className="d-flex justify-content-between mt-4 pt-3 border-top border-secondary align-items-center">
                    <span className="text-white fs-5">Total Valuation</span>
                    <strong className="text-white display-6">{rawAmount}</strong>
                  </div>
               </div>

               <div className="glass-card p-4 rounded-4" style={{ background: 'linear-gradient(135deg, rgba(10,10,20,0.8), rgba(20,20,40,0.9))' }}>
                  <h5 className="text-white mb-3 d-flex align-items-center gap-2"><Smartphone className="text-info" /> Secure Matrix Gateways</h5>
                  <p className="text-white-50 small mb-4">Initiate a secure transfer to the network coordinates below, then inject the UTR reference hash into the authorization form.</p>
                  
                  <div className="bg-dark p-3 rounded-3 border mb-3 text-center">
                    <span className="d-block text-white-50 small mb-1">Unified Payment Interface (UPI)</span>
                    <strong className="text-info fs-4" style={{ letterSpacing: '1px' }}>ABWcurious@upi</strong>
                  </div>

                  <div className="bg-dark p-3 rounded-3 border text-center">
                    <span className="d-block text-white-50 small mb-1">Bank Wiring Details</span>
                    <strong className="text-white d-block">A/C: 40019208391283</strong>
                    <span className="text-white-50 small">IFSC: HDFC0001029</span>
                  </div>
               </div>
            </motion.div>

            <motion.div className="col-lg-5" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
               <div className="glass-card p-5 rounded-4 h-100" style={{ background: 'rgba(5, 5, 10, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <h4 className="text-white mb-4"><CreditCard className="me-2 text-primary" /> Authorization Form</h4>
                 {status === 'error' && <div className="alert alert-danger bg-danger text-white border-0"><AlertCircle className="me-2" /> Transmission Failed.</div>}
                 <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                    <div>
                      <label className="form-label text-white-50 mb-1 small">Commander Designation (Full Name)</label>
                      <input type="text" required value={customerName} onChange={e=>setCustomerName(e.target.value)} className="form-control bg-dark border-secondary text-white py-3 shadow-none focus-glow" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="form-label text-white-50 mb-1 small">Comm Channel (Email)</label>
                      <input type="email" required value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} className="form-control bg-dark border-secondary text-white py-3 shadow-none focus-glow" placeholder="name@domain.com" />
                    </div>
                    <div>
                      <label className="form-label text-white-50 mb-1 small">Transaction Reference Hash (UTR/Ref No.)</label>
                      <input type="text" required minLength={8} value={upiUtr} onChange={e=>setUpiUtr(e.target.value)} className="form-control bg-dark border-info text-info py-3 shadow-none focus-glow" placeholder="12-digit UPI No. or Crypto Hash" style={{ letterSpacing: '1px', fontWeight: 600 }} />
                      <div className="form-text text-secondary mt-2"><small>Must exactly match the proof of payment string.</small></div>
                    </div>
                    
                    <button type="submit" disabled={status==='loading'} className="btn btn-primary w-100 py-3 rounded-pill fw-bold mt-2" style={{ background: 'linear-gradient(90deg, #0dcaf0, #0d6efd)', border: 'none' }}>
                      {status === 'loading' ? 'Encrypting Request...' : 'Submit Verification Matrix'}
                    </button>
                    <p className="text-center text-white-50 small mb-0 mt-3"><Lock className="inline me-1" size={14}/> Client-Side Encrypted Execution</p>
                 </form>
               </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center"><div className="spinner-border text-info"></div></div>}>
      <CheckoutComponent />
    </Suspense>
  );
}
