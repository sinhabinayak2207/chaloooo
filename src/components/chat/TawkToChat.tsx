'use client';

import { useEffect } from 'react';
import { TAWK_SITE_ID, TAWK_WIDGET_ID } from '@/config/tawk-config';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

export default function TawkToChat() {
  useEffect(() => {
    // Initialize Tawk.to if not already loaded
    if (!window.Tawk_API) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();

      const script = document.createElement('script');
      script.async = true;
      script.src = `https://embed.tawk.to/${TAWK_SITE_ID}/${TAWK_WIDGET_ID}`;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    }

    // Cleanup function
    return () => {
      // Optional: Clean up Tawk.to when component unmounts
      if (window.Tawk_API && typeof window.Tawk_API.onBeforeUnload === 'function') {
        window.Tawk_API.onBeforeUnload();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}
