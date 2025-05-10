import { useEffect } from 'react';

export default function TawkChatWidget({ autoOpen = false }) {
  useEffect(() => {
    // Load Tawk.to widget with your specific widget ID
    var Tawk_API = Tawk_API || {};
    var Tawk_LoadStart = new Date();
    
    (function(){
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = 'https://embed.tawk.to/681f2538704280190f1b65f5/1iqsqiq3l';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      s0.parentNode.insertBefore(s1, s0);
    })();
    
    // Optionally open the chat widget automatically
    if (autoOpen) {
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_API.onLoad = function() {
        window.Tawk_API.maximize();
      };
    }

    // Clean up function to handle component unmounting
    return () => {
      // Tawk.to doesn't provide a built-in cleanup method,
      // but we can remove the script if needed
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript && typeof window !== 'undefined') {
        // In practice, you might not want to remove the script
        // as it could affect the widget on other pages
        // This is just for completeness
        // tawkScript.remove();
      }
    };
  }, [autoOpen]);

  return null; // This component doesn't render anything visible
} 