'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface GoogleAdProps {
  /** Google AdSense ad slot ID */
  slot: string;
  /** Ad format - defaults to "auto" for responsive */
  format?: string;
  /** Custom inline styles for the ad container */
  style?: React.CSSProperties;
  /** Optional className for the wrapper */
  className?: string;
}

// Subscribe function that returns a no-op cleanup (never triggers re-render)
const emptySubscribe = () => () => {};

/**
 * Reusable Google AdSense component.
 *
 * - Renders only on the client (SSR-safe) via useSyncExternalStore.
 * - Shows a subtle "Advertisement" label above the ad unit.
 * - Gracefully degrades when ads are blocked.
 * - Matches site aesthetic via `glass-card` styling.
 */
export default function GoogleAd({
  slot,
  format = 'auto',
  style,
  className = '',
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  // SSR-safe client check using useSyncExternalStore
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!isClient) return;

    // Schedule ad push and block detection via microtask to avoid
    // synchronous setState in effect body
    const detectTimer = setTimeout(() => {
      // Push ad to the adsbygoogle array so AdSense can pick it up
      try {
        const win = window as unknown as Record<string, unknown>;
        const adsbygoogle = win.adsbygoogle;
        if (adsbygoogle && Array.isArray(adsbygoogle)) {
          adsbygoogle.push({});
        } else {
          setAdBlockDetected(true);
          return;
        }
      } catch {
        setAdBlockDetected(true);
        return;
      }

      // Secondary check: detect if ad was blocked after render
      const checkTimer = setTimeout(() => {
        if (adRef.current) {
          const ins = adRef.current.querySelector('ins');
          if (ins) {
            const isEmpty = ins.innerHTML === '' || ins.offsetHeight === 0;
            if (isEmpty) {
              setAdBlockDetected(true);
            }
          }
        }
      }, 2000);

      return () => clearTimeout(checkTimer);
    }, 0);

    return () => clearTimeout(detectTimer);
  }, [isClient]);

  // Don't render on server
  if (!isClient) {
    return null;
  }

  return (
    <div
      className={`my-4 ${className}`}
      style={style}
    >
      {/* Advertisement label */}
      <div className="flex items-center justify-center mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-medium select-none">
          Advertisement
        </span>
      </div>

      {/* Ad container with glass-card styling */}
      <div
        ref={adRef}
        className={`glass-card rounded-lg overflow-hidden flex items-center justify-center min-h-[60px] ${
          adBlockDetected ? 'hidden' : ''
        }`}
      >
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', ...style }}
          data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_AD_CLIENT || ''}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>

      {/* Graceful degradation: subtle placeholder when ads are blocked */}
      {adBlockDetected && (
        <div className="glass-card rounded-lg overflow-hidden flex items-center justify-center min-h-[60px] py-4">
          <span className="text-[10px] text-muted-foreground/30 select-none">
            Ad space
          </span>
        </div>
      )}
    </div>
  );
}
