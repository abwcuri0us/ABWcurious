'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { submitFeedback } from '@/app/actions';

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', comment: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!rating) e.rating = 'Please select a star rating';
    if (form.comment.trim().length < 5) e.comment = 'Please write a short comment';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setStatus('loading');
    try {
      const res = await submitFeedback(form.name, form.email, rating, form.comment);
      if (res.success) { setStatus('success'); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#06bbcc'];

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center py-5">
        <div style={{ fontSize: 56 }} className="mb-3">🌟</div>
        <h4 className="text-white fw-bold">Thank you for your feedback!</h4>
        <p className="text-white-50">Your rating helps us improve our services.</p>
        <button onClick={() => { setStatus('idle'); setRating(0); setForm({ name: '', email: '', comment: '' }); }}
          className="btn btn-outline-info btn-sm mt-2">Leave Another Review</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <h3 className="text-white fw-bold mb-2">Leave Your Feedback</h3>
      <p className="text-white-50 small mb-4">Help us improve by sharing your experience with ABWcurious.</p>

      {status === 'error' && <div className="alert alert-danger bg-transparent border-danger text-danger mb-3">Something went wrong. Please try again.</div>}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        {/* Star Rating */}
        <div>
          <label className="text-white-50 small mb-2 d-block">Your Rating *</label>
          <div className="d-flex gap-2 align-items-center">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} type="button"
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', transition: 'transform 0.15s', transform: (hover || rating) >= s ? 'scale(1.2)' : 'scale(1)', color: (hover || rating) >= s ? colors[hover || rating] : 'rgba(255,255,255,0.2)' }}
              >★</button>
            ))}
            {(hover || rating) > 0 && (
              <span className="ms-2 fw-bold" style={{ color: colors[hover || rating], fontSize: 14 }}>
                {labels[hover || rating]}
              </span>
            )}
          </div>
          {errors.rating && <span className="text-danger small">{errors.rating}</span>}
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="text-white-50 small mb-1 d-block">Your Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
              className="w-100 px-4 py-3 rounded-3 text-white fw-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: errors.name ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: 15 }} />
            {errors.name && <span className="text-danger small">{errors.name}</span>}
          </div>
          <div className="col-md-6">
            <label className="text-white-50 small mb-1 d-block">Email (optional)</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              className="w-100 px-4 py-3 rounded-3 text-white fw-medium"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: 15 }} />
          </div>
        </div>

        <div>
          <label className="text-white-50 small mb-1 d-block">Your Comment *</label>
          <textarea value={form.comment} onChange={e => setForm(p => ({...p, comment: e.target.value}))} rows={4}
            placeholder="Tell us about your experience..."
            className="w-100 px-4 py-3 rounded-3 text-white fw-medium"
            style={{ background: 'rgba(255,255,255,0.05)', border: errors.comment ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)', outline: 'none', fontSize: 15, resize: 'vertical' }} />
          {errors.comment && <span className="text-danger small">{errors.comment}</span>}
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="btn fw-bold py-3 rounded-3"
          style={{ background: 'linear-gradient(135deg,#a855f7,#6366f1)', border: 'none', color: '#fff', letterSpacing: 1 }}>
          {status === 'loading' ? <span><span className="spinner-border spinner-border-sm me-2" />Submitting...</span> : '⭐ Submit Feedback'}
        </button>
      </form>
    </motion.div>
  );
}
