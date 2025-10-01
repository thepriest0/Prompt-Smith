// Hook to restore app state after OAuth authentication
import { useEffect } from 'react';

interface UseAppStateRestorationProps {
  setCurrentState: (state: 'landing' | 'modeSelection' | 'generator' | 'results' | 'myPrompts') => void;
  setSelectedMode: (mode: 'illustration' | 'image' | null) => void;
}

export const useAppStateRestoration = ({ setCurrentState, setSelectedMode }: UseAppStateRestorationProps) => {
  useEffect(() => {
    const restoreAppState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check if this is an OAuth redirect
      if (urlParams.has('auth') && urlParams.get('auth') === 'success') {
        console.log('🔄 OAuth redirect detected, cleaning up...');
        
        // Clean up URL parameters
        const cleanUrl = window.location.pathname;
        window.history.replaceState(
          { fromOAuth: true }, 
          document.title, 
          cleanUrl
        );
        
        // For now, just ensure we're on the landing page after successful auth
        // Users can navigate to where they want to go after login
        setCurrentState('landing');
        setSelectedMode(null);
        
        console.log('🎉 OAuth cleanup completed - user returned to landing page');
      }
    };

    // Run immediately
    restoreAppState();
  }, [setCurrentState, setSelectedMode]);
};

export default useAppStateRestoration;