import Script from 'next/script';
import { ReactNode } from 'react';

export default function AppsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Google AdSense Global Ecosystem Injection */}
      <Script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4170752809389671" 
        crossOrigin="anonymous" 
        strategy="afterInteractive"
      />
      
      {/* Render Specific App Application */}
      {children}
    </>
  );
}
