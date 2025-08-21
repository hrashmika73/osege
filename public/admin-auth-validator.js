// Smart Admin Authentication Validator
// Only clears invalid/expired sessions, preserves valid ones

(function() {
  'use strict';
  
  console.log('🔍 Validating admin authentication (preserving valid sessions)...');
  
  try {
    // Function to check if JWT token is valid and not expired
    const isValidJWT = (token) => {
      try {
        if (!token || !token.includes('.')) return false;
        
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Decode payload
        const payload = JSON.parse(atob(parts[1].replace(/[-_]/g, c => c === '-' ? '+' : '/')));
        
        // Check if token is expired (with 5 minute buffer)
        const now = Math.floor(Date.now() / 1000);
        const buffer = 5 * 60; // 5 minutes
        
        if (payload.exp && payload.exp < (now - buffer)) {
          console.log('🔒 Admin JWT token expired');
          return false;
        }
        
        // Check if token has required admin fields
        if (!payload.role || payload.role !== 'admin') {
          console.log('🔒 Invalid admin role in token');
          return false;
        }
        
        return true;
      } catch (error) {
        console.warn('🔒 JWT validation error:', error);
        return false;
      }
    };
    
    // Function to validate admin session
    const validateAdminSession = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminData = localStorage.getItem('adminData');
      const adminSession = localStorage.getItem('adminSession');
      
      // If no admin token, session is invalid
      if (!adminToken) {
        return false;
      }
      
      // If no admin data, session is invalid
      if (!adminData) {
        return false;
      }
      
      // Validate admin data
      try {
        const parsedAdminData = JSON.parse(adminData);
        if (!parsedAdminData.role || parsedAdminData.role !== 'admin') {
          console.log('🔒 Invalid admin role in data');
          return false;
        }
      } catch (error) {
        console.log('🔒 Invalid admin data format');
        return false;
      }
      
      // Validate JWT token if it's a JWT
      if (adminToken.includes('.')) {
        if (!isValidJWT(adminToken)) {
          return false;
        }
      }
      
      // Validate session if it exists
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          if (session.expiresAt) {
            const expiryTime = new Date(session.expiresAt).getTime();
            if (Date.now() > expiryTime) {
              console.log('🔒 Admin session expired');
              return false;
            }
          }
        } catch (error) {
          console.warn('🔒 Invalid session format');
          // Don't invalidate session just for invalid format
        }
      }
      
      return true;
    };
    
    // Function to clear invalid auth data
    const clearInvalidAuth = () => {
      const adminKeys = [
        'adminToken',
        'adminData', 
        'adminSession',
        'adminLoginAttempts',
        'adminLockoutUntil'
      ];

      adminKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear any biometric data (starts with 'biometric_')
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('biometric_')) {
          localStorage.removeItem(key);
        }
      });

      // Clear any old legacy auth data
      const legacyKeys = [
        'userRole',
        'token',
        'authToken',
        'adminRole'
      ];
      
      legacyKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('🧹 Cleared invalid admin authentication data');
    };
    
    // Main validation logic
    const isValidSession = validateAdminSession();
    
    if (isValidSession) {
      console.log('✅ Valid admin session found, preserving authentication');
      
      // Update last activity timestamp if session exists
      const adminSession = localStorage.getItem('adminSession');
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          session.lastActivity = new Date().toISOString();
          localStorage.setItem('adminSession', JSON.stringify(session));
        } catch (error) {
          console.warn('Failed to update last activity:', error);
        }
      }
    } else {
      console.log('❌ Invalid admin session detected');
      
      // Only clear auth data if session is actually invalid
      clearInvalidAuth();
      
      // Store attempted URL for redirect after login
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin-secure-login' &&
          window.location.pathname !== '/admin-login-info' &&
          window.location.pathname !== '/admin' &&
          window.location.pathname !== '/admin-login') {

        // Store the attempted URL for redirect after successful login
        sessionStorage.setItem('adminRedirectURL', window.location.pathname + window.location.search);

        console.log('🔄 Redirecting to admin login page...');

        // Add a small delay to ensure the page loads first
        setTimeout(() => {
          window.location.href = '/admin-secure-login';
        }, 100);
      }
    }
    
  } catch (error) {
    console.error('❌ Admin auth validation failed:', error);
  }
})();
