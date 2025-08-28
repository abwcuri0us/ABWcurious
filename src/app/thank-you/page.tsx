'use client';
import { Suspense } from 'react';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

function ThankYouInner() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'there';
  const email = searchParams.get('email') || '';

  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-lg p-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Success Icon */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl lg:text-5xl font-bold text-dark mb-6">
            Thank You, {name}!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Your application has been successfully submitted. We're excited to have you 
            join our learning community!
          </p>

          {email && (
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              We've sent a confirmation email to <span className="font-semibold text-primary">{email}</span>. 
              Please check your inbox for further instructions.
            </p>
          )}

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Our team will review your application and get back to you within 24-48 hours 
            with next steps and additional information about our programs.
          </p>

          {/* Next Steps */}
          <div className="bg-light rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-dark mb-4">What's Next?</h3>
            <div className="text-left space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <span className="text-gray-700">We'll review your application and contact details</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <span className="text-gray-700">You'll receive a welcome email with program details</span>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <span className="text-gray-700">Schedule your orientation session and start learning!</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/" 
              className="btn btn-primary py-3 px-8 text-lg font-semibold"
            >
              Back to Home
            </Link>
            <Link 
              href="/about" 
              className="btn border-2 border-primary text-primary py-3 px-8 text-lg font-semibold hover:bg-primary hover:text-white transition-all duration-300"
            >
              Learn More About Us
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">
              Have questions? We're here to help!
            </p>
            <p className="text-gray-600">
              Email us at <a href="mailto:info@abwcurious.com" className="text-primary hover:underline">info@abwcurious.com</a> 
              or call us at <a href="tel:+01234567890" className="text-primary hover:underline">+012 345 67890</a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="container py-5">Loading...</div>}>
      <ThankYouInner />
    </Suspense>
  );
}

