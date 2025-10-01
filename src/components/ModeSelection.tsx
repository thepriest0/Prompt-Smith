import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  LogOut, 
  User,
  Monitor,
  Camera,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useAuth } from '../hooks/useHooks';
import type { AppMode } from '../App';

interface ModeSelectionProps {
  onModeSelect: (mode: AppMode) => void;
  onShowMyPrompts?: () => void;
  onLogout?: () => Promise<void>;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect, onShowMyPrompts, onLogout }) => {
  const { user } = useAuth();

  const modes = [
    {
      id: 'illustration' as AppMode,
      title: 'Illustration Generator',
      subtitle: 'For UI/UX Designers',
      description: 'AI-powered prompts for digital illustrations, icons, dashboard graphics, onboarding images, and UI assets.',
      icon: <Monitor className="h-8 w-8" />,
      features: [
        'AI-optimized UI/UX prompts',
        'Flat vector & 3D UI styles',
        'Isometric & gradient mesh',
        'Smart tool recommendations',
        'Professional usage steps'
      ],
      gradient: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'image' as AppMode,
      title: 'Image Generator',
      subtitle: 'For Creative Projects',
      description: 'AI-enhanced prompts for photorealistic images, artistic creations, cinematic scenes, and creative visuals.',
      icon: <Camera className="h-8 w-8" />,
      features: [
        'GPT-4.1 Mini enhanced prompts',
        'Photorealistic & cinematic',
        'Oil painting & anime styles',
        'Intelligent tool selection',
        'Step-by-step guidance'
      ],
      gradient: 'from-purple-600 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Enhanced Header */}
      <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white shadow-lg"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">PromptSmith Dashboard</h1>
                <p className="text-sm text-gray-300">Welcome back, {user?.name || 'User'}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="hidden sm:flex items-center gap-2 bg-gray-800 text-gray-200 px-3 py-1.5 rounded-full text-sm border border-gray-700">
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.name || 'User'}</span>
              </div>
              {onShowMyPrompts && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onShowMyPrompts}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">My Prompts</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your Creative Mode
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Select the mode that best fits your project needs. Each mode is optimized for different types of creative work.
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -8, 
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="group"
            >
              <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300">
                {/* Header */}
                <div className="text-center mb-6">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 bg-gradient-to-r ${mode.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}
                  >
                    {mode.icon}
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {mode.title}
                  </h3>
                  <div className="inline-block bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm font-medium mb-3">
                    {mode.subtitle}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {mode.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {mode.features.map((feature, featureIndex) => (
                    <motion.div 
                      key={featureIndex} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-2 h-2 bg-gradient-to-r ${mode.gradient} rounded-full`}></div>
                      <span className="text-gray-200">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onModeSelect(mode.id)}
                  className={`w-full bg-gradient-to-r ${mode.gradient} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2`}
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-xl"
        >
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-white mb-2">
              Not sure which mode to choose?
            </h4>
            <p className="text-gray-300">Here's a quick guide to help you decide:</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-blue-900/30 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <Monitor className="w-5 h-5 text-blue-400" />
                <div className="font-semibold text-white">Choose Illustration for:</div>
              </div>
              <ul className="space-y-2 text-gray-200">
                <li>• UI/UX design assets & interfaces</li>
                <li>• App icons & digital illustrations</li>
                <li>• Website graphics & landing pages</li>
                <li>• Digital product visuals & mockups</li>
              </ul>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <Camera className="w-5 h-5 text-purple-400" />
                <div className="font-semibold text-white">Choose Image for:</div>
              </div>
              <ul className="space-y-2 text-gray-200">
                <li>• Photorealistic images & portraits</li>
                <li>• Artistic creations & fine art</li>
                <li>• Marketing visuals & campaigns</li>
                <li>• Creative photography & scenes</li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ModeSelection;