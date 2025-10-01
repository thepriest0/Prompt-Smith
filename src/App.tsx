import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useHooks';
import LandingPage from './components/LandingPage';
import ModeSelection from './components/ModeSelection.tsx';
import PromptGenerator from './components/PromptGenerator';
import ResultsPage, { type GeneratedPrompt } from './components/ResultsPage';
import MyPromptsPage from './components/MyPromptsPage';

type AppState = 'landing' | 'modeSelection' | 'generator' | 'results' | 'myPrompts';
export type AppMode = 'illustration' | 'image';

const AppContent: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  
  const [selectedMode, setSelectedMode] = useState<AppMode | null>(null);
  const [generatedResult, setGeneratedResult] = useState<GeneratedPrompt | null>(null);

  // URL-based routing system
  const getCurrentStateFromURL = (): AppState => {
    const path = window.location.pathname;
    
    if (path === '/' || path === '') {
      return 'landing';
    } else if (path === '/mode-selection') {
      return 'modeSelection';
    } else if (path === '/generator') {
      return 'generator';
    } else if (path === '/results') {
      return 'results';
    } else if (path === '/my-prompts') {
      return 'myPrompts';
    }
    
    return 'landing'; // Default fallback
  };

  const [currentState, setCurrentState] = useState<AppState>(getCurrentStateFromURL());

  // IMMEDIATE OAuth success check - runs as soon as component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    
    if (authSuccess === 'success') {
      console.log('🚨 IMMEDIATE OAuth success detected!');
      console.log('🔍 Current URL:', window.location.href);
      console.log('🔍 Auth param:', authSuccess);
      
      // Clean up URL immediately
      urlParams.delete('auth');
      const cleanUrl = window.location.origin + window.location.pathname + 
        (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', cleanUrl);
      
      // Force redirect to mode selection
      window.location.hash = '#mode-selection';
      setTimeout(() => {
        window.location.href = window.location.origin + '/mode-selection';
      }, 1000);
    }
  }, []);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const newState = getCurrentStateFromURL();
      setCurrentState(newState);
      
      // Restore mode from URL if present
      const params = new URLSearchParams(window.location.search);
      const mode = params.get('mode') as AppMode;
      if (mode && (mode === 'illustration' || mode === 'image')) {
        setSelectedMode(mode);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial load - check URL params
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode') as AppMode;
    if (mode && (mode === 'illustration' || mode === 'image')) {
      setSelectedMode(mode);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Helper function to navigate and update URL
  const navigateTo = useCallback((state: AppState, mode?: AppMode | null, replaceHistory: boolean = false) => {
    setCurrentState(state);
    if (mode !== undefined) {
      setSelectedMode(mode);
    }

    // Update URL
    let path = '/';
    const params = new URLSearchParams();

    switch (state) {
      case 'landing':
        path = '/';
        break;
      case 'modeSelection':
        path = '/mode-selection';
        break;
      case 'generator':
        path = '/generator';
        if (selectedMode || mode) {
          params.set('mode', selectedMode || mode || 'illustration');
        }
        break;
      case 'results':
        path = '/results';
        if (selectedMode || mode) {
          params.set('mode', selectedMode || mode || 'illustration');
        }
        break;
      case 'myPrompts':
        path = '/my-prompts';
        break;
    }

    const fullURL = `${path}${params.toString() ? '?' + params.toString() : ''}`;
    
    if (replaceHistory) {
      window.history.replaceState({ state, mode }, '', fullURL);
    } else {
      window.history.pushState({ state, mode }, '', fullURL);
    }
  }, [selectedMode]);

  // Handle OAuth success and clean up auth parameter from URL
  React.useEffect(() => {
    // Don't process OAuth redirect while still loading auth status
    if (isLoading) return;
    
    const url = new URL(window.location.href);
    const authSuccess = url.searchParams.get('auth');
    
    if (authSuccess === 'success') {
      console.log('🎉 OAuth success detected, cleaning up URL and redirecting');
      console.log('🔍 User state:', user ? 'authenticated' : 'not authenticated');
      
      // Clean up the URL by removing the auth parameter
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
      
      // If user is authenticated, navigate to mode selection
      if (user) {
        console.log('🚀 Redirecting to mode selection');
        navigateTo('modeSelection', null, true);
      } else {
        console.log('⚠️ User not authenticated, staying on landing page');
      }
    } else if (url.searchParams.has('auth')) {
      // Clean up any other auth parameters
      url.searchParams.delete('auth');
      window.history.replaceState({}, '', url.toString());
    }
  }, [user, navigateTo, isLoading]);

  // Handle logout and redirect to landing page
  const handleLogout = async () => {
    await logout();
    navigateTo('landing', null, true);
    setGeneratedResult(null);
  };

  const handleModeSelection = (mode: AppMode) => {
    navigateTo('generator', mode);
  };

  const handlePromptGenerated = (result: GeneratedPrompt) => {
    setGeneratedResult(result);
    navigateTo('results', selectedMode);
  };

  const handleBackToGenerator = () => {
    navigateTo('generator', selectedMode);
  };

  const handleBackToModeSelection = () => {
    navigateTo('modeSelection', null);
  };

  const handleShowMyPrompts = () => {
    navigateTo('myPrompts');
  };

  const handleBackFromMyPrompts = () => {
    navigateTo('modeSelection');
  };

  // If user logs out, redirect to landing page
  React.useEffect(() => {
    if (!user && currentState !== 'landing') {
      navigateTo('landing', null, true);
      setGeneratedResult(null);
    }
  }, [user, currentState, navigateTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users away from landing page
  if (user && currentState === 'landing') {
    // Force redirect using navigateTo
    setTimeout(() => navigateTo('modeSelection', null, true), 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting...</div>
      </div>
    );
  }

  // Show landing page only for unauthenticated users
  if (!user && currentState === 'landing') {
    return <LandingPage />;
  }

  if (currentState === 'modeSelection') {
    return <ModeSelection onModeSelect={handleModeSelection} onShowMyPrompts={handleShowMyPrompts} onLogout={handleLogout} />;
  }

  if (currentState === 'myPrompts') {
    return <MyPromptsPage onBack={handleBackFromMyPrompts} />;
  }

  if (currentState === 'generator' && selectedMode) {
    return (
      <PromptGenerator 
        mode={selectedMode}
        onGenerate={handlePromptGenerated}
        onBack={handleBackToModeSelection}
        onLogout={handleLogout}
      />
    );
  }

  if (currentState === 'results' && generatedResult) {
    return <ResultsPage result={generatedResult} onBack={handleBackToGenerator} />;
  }

  return <LandingPage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
