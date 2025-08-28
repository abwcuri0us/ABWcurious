"use client";

import { useState, useEffect } from 'react';
import LoadingAnimation from './LoadingAnimation';

interface LoaderWrapperProps {
  children: React.ReactNode;
}

export default function LoaderWrapper({ children }: LoaderWrapperProps) {
  const [showLoader, setShowLoader] = useState(true);

  const handleLoadingComplete = () => {
    setShowLoader(false);
  };

  if (showLoader) {
    return <LoadingAnimation onComplete={handleLoadingComplete} />;
  }

  return <>{children}</>;
}
