'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { motion } from 'framer-motion';

const schema = yup.object({
  name: yup.string().required('Full name is required'),
  dob: yup.date().required('Date of birth is required').max(new Date(), 'Date cannot be in the future'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  location: yup.string().required('Location is required'),
}).required();

type FormData = yup.InferType<typeof schema>;

const JoinForm = () => {
  const [maxDate, setMaxDate] = useState('');
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMaxDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: yupResolver(schema) });
  const [successMsg, setSuccessMsg] = useState('');

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccessMsg('Request received! We will contact you soon.');
        reset();
      } else {
        alert('Failed to submit request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="container py-4">
      <motion.div className="mx-auto glass-card p-4 p-md-5" style={{ maxWidth: 600 }} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-center text-primary mb-4 fw-bold" style={{ textShadow: '0 0 10px rgba(0,242,254,0.5)' }}>Join Us</h2>
        {successMsg && <div className="alert alert-success bg-transparent border-success text-success">{successMsg}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
          <div className="col-12">
            <label htmlFor="name" className="form-label text-white-50">Full Name</label>
            <input type="text" id="name" {...register('name')} className={`form-control bg-dark text-white border-white border-opacity-10 ${errors.name ? 'is-invalid border-danger' : ''}`} />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="dob" className="form-label text-white-50">Date of Birth</label>
            <input type="date" id="dob" {...register('dob')} max={maxDate} className={`form-control bg-dark text-white border-white border-opacity-10 ${errors.dob ? 'is-invalid border-danger' : ''}`} />
            {errors.dob && <div className="invalid-feedback">{errors.dob.message}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="email" className="form-label text-white-50">Email ID</label>
            <input type="email" id="email" {...register('email')} className={`form-control bg-dark text-white border-white border-opacity-10 ${errors.email ? 'is-invalid border-danger' : ''}`} />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="col-12">
            <label htmlFor="location" className="form-label text-white-50">Location</label>
            <input type="text" id="location" {...register('location')} className={`form-control bg-dark text-white border-white border-opacity-10 ${errors.location ? 'is-invalid border-danger' : ''}`} />
            {errors.location && <div className="invalid-feedback">{errors.location.message}</div>}
          </div>

          <div className="col-12 d-grid">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Joining...' : 'Join Now'}
            </button>
          </div>

          <div className="text-center mt-3">
            <Link href="/" className="text-primary">← Back to Home</Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinForm;


