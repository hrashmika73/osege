// Session Persistence Test
// Tests that valid admin sessions are preserved across page reloads

(function() {
  'use strict';
  
  // Only run test if we're on an admin page
  if (!window.location.pathname.startsWith('/admin')) {
    return;
  }
  
  console.log('🧪 Testing session persistence...');
  
  try {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    const adminSession = localStorage.getItem('adminSession');
    
    if (adminToken && adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        console.log('✅ Admin session found:', {
          hasToken: !!adminToken,
          hasData: !!adminData,
          hasSession: !!adminSession,
          role: parsedData.role,
          userId: parsedData.id,
          loginTime: parsedData.lastLogin
        });
        
        // Check if token is JWT and get expiry
        if (adminToken.includes('.')) {
          try {
            const parts = adminToken.split('.');
            const payload = JSON.parse(atob(parts[1].replace(/[-_]/g, c => c === '-' ? '+' : '/')));
            const now = Math.floor(Date.now() / 1000);
            const timeToExpiry = payload.exp - now;
            
            console.log('🔐 JWT Token Info:', {
              isExpired: timeToExpiry <= 0,
              expiresIn: timeToExpiry > 0 ? `${Math.floor(timeToExpiry / 60)} minutes` : 'expired',
              issued: new Date(payload.iat * 1000).toLocaleString()
            });
          } catch (jwtError) {
            console.warn('⚠️ Could not parse JWT token:', jwtError);
          }
        }
        
        console.log('✅ Session should persist on reload');
        
      } catch (parseError) {
        console.error('❌ Invalid admin data format:', parseError);
      }
    } else {
      console.log('ℹ️ No admin session found (not logged in)');
    }
    
  } catch (error) {
    console.error('❌ Session persistence test failed:', error);
  }
  
  // Add a global function to manually test session persistence
  window.testSessionPersistence = function() {
    console.log('🔄 Manual session persistence test...');
    
    const beforeReload = {
      token: !!localStorage.getItem('adminToken'),
      data: !!localStorage.getItem('adminData'),
      session: !!localStorage.getItem('adminSession')
    };
    
    console.log('📊 Session state before reload:', beforeReload);
    
    // Store test data
    sessionStorage.setItem('sessionPersistenceTest', JSON.stringify({
      timestamp: Date.now(),
      beforeReload
    }));
    
    // Reload page
    window.location.reload();
  };
  
  // Check if this is after a persistence test
  const testData = sessionStorage.getItem('sessionPersistenceTest');
  if (testData) {
    try {
      const test = JSON.parse(testData);
      const afterReload = {
        token: !!localStorage.getItem('adminToken'),
        data: !!localStorage.getItem('adminData'),
        session: !!localStorage.getItem('adminSession')
      };
      
      console.log('🧪 Session Persistence Test Results:');
      console.log('📊 Before reload:', test.beforeReload);
      console.log('📊 After reload:', afterReload);
      
      const preserved = 
        test.beforeReload.token === afterReload.token &&
        test.beforeReload.data === afterReload.data &&
        test.beforeReload.session === afterReload.session;
      
      console.log(preserved ? '✅ Session PRESERVED across reload!' : '❌ Session LOST on reload!');
      
      // Clean up test data
      sessionStorage.removeItem('sessionPersistenceTest');
      
    } catch (testError) {
      console.error('❌ Could not parse test data:', testError);
      sessionStorage.removeItem('sessionPersistenceTest');
    }
  }
  
})();
