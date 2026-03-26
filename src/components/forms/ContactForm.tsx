'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
}).required();

type FormData = yup.InferType<typeof schema>;

const ContactForm = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [successMsg, setSuccessMsg] = useState('');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccessMsg('Thank you! Your message has been sent successfully.');
        reset();
      } else {
        alert('Failed to send message. Please try again later.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-4 p-md-5">
      <h3 className="h4 text-white mb-4 fw-bold">Send Message</h3>
      {successMsg && <div className="alert alert-success bg-transparent border-success text-success">{successMsg}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
        <div className="col-12">
          <label htmlFor="name" className="form-label text-white-50">Full Name</label>
          <input id="name" {...register('name')} className={`form-control bg-dark text-white border-white border-opacity-10 ${errors.name ? 'is-invalid border-danger' : ''}`} />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="email" className="form-label">Email Address</label>
          <input id="email" type="email" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="subject" className="form-label">Subject</label>
          <input id="subject" {...register('subject')} className={`form-control ${errors.subject ? 'is-invalid' : ''}`} />
          {errors.subject && <div className="invalid-feedback">{errors.subject.message}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea id="message" rows={5} {...register('message')} className={`form-control ${errors.message ? 'is-invalid' : ''}`} />
          {errors.message && <div className="invalid-feedback">{errors.message.message}</div>}
        </div>

        <div className="col-12 d-grid">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">{isSubmitting ? 'Sending...' : 'Send Message'}</button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactForm;


