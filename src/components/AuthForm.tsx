import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Users, Zap, Shield } from 'lucide-react';
import GoogleSignIn from './GoogleSignIn';

interface AuthFormProps {
  onClose?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onClose }) => {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: "Generate art prompts"
    },
    {
      icon: <Users className="h-5 w-5" />,
      text: "Save & organize prompts"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Export for any AI tool"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "Free forever"
    }
  ];

  return (
    <div className="relative bg-white dark:bg-gray-900 overflow-hidden">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-4 top-4 md:right-6 md:top-6 z-50 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 opacity-60"></div>
      <div className="absolute top-6 left-6 w-12 h-12 bg-blue-200 dark:bg-blue-900/30 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 bg-purple-200 dark:bg-purple-900/30 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-green-200 dark:bg-green-900/30 rounded-full opacity-20 animate-pulse delay-500"></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-8 p-6 md:p-10">
        {/* Left Column - Content */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-6 shadow-lg">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Create Perfect Art Prompts
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
              Transform your ideas into detailed prompts for Midjourney, DALL-E, Stable Diffusion, and more.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Works with all AI tools</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No spam ever</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>100% free</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Sign In */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start Creating
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Join creators making stunning AI art
              </p>
            </div>

            {/* Google Sign-In Button */}
            <GoogleSignIn />

            {/* Legal */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 leading-relaxed">
              By continuing, you agree to our{' '}
              <button className="text-blue-600 dark:text-blue-400 hover:underline">Terms</button>
              {' '}and{' '}
              <button className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;