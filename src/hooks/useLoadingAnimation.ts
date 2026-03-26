import { useState, useEffect } from 'react';

export const useLoadingAnimation = (initialDelay: number = 1000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Show loader for initial delay
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    showLoader,
    handleLoadingComplete,
  };
};



