import { useState } from 'react';
import { Wand2, Settings, Palette, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import type { GeneratedPrompt } from './ResultsPage';
import aiPromptService from '../services/aiPromptService';
import ImageUpload from './ImageUpload';
import { imageAnalysisService, type ImageAnalysis } from '../services/imageAnalysisService';

interface UploadedImage {
  url: string;
  publicId: string;
  analysis?: ImageAnalysis;
}

interface PromptGeneratorProps {
  mode: 'illustration' | 'image';
  onGenerate: (result: GeneratedPrompt) => void;
  onBack: () => void;
  onLogout?: () => Promise<void>;
}

interface Style {
  id: string;
  name: string;
  preview: string;
  description: string;
}

interface AspectRatio {
  id: string;
  name: string;
  ratio: string;
}

export default function PromptGenerator({ mode, onGenerate, onBack }: PromptGeneratorProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customColorInput, setCustomColorInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | undefined>(undefined);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [useImageStyle, setUseImageStyle] = useState(false);

  const renderStylePreview = (previewType: string) => {
    const baseClasses = "w-8 h-8 rounded-lg shadow-sm";
    
    switch (previewType) {
      case 'flat-vector':
        return (
          <div className={`${baseClasses} bg-blue-500 relative overflow-hidden border border-white/20`}>
            <div className="absolute inset-2 bg-white rounded-sm"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        );
      case 'isometric':
        return (
          <div className={`${baseClasses} bg-gray-300 relative border border-white/20`}>
            <div className="absolute bottom-1 left-1 w-5 h-3 bg-blue-500 transform skew-y-12"></div>
            <div className="absolute bottom-1 right-1 w-3 h-5 bg-blue-700 transform -skew-x-12"></div>
          </div>
        );
      case 'line-art':
        return (
          <div className={`${baseClasses} bg-white border-2 border-gray-700 relative`}>
            <div className="absolute inset-2 border border-gray-700 rounded"></div>
          </div>
        );
      case 'geometric':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-500 to-pink-500 relative border border-white/20`}>
            <div className="absolute top-1 left-1 w-3 h-3 bg-white transform rotate-45"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 bg-white rounded-full"></div>
          </div>
        );
      case 'gradient-mesh':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 border border-white/20`}>
          </div>
        );
      case 'duotone':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-blue-600 to-pink-500 relative border border-white/20`}>
            <div className="absolute inset-2 bg-gradient-to-br from-blue-600 to-pink-500 opacity-50 rounded"></div>
          </div>
        );
      case '3d-render':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-gray-400 to-gray-600 relative border border-white/20`} style={{ borderRadius: '20% 80% 60% 40% / 70% 30% 70% 30%' }}>
            <div className="absolute inset-1 bg-gradient-to-br from-gray-200 to-gray-400 shadow-inner" style={{ borderRadius: '20% 80% 60% 40% / 70% 30% 70% 30%' }}></div>
          </div>
        );
      case 'hand-drawn':
        return (
          <div className={`${baseClasses} bg-yellow-200 relative border border-white/20`}>
            <div className="absolute inset-1 border-2 border-gray-700 rounded-lg" style={{ borderStyle: 'dashed' }}></div>
            <div className="absolute top-2 left-2 w-1 h-1 bg-gray-700 rounded-full"></div>
          </div>
        );
      case 'material':
        return (
          <div className={`${baseClasses} bg-white shadow-lg relative border border-white/20`}>
            <div className="absolute inset-2 bg-blue-500 rounded shadow-md"></div>
          </div>
        );
      case 'glass':
        return (
          <div className={`${baseClasses} bg-white/30 backdrop-blur-sm border-2 border-white/50 relative`}>
            <div className="absolute inset-2 bg-white/20 rounded"></div>
          </div>
        );
      case 'neuro':
        return (
          <div className={`${baseClasses} bg-gray-300 relative border border-white/20`} style={{ boxShadow: '3px 3px 6px #bebebe, -3px -3px 6px #ffffff' }}>
            <div className="absolute inset-2 bg-gray-300 rounded" style={{ boxShadow: 'inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff' }}></div>
          </div>
        );
      case 'fluid':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden border border-white/20`} style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}>
            <div className="absolute inset-2 bg-white/30" style={{ borderRadius: '40% 60% 70% 30% / 40% 70% 30% 60%' }}></div>
          </div>
        );
      case 'photorealistic':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-blue-200 to-green-300 relative border border-white/20`}>
            <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-100 rounded shadow-inner"></div>
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
            <div className="absolute bottom-1 right-1 w-1 h-3 bg-green-600"></div>
          </div>
        );
      case 'cinematic':
        return (
          <div className={`${baseClasses} bg-black relative overflow-hidden border border-white/20`}>
            <div className="absolute inset-1 bg-gradient-to-r from-amber-900 via-orange-800 to-red-900"></div>
            <div className="absolute top-0 left-0 right-0 h-2 bg-black opacity-50"></div>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black opacity-50"></div>
          </div>
        );
      case 'anime':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-pink-300 to-purple-400 relative border border-white/20`}>
            <div className="absolute inset-2 bg-white rounded-full"></div>
            <div className="absolute top-2 left-3 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute top-2 right-3 w-1 h-1 bg-black rounded-full"></div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-pink-500 rounded-full"></div>
          </div>
        );
      case 'oil-painting':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-amber-800 via-yellow-700 to-red-800 relative border border-white/20`}>
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-orange-300 rounded opacity-80"></div>
            <div className="absolute top-1 left-1 w-3 h-2 bg-blue-600 rounded-sm opacity-70"></div>
            <div className="absolute bottom-1 right-1 w-2 h-3 bg-green-700 rounded-sm opacity-70"></div>
          </div>
        );
      case 'watercolor':
        return (
          <div className={`${baseClasses} bg-white relative overflow-hidden border border-white/20`}>
            <div className="absolute top-1 left-1 w-4 h-4 bg-blue-400 rounded-full opacity-30"></div>
            <div className="absolute top-2 right-2 w-3 h-3 bg-pink-400 rounded-full opacity-40"></div>
            <div className="absolute bottom-1 left-2 w-5 h-2 bg-yellow-400 rounded-full opacity-25"></div>
          </div>
        );
      case 'digital-art':
        return (
          <div className={`${baseClasses} bg-gradient-to-br from-purple-600 to-blue-600 relative border border-white/20`}>
            <div className="absolute inset-2 bg-gradient-to-br from-cyan-300 to-purple-300 rounded"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
            <div className="absolute bottom-2 left-2 w-3 h-1 bg-yellow-300 opacity-90"></div>
          </div>
        );
      default:
        return <span className="text-xl">🎨</span>;
    }
  };

  const illustrationStyles: Style[] = [
    { id: 'flat-vector', name: 'Flat Vector', preview: 'flat-vector', description: 'Clean geometric shapes' },
    { id: 'isometric', name: 'Isometric', preview: 'isometric', description: '3D perspective' },
    { id: 'line-art', name: 'Line Art', preview: 'line-art', description: 'Minimal outlines' },
    { id: 'geometric', name: 'Geometric', preview: 'geometric', description: 'Abstract shapes' },
    { id: 'gradient-mesh', name: 'Gradient', preview: 'gradient-mesh', description: 'Smooth transitions' },
    { id: 'duotone', name: 'Duotone', preview: 'duotone', description: 'Two-color scheme' },
    { id: '3d-render', name: '3D Render', preview: '3d-render', description: 'Realistic 3D' },
    { id: 'hand-drawn', name: 'Hand Drawn', preview: 'hand-drawn', description: 'Organic sketchy' },
    { id: 'material-design', name: 'Material', preview: 'material', description: 'Google Material' },
    { id: 'glassmorphism', name: 'Glass', preview: 'glass', description: 'Frosted glass' },
    { id: 'neumorphism', name: 'Neuro', preview: 'neuro', description: 'Soft extruded' },
    { id: 'abstract-fluid', name: 'Fluid', preview: 'fluid', description: 'Flowing organic' }
  ];

  const imageStyles: Style[] = [
    { id: 'photorealistic', name: 'Photorealistic', preview: 'photorealistic', description: 'Lifelike photography' },
    { id: 'cinematic', name: 'Cinematic', preview: 'cinematic', description: 'Movie-like composition' },
    { id: 'anime', name: 'Anime', preview: 'anime', description: 'Japanese animation' },
    { id: 'oil-painting', name: 'Oil Painting', preview: 'oil-painting', description: 'Traditional art' },
    { id: 'watercolor', name: 'Watercolor', preview: 'watercolor', description: 'Soft, flowing paint' },
    { id: 'digital-art', name: 'Digital Art', preview: 'digital-art', description: 'Modern digital artwork' }
  ];

  const aspectRatios: AspectRatio[] = [
    { id: '1:1', name: 'Square', ratio: '1:1' },
    { id: '16:9', name: 'Landscape', ratio: '16:9' },
    { id: '9:16', name: 'Portrait', ratio: '9:16' },
    { id: '4:3', name: 'Classic', ratio: '4:3' },
    { id: '3:2', name: 'Photo', ratio: '3:2' },
    { id: '21:9', name: 'Ultra Wide', ratio: '21:9' }
  ];

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6', hex: '#3B82F6' },
    { name: 'Red', value: '#EF4444', hex: '#EF4444' },
    { name: 'Green', value: '#10B981', hex: '#10B981' },
    { name: 'Purple', value: '#8B5CF6', hex: '#8B5CF6' },
    { name: 'Orange', value: '#F59E0B', hex: '#F59E0B' },
    { name: 'Pink', value: '#EC4899', hex: '#EC4899' },
    { name: 'Teal', value: '#14B8A6', hex: '#14B8A6' },
    { name: 'Gray', value: '#6B7280', hex: '#6B7280' },
    { name: 'Black', value: '#1F2937', hex: '#1F2937' },
    { name: 'White', value: '#F9FAFB', hex: '#F9FAFB' },
    { name: 'Yellow', value: '#FCD34D', hex: '#FCD34D' },
    { name: 'Cyan', value: '#06B6D4', hex: '#06B6D4' }
  ];

  const currentStyles = mode === 'illustration' ? illustrationStyles : imageStyles;

  // Image upload handlers
  const handleImageUploaded = async (image: { url: string; publicId: string }) => {
    setUploadedImage(image);
    setIsAnalyzingImage(true);
    
    try {
      const analysis = await imageAnalysisService.analyzeImage(image.url);
      setUploadedImage(prev => prev ? { ...prev, analysis } : undefined);
      
      // Auto-enable image style when analysis is complete
      setUseImageStyle(true);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageRemoved = () => {
    setUploadedImage(undefined);
    setUseImageStyle(false);
  };
  const modeIcon = mode === 'illustration' ? <Palette className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />;
  const modeTitle = mode === 'illustration' ? 'Illustration Generator' : 'Image Generator';

  const handleStyleToggle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleColorToggle = (colorName: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(name => name !== colorName);
      } else if (prev.length < 2) {
        return [...prev, colorName];
      } else {
        return [prev[1], colorName];
      }
    });
  };

  const isValidHexColor = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  };

  const handleCustomColorAdd = () => {
    const trimmedColor = customColorInput.trim();
    
    if (!isValidHexColor(trimmedColor)) {
      return;
    }

    if (selectedColors.length < 2 && !selectedColors.includes(trimmedColor)) {
      setSelectedColors(prev => [...prev, trimmedColor]);
      setCustomColorInput('');
    }
  };

  const handleCustomColorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomColorAdd();
    }
  };

  const generatePrompt = async () => {
    console.log('🚀 Generate button clicked!');
    console.log('📝 Custom prompt:', customPrompt);
    console.log('🎨 Mode:', mode);
    console.log('🎭 Selected styles:', selectedStyles);
    
    if (!customPrompt.trim() || isGenerating) {
      console.log('❌ Validation failed - empty prompt or already generating');
      return;
    }

    setIsGenerating(true);
    console.log('⏳ Starting generation process...');
    
    try {
      // Check if we should use image-based style generation
      if (useImageStyle && uploadedImage?.analysis) {
        console.log('🖼️ Using image-based style generation with AI');
        try {
          // Extract style information from image analysis
          const imageStyles = [];
          if (uploadedImage.analysis.style && uploadedImage.analysis.style !== 'Unknown') {
            imageStyles.push(uploadedImage.analysis.style.toLowerCase());
          }
          
          // Prioritize user-selected colors over image colors
          let finalColors: string[] = [];
          if (mode === 'illustration') {
            if (selectedColors.length > 0) {
              // User chose specific colors - use those and ignore image colors
              finalColors = selectedColors;
              console.log('🎨 Using user-selected colors (prioritized):', selectedColors);
            } else {
              // No user colors chosen - use image colors as suggestions
              const imageColors: string[] = uploadedImage.analysis.colors?.slice(0, 3).map(c => c.hex) || [];
              finalColors = imageColors;
              console.log('🎨 Using image-detected colors (fallback):', imageColors);
            }
          }
          
          // Use AI service with image-derived information
          console.log('🤖 Calling AI service with image-based data');
          const result = await aiPromptService.generatePrompt({
            description: `${customPrompt}, incorporating the visual style and mood from the uploaded reference image`,
            mode: mode,
            styles: [...selectedStyles, ...imageStyles],
            aspectRatio: selectedAspectRatio,
            colors: finalColors.length > 0 ? finalColors : undefined
          });
          
          console.log('✅ AI-powered image-based prompt generated:', result);
          onGenerate({
            ...result,
            originalDescription: customPrompt,
            mode: mode,
            style: `Image-inspired + ${selectedStyles.join(', ') || 'Mixed'}`,
            aspectRatio: selectedAspectRatio
          });
          return;
        } catch (error) {
          console.error('❌ Error generating AI image-based prompt:', error);
          // Fall through to regular generation
        }
      }

      // Use server-side AI generation
      console.log('🤖 Using server-side AI generation');
      const result = await aiPromptService.generatePrompt({
        description: customPrompt,
        mode: mode,
        styles: selectedStyles,
        aspectRatio: selectedAspectRatio,
        colors: mode === 'illustration' ? selectedColors : undefined
      });
      
      console.log('✅ Server-side AI generation successful:', result);
      onGenerate({
        ...result,
        originalDescription: customPrompt,
        mode: mode,
        style: selectedStyles.join(', ') || 'Mixed',
        aspectRatio: selectedAspectRatio
      });
    } catch (error) {
      console.error('❌ Error generating prompt:', error);
      
      // Final fallback in case of any errors
      const fallbackPrompt = `${customPrompt}, ${selectedAspectRatio} aspect ratio`;
      const recommendedTool = getSmartToolRecommendation(mode, selectedStyles, customPrompt);
      const instructions = getToolInstructions(recommendedTool, selectedAspectRatio, selectedColors);
      
      console.log('🔧 Using error fallback generation');
      onGenerate({
        prompt: fallbackPrompt,
        tool: recommendedTool,
        instructions: instructions,
        originalDescription: customPrompt,
        mode: mode,
        style: 'Mixed',
        aspectRatio: selectedAspectRatio
      });
    } finally {
      console.log('🏁 Generation process finished');
      setIsGenerating(false);
    }
  };

  const getSmartToolRecommendation = (mode: 'illustration' | 'image', styles: string[], description: string): string => {
    const desc = description.toLowerCase();
    const styleSet = new Set(styles);
    
    if (mode === 'illustration') {
      if (styleSet.has('isometric') || desc.includes('technical') || desc.includes('diagram') || desc.includes('blueprint')) {
        return 'Microsoft Copilot with DALL-E 3';
      }
      return 'ChatGPT with DALL-E 3';
    } else {
      if (styleSet.has('photorealistic') || desc.includes('photo') || desc.includes('realistic') || desc.includes('portrait')) {
        return 'Microsoft Copilot with DALL-E 3';
      }
      if (styleSet.has('cinematic') || desc.includes('cinematic') || desc.includes('dramatic') || desc.includes('movie')) {
        return 'ChatGPT with DALL-E 3';
      }
      if (styleSet.has('oil-painting') || styleSet.has('watercolor') || styleSet.has('anime')) {
        return 'ChatGPT with DALL-E 3';
      }
      return 'Microsoft Copilot with DALL-E 3';
    }
  };

  const getToolInstructions = (tool: string, aspectRatio: string, colors: string[]): string[] => {
    const colorGuidance = colors.length > 0 ? `Include color preferences: ${colors.join(', ')}` : 'Let AI choose appropriate colors';
    
    switch (tool) {
      case 'ChatGPT with DALL-E 3':
        return [
          'Go to ChatGPT (chat.openai.com) - it\'s free with account!',
          'Paste the prompt and ask DALL-E 3 to generate the image',
          `Specify "${aspectRatio} aspect ratio" in your request`,
          colorGuidance,
          'Download the result and refine with follow-up prompts if needed'
        ];
        
      case 'Microsoft Copilot with DALL-E 3':
        return [
          'Go to Microsoft Copilot (copilot.microsoft.com) - it\'s free!',
          'Paste the prompt and request image generation',
          `Ask for "${aspectRatio} aspect ratio" in your message`,
          colorGuidance,
          'Generate multiple variations and choose the best result'
        ];
        
      default:
        return [
          'Copy the prompt to your preferred AI image generator',
          `Set aspect ratio to ${aspectRatio}`,
          colorGuidance,
          'Generate and iterate as needed'
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      {/* Modern Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white hover:bg-white/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                  {modeIcon}
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-white">{modeTitle}</h1>
                  <p className="text-xs text-gray-400 hidden sm:block">Create professional prompts with AI</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">AI Ready</span>
                <span className="sm:hidden">AI</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Prompt Input Section - Full Width */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg">
                <Wand2 className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">Describe Your Vision</h2>
                <p className="text-gray-400 text-sm leading-relaxed">The more detailed your description, the better results you'll get from AI image generators</p>
              </div>
            </div>
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Describe your ${mode} in detail. Include style, mood, composition, colors, and any specific elements you want...`}
              className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-200 placeholder:text-gray-500 text-gray-200 resize-none text-sm sm:text-base leading-relaxed h-28 sm:h-32"
              rows={5}
            />
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span>AI enhancement available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Free tools prioritized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Professional output</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Aspect Ratio */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Settings className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white">Format</h3>
                <p className="text-xs text-gray-400">Aspect ratio</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedAspectRatio(ratio.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 text-center group ${
                    selectedAspectRatio === ratio.id
                      ? 'border-purple-500/50 bg-purple-500/10 text-white shadow-md transform scale-105'
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:scale-105'
                  }`}
                >
                  <div className={`mx-auto mb-3 border-2 transition-colors ${
                    selectedAspectRatio === ratio.id ? 'border-purple-400' : 'border-gray-500 group-hover:border-gray-400'
                  } ${
                    ratio.id === '1:1' ? 'w-8 h-8' :
                    ratio.id === '16:9' ? 'w-10 h-5' :
                    ratio.id === '9:16' ? 'w-5 h-10' :
                    ratio.id === '4:3' ? 'w-9 h-7' :
                    ratio.id === '3:2' ? 'w-9 h-6' :
                    ratio.id === '21:9' ? 'w-12 h-4' : 'w-8 h-8'
                  }`}></div>
                  <div className="text-sm font-medium mb-1">{ratio.name}</div>
                  <div className="text-xs text-gray-500">{ratio.ratio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="lg:col-span-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Palette className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">
                    {mode === 'illustration' ? 'Design Styles' : 'Art Styles'}
                  </h3>
                  <p className="text-xs text-gray-400">Mix and match for unique results</p>
                </div>
              </div>
              {uploadedImage && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useImageStyle}
                    onChange={(e) => setUseImageStyle(e.target.checked)}
                    className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">Use reference image style</span>
                </label>
              )}
            </div>
            
            {/* Image Upload Section */}
            <div className="mb-6">
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                onImageRemoved={handleImageRemoved}
                uploadedImage={uploadedImage}
                isAnalyzing={isAnalyzingImage}
              />
              
              {uploadedImage && uploadedImage.analysis && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-sm text-gray-300">
                    <strong>AI Analysis:</strong> {uploadedImage.analysis.caption}
                  </div>
                  {uploadedImage.analysis.style && (
                    <div className="text-xs text-gray-400 mt-1">
                      Style: {uploadedImage.analysis.style} • Mood: {uploadedImage.analysis.mood}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conditional rendering based on image style usage */}
            {(!uploadedImage || !useImageStyle) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleToggle(style.id)}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 group ${
                      selectedStyles.includes(style.id)
                        ? 'border-purple-500/50 bg-purple-500/10 text-white shadow-md'
                        : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {renderStylePreview(style.preview)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium mb-1">{style.name}</div>
                        <div className="text-xs text-gray-400 leading-relaxed">{style.description}</div>
                      </div>
                      {selectedStyles.includes(style.id) && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {useImageStyle && uploadedImage && (
              <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-white mb-2">Using Reference Image Style</h4>
                <p className="text-sm text-gray-400">
                  AI will analyze your reference image and generate a prompt to match its style
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Color Selection - Only for Illustration Mode */}
        {mode === 'illustration' && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <h3 className="text-base font-medium text-white">
                  Color Palette <span className="text-xs text-gray-400 font-normal">(max 2)</span>
                </h3>
                <p className="text-xs text-gray-400">Choose colors that match your brand</p>
              </div>
            </div>
            
            {selectedColors.length > 0 && (
              <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-sm font-medium text-gray-300 mb-2">Selected colors:</div>
                <div className="flex gap-2">
                  {selectedColors.map((color, index) => {
                    const colorOption = colorOptions.find(c => c.name === color);
                    const isCustomColor = !colorOption;
                    return (
                      <div key={`${color}-${index}`} className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded text-xs">
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: isCustomColor ? color : colorOption?.hex }}
                        ></div>
                        <span className="text-gray-200">{isCustomColor ? color : color}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  className={`p-3 rounded-lg border text-center transition-all duration-200 group ${
                    selectedColors.includes(color.name)
                      ? 'border-purple-500/50 bg-purple-500/10 text-white shadow-md transform scale-105'
                      : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-gray-300 hover:scale-105'
                  }`}
                  disabled={selectedColors.length >= 2 && !selectedColors.includes(color.name)}
                >
                  <div 
                    className={`w-8 h-8 rounded-lg mx-auto mb-2 border-2 shadow-sm transition-all ${
                      selectedColors.includes(color.name) ? 'border-purple-300' : 'border-white/30'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <div className="text-xs font-medium truncate">{color.name}</div>
                </button>
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="customColor" className="block text-xs font-medium text-gray-400 mb-2">
                  Custom hex color
                </label>
                <div className="relative">
                  <input
                    id="customColor"
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyPress={handleCustomColorKeyPress}
                    placeholder="#FF5733 or #f57"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-200 text-sm text-gray-200 placeholder:text-gray-500 pr-12"
                    disabled={selectedColors.length >= 2}
                  />
                  {customColorInput && isValidHexColor(customColorInput) && (
                    <div 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded border-2 border-white/30 shadow-sm"
                      style={{ backgroundColor: customColorInput }}
                    ></div>
                  )}
                </div>
              </div>
              <div className="sm:pt-6">
                <button
                  onClick={handleCustomColorAdd}
                  disabled={!customColorInput || !isValidHexColor(customColorInput) || selectedColors.length >= 2}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Add Color
                </button>
              </div>
            </div>
            
            {selectedColors.length === 0 && (
              <p className="text-xs text-gray-500 mt-3 text-center bg-white/5 py-2 px-3 rounded border border-white/10">
                Select up to 2 colors for your illustration. Leave empty for AI to choose optimal colors.
              </p>
            )}
          </div>
        )}

        {/* Generate Button Section */}
        <div className="mb-8">
          <button
            onClick={generatePrompt}
            disabled={!customPrompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base relative overflow-hidden group"
          >
            <div className="relative z-10 flex items-center justify-center gap-3">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating with AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                  <span>Generate {mode === 'illustration' ? 'Illustration' : 'Image'} Prompt</span>
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>

        {/* Pro Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <span className="text-base">💡</span>
              </div>
              <h3 className="text-lg font-medium text-white">Pro Tips</h3>
            </div>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-white mb-1">Be specific with details</div>
                  <div className="text-gray-400 leading-relaxed">Include composition, mood, lighting, and specific elements you want to see</div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <div className="font-medium text-white mb-1">Mix and match styles</div>
                  <div className="text-gray-400 leading-relaxed">Combine different styles for unique and creative results</div>
                </div>
              </div>
              {mode === 'illustration' && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-white mb-1">Use brand colors</div>
                    <div className="text-gray-400 leading-relaxed">Add custom hex codes to match your brand identity</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <span className="text-base">⚡</span>
              </div>
              <h3 className="text-lg font-medium text-white">AI Features</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-300">Smart prompt enhancement</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-300">Free tool recommendations</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                <span className="text-gray-300">Professional quality output</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}