import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sparkles, LogOut, User, Wand2, Menu, X, ArrowLeft, Monitor, Camera } from 'lucide-react';
import { useAuth } from '../hooks/useHooks';
import ThemeToggle from './ThemeToggle';
import type { GeneratedPrompt } from './ResultsPage';
import type { AppMode } from '../App';

interface PromptGeneratorProps {
  mode: AppMode;
  onGenerate: (result: GeneratedPrompt) => void;
  onBack: () => void;
  onLogout?: () => Promise<void>;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ mode, onGenerate, onBack, onLogout }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    style: '',
    mood: '',
    aspectRatio: '1:1',
    primaryColor: '#3B82F6',
    secondaryColor: '#8B5CF6',
    accentColor: '#F59E0B',
    background: mode === 'illustration' ? 'transparent' : 'gradient'
  });

  // Illustration styles for UI/UX designers
  const illustrationStyles = [
    { id: 'flat-vector', name: 'Flat Vector', preview: '📐', description: 'Clean, minimal UI design' },
    { id: '3d-ui', name: '3D UI Illustration', preview: '🎯', description: 'Modern 3D interface elements' },
    { id: 'isometric', name: 'Isometric', preview: '🔷', description: 'Technical 3D perspective' },
    { id: 'gradient-mesh', name: 'Gradient Mesh', preview: '🌈', description: 'Smooth gradient blends' },
    { id: 'minimal-line', name: 'Minimal Line', preview: '✏️', description: 'Clean line art style' },
    { id: 'material-design', name: 'Material Design', preview: '💎', description: 'Google Material aesthetic' },
    { id: 'glassmorphism', name: 'Glassmorphism', preview: '🔍', description: 'Frosted glass effects' },
    { id: 'neumorphism', name: 'Neumorphism', preview: '🎨', description: 'Soft 3D UI elements' }
  ];

  // General image styles for creative projects
  const imageStyles = [
    { id: 'photorealistic', name: 'Photorealistic', preview: '📸', description: 'Lifelike photography' },
    { id: 'cinematic', name: 'Cinematic', preview: '🎬', description: 'Movie-like scenes' },
    { id: 'oil-painting', name: 'Oil Painting', preview: '🖼️', description: 'Classical artistic style' },
    { id: 'anime', name: 'Anime', preview: '👾', description: 'Japanese animation style' },
    { id: 'watercolor', name: 'Watercolor', preview: '🎨', description: 'Soft, flowing paint style' },
    { id: 'digital-art', name: 'Digital Art', preview: '💻', description: 'Modern digital artwork' },
    { id: 'sketch', name: 'Sketch', preview: '✏️', description: 'Hand-drawn illustration' },
    { id: 'abstract', name: 'Abstract', preview: '🎭', description: 'Non-representational art' }
  ];

  const currentStyles = mode === 'illustration' ? illustrationStyles : imageStyles;

  // Mode-specific moods
  const illustrationMoods = [
    'Professional', 'Modern', 'Friendly', 'Minimal', 'Bold', 'Elegant',
    'Playful', 'Corporate', 'Fresh', 'Clean', 'Dynamic', 'Sophisticated'
  ];

  const imageMoods = [
    'Dramatic', 'Serene', 'Mysterious', 'Energetic', 'Romantic', 'Epic',
    'Calm', 'Vibrant', 'Moody', 'Ethereal', 'Intense', 'Dreamy'
  ];

  const currentMoods = mode === 'illustration' ? illustrationMoods : imageMoods;

  // Aspect ratios
  const aspectRatios = [
    { id: '1:1', name: 'Square', description: '1:1 - Perfect for social media' },
    { id: '16:9', name: 'Landscape', description: '16:9 - Widescreen format' },
    { id: '9:16', name: 'Portrait', description: '9:16 - Mobile/story format' },
    { id: '4:3', name: 'Standard', description: '4:3 - Classic photo format' },
    { id: '3:2', name: 'Photography', description: '3:2 - Traditional camera ratio' },
    { id: '21:9', name: 'Ultra Wide', description: '21:9 - Cinematic format' }
  ];

  // Background options based on mode
  const illustrationBackgrounds = [
    { id: 'transparent', name: 'Transparent', description: 'No background (PNG)' },
    { id: 'white', name: 'White', description: 'Clean white background' },
    { id: 'gradient', name: 'Gradient', description: 'Smooth color transition' }
  ];

  const imageBackgrounds = [
    { id: 'natural', name: 'Natural', description: 'Environmental background' },
    { id: 'gradient', name: 'Gradient', description: 'Smooth color transition' },
    { id: 'solid', name: 'Solid Color', description: 'Single color background' },
    { id: 'textured', name: 'Textured', description: 'Textured background' }
  ];

  const currentBackgrounds = mode === 'illustration' ? illustrationBackgrounds : imageBackgrounds;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    // Simulate API call to GPT-4 for prompt generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Different style descriptions based on mode
    const illustrationStyleDescriptions: { [key: string]: string } = {
      'flat-vector': 'flat vector illustration, clean geometric shapes, minimal details, UI/UX design style',
      '3d-ui': '3D UI illustration, modern interface elements, depth and shadows, contemporary design',
      'isometric': 'isometric illustration, technical 3D perspective, geometric precision, architectural style',
      'gradient-mesh': 'gradient mesh illustration, smooth color transitions, modern digital art style',
      'minimal-line': 'minimal line art, clean strokes, simple geometric forms, contemporary illustration',
      'material-design': 'material design style, Google design language, depth and shadows, modern UI',
      'glassmorphism': 'glassmorphism style, frosted glass effects, transparency, modern UI design',
      'neumorphism': 'neumorphism style, soft 3D elements, subtle shadows, tactile interface design'
    };

    const imageStyleDescriptions: { [key: string]: string } = {
      'photorealistic': 'photorealistic, high detail, professional photography, sharp focus, realistic lighting',
      'cinematic': 'cinematic style, dramatic lighting, movie-like composition, atmospheric depth',
      'oil-painting': 'oil painting style, thick brushstrokes, classical art technique, rich textures',
      'anime': 'anime style, cel-shaded, vibrant colors, Japanese animation aesthetic',
      'watercolor': 'watercolor painting, soft edges, flowing paint, artistic medium, paper texture',
      'digital-art': 'digital art style, modern illustration, clean rendering, contemporary aesthetic',
      'sketch': 'pencil sketch, hand-drawn lines, artistic expression, traditional medium',
      'abstract': 'abstract art style, non-representational forms, artistic interpretation, modern art'
    };

    const currentStyleDescriptions = mode === 'illustration' ? illustrationStyleDescriptions : imageStyleDescriptions;
    
    const backgroundDescriptions: { [key: string]: string } = {
      'transparent': 'isolated on transparent background, no background, PNG format',
      'white': 'clean white background, minimal, professional',
      'gradient': `gradient background from ${formData.primaryColor} to ${formData.secondaryColor}`,
      'solid': `solid ${formData.primaryColor} background`,
      'natural': 'natural environmental background, contextual setting',
      'textured': 'textured background, artistic surface, complementary texture'
    };

    const styleDesc = currentStyleDescriptions[formData.style] || 'artistic style';
    const bgDesc = backgroundDescriptions[formData.background] || 'simple background';
    const aspectRatioDesc = `${formData.aspectRatio} aspect ratio`;
    
    const detailedPrompt = `${formData.description}, ${styleDesc}, ${formData.mood.toLowerCase()} mood, ${aspectRatioDesc}, color palette featuring ${formData.primaryColor} primary, ${formData.secondaryColor} secondary, and ${formData.accentColor} accent colors, ${bgDesc}, high quality, detailed, professional composition, perfect lighting, masterpiece`;

    // Intelligent tool recommendations based on actual capabilities and free availability
    const getSmartToolRecommendation = (mode: 'illustration' | 'image', style: string, description: string): string => {
      const desc = description.toLowerCase();
      
      if (mode === 'illustration') {
        // For technical diagrams, isometric - Copilot is excellent
        if (style === 'isometric' || desc.includes('technical') || desc.includes('diagram')) {
          return 'Microsoft Copilot with DALL-E 3';
        }
        
        // For flat vector, minimal design - ChatGPT DALL-E 3 is excellent and free
        if (style === 'flat-vector' || style === 'minimal-line' || style === 'material-design') {
          return 'ChatGPT with DALL-E 3';
        }
        
        // Default to ChatGPT for illustrations (free and high quality)
        return 'ChatGPT with DALL-E 3';
      } else {
        // For realistic images
        if (style === 'photorealistic' || desc.includes('photo') || desc.includes('realistic')) {
          return 'Microsoft Copilot with DALL-E 3';
        }
        
        // For cinematic or dramatic scenes
        if (style === 'cinematic' || desc.includes('cinematic') || desc.includes('dramatic')) {
          return 'ChatGPT with DALL-E 3';
        }
        
        // For artistic styles (anime, oil painting, etc.)
        if (style === 'oil-painting' || style === 'watercolor' || style === 'anime') {
          return 'ChatGPT with DALL-E 3';
        }
        
        // Default to Copilot for realistic images
        return 'Microsoft Copilot with DALL-E 3';
      }
    };

    const recommendedTool = getSmartToolRecommendation(mode, formData.style, formData.description);
    
    const instructions: Record<string, string[]> = {
      'ChatGPT with DALL-E 3': [
        'Go to ChatGPT (chat.openai.com) - it\'s free with account!',
        'Paste the prompt and ask DALL-E 3 to generate the image',
        `Specify "${formData.aspectRatio} aspect ratio" in your request`,
        'Download the result and refine with follow-up prompts if needed'
      ],
      'Microsoft Copilot with DALL-E 3': [
        'Go to Microsoft Copilot (copilot.microsoft.com) - it\'s free!',
        'Paste the prompt and request image generation',
        `Ask for "${formData.aspectRatio} aspect ratio" in your message`,
        'Generate multiple variations and choose the best result'
      ],
      'DALL-E': [
        'Go to OpenAI\'s DALL-E interface',
        'Paste the generated prompt',
        `Set aspect ratio to ${formData.aspectRatio}`,
        'Click "Generate" and wait for results'
      ],
      'Midjourney': [
        'Join Midjourney Discord server',
        'Go to a #general channel',
        `Type "/imagine" followed by the prompt and "--ar ${formData.aspectRatio.replace(':', ' ')}"`,
        'Wait for the 4 initial variations and choose your favorite'
      ],
      'Adobe Firefly': [
        'Visit Adobe Firefly website',
        'Select "Text to Image" option',
        'Enter the generated prompt',
        `Choose ${formData.aspectRatio} aspect ratio in settings`
      ],
      'Leonardo AI': [
        'Log into Leonardo AI platform',
        'Select "Image Generation"',
        'Paste the optimized prompt',
        `Set aspect ratio to ${formData.aspectRatio} in advanced settings`
      ]
    };

    const result: GeneratedPrompt = {
      prompt: detailedPrompt,
      primaryTool: {
        name: recommendedTool,
        reasoning: 'Recommended based on style and requirements',
        cost: recommendedTool.includes('ChatGPT') || recommendedTool.includes('Copilot') ? 'Free' : 'Paid',
        strengths: ['Reliable', 'Good quality', 'Accessible']
      },
      alternativeTools: [
        {
          name: 'Midjourney',
          reasoning: 'Higher artistic quality for creative work',
          cost: 'Paid',
          strengths: ['Superior quality', 'Artistic excellence']
        },
        {
          name: 'Leonardo AI',
          reasoning: 'Good alternative with model variety',
          cost: 'Freemium',
          strengths: ['Multiple models', 'Fine-tuned options']
        }
      ],
      instructions: {
        primaryTool: instructions[recommendedTool] || instructions['DALL-E'],
        alternatives: {
          'Midjourney': [
            'Subscribe to Midjourney (midjourney.com)',
            'Join their Discord server',
            'Use /imagine command with the prompt',
            'Specify aspect ratio with --ar parameter',
            'Upscale and download results'
          ],
          'Leonardo AI': [
            'Create account at Leonardo.ai',
            'Select appropriate model',
            'Input the prompt in generation interface',
            'Set aspect ratio and parameters',
            'Generate and download results'
          ]
        }
      },
      tips: [
        'Try multiple variations for better results',
        'Experiment with different aspect ratios',
        'Add style keywords if results don\'t match expectations'
      ],
      // Add metadata for saving
      originalDescription: formData.description,
      mode: mode,
      style: formData.style,
      mood: formData.mood,
      aspectRatio: formData.aspectRatio
    };

    setIsGenerating(false);
    onGenerate(result);
  };

  const modeConfig = {
    illustration: {
      title: 'Illustration Generator',
      subtitle: 'UI/UX Design Assets',
      icon: <Monitor className="h-5 w-5" />,
      placeholder: 'A clean dashboard interface with data visualization charts, modern flat design for SaaS application...'
    },
    image: {
      title: 'Image Generator', 
      subtitle: 'Creative Visuals',
      icon: <Camera className="h-5 w-5" />,
      placeholder: 'A majestic dragon soaring through clouds at sunset, breathing ethereal flames...'
    }
  };

  const config = modeConfig[mode];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="saas-header">
        <div className="saas-container-wide py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-900"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="saas-feature-icon">
                {config.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{config.title}</h1>
                <p className="text-sm text-gray-600">{config.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-gray-700">
                <User className="h-5 w-5" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <ThemeToggle />
              <button
                onClick={onLogout}
                className="saas-btn-ghost flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="saas-container-wide py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="saas-card p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="saas-heading-sm mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Settings
                </h3>
              </div>

              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood/Theme
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => handleInputChange('mood', e.target.value)}
                  className="saas-select"
                  required
                >
                  <option value="">Select mood...</option>
                  {currentMoods.map((mood) => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Aspect Ratio
                </label>
                <div className="space-y-2">
                  {aspectRatios.map((ratio) => (
                    <label key={ratio.id} className="saas-radio-card">
                      <input
                        type="radio"
                        name="aspectRatio"
                        value={ratio.id}
                        checked={formData.aspectRatio === ratio.id}
                        onChange={(e) => handleInputChange('aspectRatio', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`flex items-center w-full ${
                        formData.aspectRatio === ratio.id ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.aspectRatio === ratio.id 
                            ? 'border-gray-900 bg-gray-900' 
                            : 'border-gray-300'
                        }`}>
                          {formData.aspectRatio === ratio.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {ratio.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ratio.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Color Palette</h4>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Primary
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="saas-color-input"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {formData.primaryColor}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Secondary
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                      className="saas-color-input"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {formData.secondaryColor}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Accent
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => handleInputChange('accentColor', e.target.value)}
                      className="saas-color-input"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {formData.accentColor}
                    </span>
                  </div>
                </div>
              </div>

              {/* Background */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Background
                </label>
                <div className="space-y-2">
                  {currentBackgrounds.map((bg) => (
                    <label key={bg.id} className="saas-radio-card">
                      <input
                        type="radio"
                        name="background"
                        value={bg.id}
                        checked={formData.background === bg.id}
                        onChange={(e) => handleInputChange('background', e.target.value)}
                        className="sr-only"
                      />
                      <div className={`flex items-center w-full ${
                        formData.background === bg.id ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                          formData.background === bg.id 
                            ? 'border-gray-900 bg-gray-900' 
                            : 'border-gray-300'
                        }`}>
                          {formData.background === bg.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {bg.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {bg.description}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Description */}
              <div className="saas-card p-6">
                <h3 className="saas-heading-sm mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Describe Your Vision
                </h3>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={config.placeholder}
                  className="saas-textarea h-32"
                  required
                />
              </div>

              {/* Style Selection */}
              <div className="saas-card p-6">
                <h3 className="saas-heading-sm mb-4 flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  Choose {mode === 'illustration' ? 'Illustration' : 'Art'} Style
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentStyles.map((style) => (
                    <motion.button
                      key={style.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('style', style.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                        formData.style === style.id
                          ? 'border-gray-900 bg-gray-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{style.preview}</div>
                      <div className="font-medium text-gray-900 text-sm">
                        {style.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {style.description}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generatePrompt}
                  disabled={!formData.description || !formData.style || !formData.mood || isGenerating}
                  className={`saas-btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto ${
                    (!formData.description || !formData.style || !formData.mood || isGenerating)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <Palette className="h-5 w-5" />
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Generating with GPT-4...
                    </>
                  ) : (
                    'Generate Optimized Prompt'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;