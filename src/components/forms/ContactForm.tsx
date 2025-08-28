'use client';

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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({ resolver: yupResolver(schema) });

  const onSubmit = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Thank you for your message! We will get back to you soon.');
    reset();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3 shadow p-4 p-md-5">
      <h3 className="h4 text-dark mb-3">Send Message</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="row gy-3">
        <div className="col-12">
          <label htmlFor="name" className="form-label">Full Name</label>
          <input id="name" {...register('name')} className={`form-control ${errors.name ? 'is-invalid' : ''}`} />
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


