"use client";

import { useState, useEffect } from 'react';
import LoadingAnimation from './LoadingAnimation';

interface LoaderWrapperProps {
  children: React.ReactNode;
}

export default function LoaderWrapper({ children }: LoaderWrapperProps) {
  // Disabled arbitrary static loader to massively boost Lighthouse metrics
  const [showLoader, setShowLoader] = useState(false);

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  return (
    <>
      {showLoader && <LoadingAnimation onComplete={handleLoadingComplete} />}
      {children}
    </>
  );
}
