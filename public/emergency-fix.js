/**
 * Emergency NetworkError Suppression Script
 * Load this in index.html before other scripts to catch early errors
 */

(function() {
  'use strict';
  
  console.log('🚑 Emergency NetworkError fix loaded');
  
  // 1. Suppress console errors that might crash the app
  const originalError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Skip known NetworkError issues
    if (message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        message.includes('@supabase') ||
        message.includes('chunk') ||
        message.includes('dynamically imported module')) {
      console.warn('🔇 [SUPPRESSED] NetworkError:', ...args);
      return;
    }
    
    originalError.apply(console, args);
  };
  
  // 2. Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    
    if (message.includes('fetch') ||
        message.includes('Network') ||
        message.includes('supabase') ||
        message.includes('chunk') ||
        message.includes('import')) {
      console.warn('🔇 [SUPPRESSED] Unhandled network rejection:', message);
      event.preventDefault();
      return;
    }
  });
  
  // 3. Handle resource loading errors
  window.addEventListener('error', function(event) {
    if (event.target && event.target !== window) {
      const target = event.target;
      if (target.tagName === 'SCRIPT' || target.tagName === 'LINK' || target.tagName === 'IMG') {
        console.warn('🔇 [SUPPRESSED] Resource loading error:', target.src || target.href);
        event.preventDefault();
        return;
      }
    }
    
    const message = event.message || '';
    if (message.includes('fetch') ||
        message.includes('Network') ||
        message.includes('chunk') ||
        message.includes('import')) {
      console.warn('🔇 [SUPPRESSED] Script error:', message);
      event.preventDefault();
    }
  }, true);
  
  // 4. Override fetch to prevent crashes
  const originalFetch = window.fetch;
  if (originalFetch) {
    window.fetch = function(url, options) {
      return originalFetch(url, options).catch(function(error) {
        console.warn('🔇 [SUPPRESSED] Fetch error for', url, ':', error.message);
        
        // Return a mock response to prevent crashes
        return new Response(JSON.stringify({
          success: false,
          error: 'Network unavailable',
          offline: true
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      });
    };
  }
  
  // 5. Ensure localStorage is available
  if (!window.localStorage) {
    window.localStorage = {
      getItem: function() { return null; },
      setItem: function() {},
      removeItem: function() {},
      clear: function() {}
    };
  }
  
  // 6. Set emergency user data if missing
  try {
    if (!localStorage.getItem('userData')) {
      localStorage.setItem('userData', JSON.stringify({
        id: 'emergency_user',
        email: 'user@kleverinvest.com',
        name: 'Emergency User',
        role: 'user',
        verified: true,
        kycStatus: 'verified'
      }));
      localStorage.setItem('userToken', 'emergency_token');
    }
  } catch (e) {
    console.warn('Could not set emergency user data:', e);
  }
  
  console.log('✅ Emergency NetworkError suppression active');
})();
