// Custom hook to handle OAuth history cleanup and state restoration
import { useEffect } from 'react';

export const useOAuthHistoryCleanup = () => {
  useEffect(() => {
    const handleOAuthHistoryCleanup = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const currentUrl = window.location.href;
      
      // Check if this is an OAuth redirect
      const isOAuthRedirect = 
        urlParams.has('auth') && urlParams.get('auth') === 'success' ||
        urlParams.has('code') ||
        urlParams.has('state') ||
        currentUrl.includes('oauth') ||
        document.referrer.includes('accounts.google.com');
      
      if (isOAuthRedirect) {
        console.log('🔐 OAuth redirect detected, cleaning up history...');
        
        // Try to restore pre-auth state
        const preAuthStateStr = sessionStorage.getItem('preAuthState');
        if (preAuthStateStr) {
          try {
            const preAuthState = JSON.parse(preAuthStateStr);
            console.log('🔄 Restoring pre-auth state:', preAuthState);
            
            // Clean up the stored state
            sessionStorage.removeItem('preAuthState');
            
            // Check if the stored state is recent (within 10 minutes)
            const isRecentState = Date.now() - preAuthState.timestamp < 10 * 60 * 1000;
            
            if (isRecentState && preAuthState.pathname !== '/') {
              // Restore the user's previous location
              const restoreUrl = `${preAuthState.pathname}${preAuthState.search || ''}`;
              console.log('✅ Restoring to:', restoreUrl);
              
              // Use replaceState to avoid adding to history, then navigate
              window.history.replaceState(
                { fromOAuth: true, restored: true }, 
                document.title, 
                restoreUrl
              );
              
              // Trigger a popstate event to update the app state if needed
              window.dispatchEvent(new PopStateEvent('popstate', { state: { fromOAuth: true, restored: true } }));
              
              return; // Don't do the default cleanup
            }
          } catch (error) {
            console.warn('Failed to restore pre-auth state:', error);
            sessionStorage.removeItem('preAuthState');
          }
        }
        
        // Default cleanup: just clean the URL
        const cleanUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        window.history.replaceState(
          { fromOAuth: true }, 
          document.title, 
          cleanUrl
        );
        
        console.log('🔐 OAuth history cleanup completed');
      }
    };

    // Run cleanup immediately
    handleOAuthHistoryCleanup();
    
    // Also run when the page becomes visible (in case of tab switching during OAuth)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleOAuthHistoryCleanup();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};

export default useOAuthHistoryCleanup;