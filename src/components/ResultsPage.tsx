import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Download, CheckCircle, ExternalLink, Sparkles, Wand2, Star, Zap, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useHooks';
import { usePrompts } from '../hooks/usePrompts';

export interface GeneratedPrompt {
  prompt: string;
  tool: string;
  instructions: string[];
  // Add metadata for saving
  originalDescription?: string;
  mode?: 'illustration' | 'image';
  style?: string;
  mood?: string;
  aspectRatio?: string;
}

interface ResultsPageProps {
  result: GeneratedPrompt;
  onBack: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'txt' | 'json'>('txt');
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { user } = useAuth();
  const { savePrompt } = usePrompts(user?.id);

  // Save prompt handler
  const handleSavePrompt = async () => {
    if (!user) {
      alert('Please log in to save prompts');
      return;
    }

    if (!saveTitle.trim()) {
      // Set a default title if none provided
      const defaultTitle = result.originalDescription 
        ? result.originalDescription.slice(0, 50) + (result.originalDescription.length > 50 ? '...' : '')
        : 'Generated Prompt';
      setSaveTitle(defaultTitle);
    }

    setIsSaving(true);
    try {
      await savePrompt({
        title: saveTitle.trim() || 'Generated Prompt',
        description: result.originalDescription || 'Generated prompt',
        generatedPrompt: result.prompt,
        mode: result.mode || 'image',
        style: result.style || '',
        mood: result.mood || '',
        aspectRatio: result.aspectRatio || '1:1',
        tool: result.tool,
        isPublic: false
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickSave = () => {
    const defaultTitle = result.originalDescription 
      ? result.originalDescription.slice(0, 50) + (result.originalDescription.length > 50 ? '...' : '')
      : 'Generated Prompt';
    setSaveTitle(defaultTitle);
    handleSavePrompt();
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(result.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      const textArea = document.createElement('textarea');
      textArea.value = result.prompt;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      textArea.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(textArea);
      
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        textArea.contentEditable = 'true';
        textArea.readOnly = false;
        const range = document.createRange();
        range.selectNodeContents(textArea);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        textArea.setSelectionRange(0, 999999);
      } else {
        textArea.focus();
        textArea.select();
      }
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Copy command was unsuccessful');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      if (window.prompt) {
        window.prompt('Copy this text manually (Ctrl+C or Cmd+C):', result.prompt);
      } else {
        alert('Copy failed. Please try selecting the text manually.');
      }
    }
  };

  const handleDownload = () => {
    const content = downloadFormat === 'json' 
      ? JSON.stringify(result, null, 2)
      : `Generated Prompt:\n\n${result.prompt}\n\nRecommended Tool: ${result.tool}\n\nInstructions:\n${result.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}`;
    
    const blob = new Blob([content], { type: downloadFormat === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${Date.now()}.${downloadFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toolLinks: Record<string, string> = {
    'DALL-E': 'https://openai.com/dall-e-2/',
    'ChatGPT with DALL-E 3': 'https://chat.openai.com/',
    'Midjourney': 'https://discord.gg/midjourney',
    'Stable Diffusion': 'https://stability.ai/stable-diffusion',
    'Adobe Firefly': 'https://firefly.adobe.com/',
    'Leonardo AI': 'https://leonardo.ai/',
    'Google Whisk': 'https://labs.google.com/whisk',
    'Whisk': 'https://labs.google.com/whisk'
  };

  const toolDescriptions: Record<string, string> = {
    'DALL-E': 'OpenAI\'s AI image generator, excellent for creative and artistic prompts.',
    'ChatGPT with DALL-E 3': 'OpenAI\'s most advanced image generator with natural language understanding.',
    'Midjourney': 'Discord-based AI art generator known for high-quality, artistic results.',
    'Stable Diffusion': 'Open-source model perfect for detailed control and customization.',
    'Adobe Firefly': 'Adobe\'s AI image generator integrated with Creative Cloud.',
    'Leonardo AI': 'Versatile AI platform with multiple models for different art styles.',
    'Google Whisk': 'Google\'s experimental AI tool for creative image generation.',
    'Whisk': 'Google\'s experimental AI tool for creative image generation.'
  };

  const otherTools = Object.keys(toolLinks).filter(tool => tool !== result.tool);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Generator</span>
                <span className="sm:hidden">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-700 hidden sm:block"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-emerald-600 rounded-xl">
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-white">Prompt Generated</h1>
                  <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Ready to use</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-900 text-emerald-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border border-emerald-800">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              <span className="hidden sm:inline">Success</span>
              <span className="sm:hidden">✓</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* Main Content - Generated Prompt */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
            {/* Generated Prompt Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-6">
                <div className="p-2 sm:p-3 bg-emerald-600 rounded-xl">
                  <Wand2 className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Your Generated Prompt</h3>
                  <p className="text-sm text-slate-400">Ready to use in AI tools</p>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-700">
                <p className="text-slate-100 leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                  {result.prompt}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
                    copied 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Copied!</span>
                      <span className="sm:hidden">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Copy Prompt</span>
                      <span className="sm:hidden">Copy</span>
                    </>
                  )}
                </button>

                {user && (
                  <button
                    onClick={handleQuickSave}
                    disabled={isSaving || saved}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
                      saved 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : isSaving
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {saved ? (
                      <>
                        <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span className="hidden sm:inline">Saved!</span>
                        <span className="sm:hidden">Saved!</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 sm:w-5 h-4 sm:h-5" />
                        <span className="hidden sm:inline">Save</span>
                        <span className="sm:hidden">Save</span>
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value as 'txt' | 'json')}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-600 rounded-lg bg-slate-800 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="txt">Text</option>
                    <option value="json">JSON</option>
                  </select>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    How to use with {result.tool}
                  </h3>
                  <p className="text-sm text-slate-400">Step-by-step instructions</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {result.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 leading-relaxed text-sm sm:text-base">
                        {instruction.includes('(') && instruction.includes('.com') ? (
                          <>
                            {instruction.split('(')[0]}
                            <a 
                              href={`https://${instruction.match(/\((.*?\.com.*?)\)/)?.[1] || ''}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline font-medium"
                            >
                              {instruction.match(/\((.*?)\)/)?.[1] || ''}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            {instruction.includes(' - ') ? ` - ${instruction.split(' - ')[1]}` : ''}
                          </>
                        ) : (
                          instruction
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recommended Tool */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Recommended Tool</h3>
                  <p className="text-sm text-slate-400">Best for your prompt</p>
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-4">
                <h4 className="text-xl font-bold mb-2 text-white">{result.tool}</h4>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  {toolDescriptions[result.tool] || 'Professional AI image generation tool.'}
                </p>
                
                <a
                  href={toolLinks[result.tool] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-200"
                >
                  Launch {result.tool}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="text-xs text-slate-400 bg-slate-800 p-3 rounded-lg border border-slate-700">
                💡 Selected based on your style and requirements
              </div>
            </div>

            {/* Alternative Tools */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Alternative Tools</h3>
                  <p className="text-sm text-slate-400">Other options to try</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {otherTools.slice(0, 3).map((tool) => (
                  <div key={tool} className="border border-slate-700 rounded-lg p-4 hover:border-slate-600 hover:bg-slate-800 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{tool}</h4>
                      <a
                        href={toolLinks[tool]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {toolDescriptions[tool] || 'Alternative AI image generation tool.'}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={onBack}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Create Another Prompt
              </button>
            </div>

            {/* Pro Tips */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <span className="text-xl">💡</span>
                </div>
                <h3 className="text-lg font-medium text-white">Pro Tips</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-white">Iterate & refine</div>
                    <div className="text-slate-400">Try variations by modifying the prompt.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-white">Save templates</div>
                    <div className="text-slate-400">Keep successful prompts for future use.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-medium text-white">Experiment settings</div>
                    <div className="text-slate-400">Adjust tool settings for different styles.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;