// Utility to check if GitHub Model API is configured
export const isAIServiceConfigured = (): boolean => {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  return !!(githubToken && githubToken !== 'your_github_token_here');
};

export const getAIServiceStatus = (): 'configured' | 'missing-key' | 'demo-mode' => {
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  
  if (!githubToken || githubToken === 'your_github_token_here') {
    return 'missing-key';
  }
  
  if (githubToken.startsWith('demo') || githubToken === 'demo') {
    return 'demo-mode';
  }
  
  return 'configured';
};