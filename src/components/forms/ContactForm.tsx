'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitContactQuery } from '@/app/actions';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');
    try {
      const res = await submitContactQuery(form);
      if (res.success) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inp = (field: keyof typeof form, type = 'text', rows?: number) => {
    const cls = `w-100 px-4 py-3 rounded-3 border fw-medium text-white ${errors[field] ? 'border-danger' : 'border-white border-opacity-10'}`;
    const style = { background: 'rgba(255,255,255,0.05)', outline: 'none', fontSize: 15 };
    const base = { value: form[field], onChange: (ev: any) => setForm(p => ({...p, [field]: ev.target.value})) };
    return rows ? <textarea {...base} rows={rows} className={cls} style={style} /> : <input {...base} type={type} className={cls} style={style} />;
  };

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-5 rounded-4 text-center"
        style={{ border: '1px solid rgba(0,242,254,0.3)', background: 'rgba(0,242,254,0.05)' }}>
        <div className="mb-4" style={{ fontSize: 64 }}>✅</div>
        <h3 className="text-white fw-bold mb-3">Message Received!</h3>
        <p className="text-white-50 mb-4">Thank you for reaching out! Our team will review your message and get back to you within 24 hours.</p>
        <p className="text-info small">📧 A confirmation has been noted. You can also reach us at <strong>abwcurious.pvtltd@gmail.com</strong></p>
        <button onClick={() => setStatus('idle')} className="btn btn-outline-info mt-3 px-4">Send Another Message</button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      className="glass-card p-4 p-md-5 rounded-4"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="h4 text-white mb-4 fw-bold">Send Us a Message</h3>

      {status === 'error' && (
        <div className="alert alert-danger bg-transparent border-danger text-danger mb-3">
          Something went wrong. Please try again or email us directly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div>
          <label className="text-white-50 small mb-1 d-block">Full Name *</label>
          {inp('name')}
          {errors.name && <span className="text-danger small">{errors.name}</span>}
        </div>
        <div>
          <label className="text-white-50 small mb-1 d-block">Email Address *</label>
          {inp('email', 'email')}
          {errors.email && <span className="text-danger small">{errors.email}</span>}
        </div>
        <div>
          <label className="text-white-50 small mb-1 d-block">Subject *</label>
          {inp('subject')}
          {errors.subject && <span className="text-danger small">{errors.subject}</span>}
        </div>
        <div>
          <label className="text-white-50 small mb-1 d-block">Your Message *</label>
          {inp('message', 'text', 5)}
          {errors.message && <span className="text-danger small">{errors.message}</span>}
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn btn-primary fw-bold py-3 rounded-3 mt-1"
          style={{ background: 'linear-gradient(135deg,#06BBCC,#0d6efd)', border: 'none', letterSpacing: 1 }}
        >
          {status === 'loading' ? (
            <span><span className="spinner-border spinner-border-sm me-2" />Sending...</span>
          ) : '🚀 Send Message'}
        </button>
      </form>
    </motion.div>
  );
}
