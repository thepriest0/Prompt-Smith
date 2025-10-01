import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Palette, Wand2, Target, Star } from 'lucide-react';
import AuthForm from './AuthForm';

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);

  // Animation variants for premium transitions
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  };

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  };

  const features = [
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: 'AI-Powered Generation',
      description: 'Transform simple ideas into detailed, professional illustration prompts using advanced AI algorithms.'
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: 'Art Style Library',
      description: 'Choose from 8+ artistic styles including digital art, concept art, fantasy, and photorealistic illustrations.'
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Tool Optimization',
      description: 'Get prompts optimized for DALL-E, Midjourney, Stable Diffusion, Leonardo AI, and other illustration tools.'
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Illustrator",
      content: "PromptSmith has revolutionized my illustration workflow. The AI-generated prompts create exactly the detailed concepts I need for my digital art.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Concept Artist",
      content: "The tool recommendations are perfect for illustration work. It knows exactly which platform works best for fantasy art, character design, and environments.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Freelance Illustrator",
      content: "Clean, professional interface with powerful features. Perfect for creating prompts for book illustrations, character art, and commercial projects.",
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Illustration Prompts Generated' },
    { value: '12K+', label: 'Digital Artists' },
    { value: '98%', label: 'Success Rate' },
    { value: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900">
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white">
                PromptSmith
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuth(true)}
                className="hidden sm:inline-flex text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-purple-900"></div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        ></motion.div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.6, -0.05, 0.01, 0.99] }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                className="inline-flex items-center px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-full text-sm font-medium text-blue-300 shadow-sm"
              >
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 500, damping: 15 }}
                  className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-md mr-3"
                >
                  NEW
                </motion.span>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                </motion.div>
                AI-powered illustration prompts
                <motion.span 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </motion.div>
              
              {/* Headline */}
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
              >
                <motion.span 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                  className="text-white block"
                >
                  How AI is Redefining
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent block"
                >
                  Illustration Creation.
                </motion.span>
              </motion.h1>
              
              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto px-4"
              >
                Transform your creative ideas into detailed, professional prompts optimized for any AI illustration and image generation tool. Create stunning digital art, concept art, and illustrations with precision.
              </motion.p>
              
              {/* CTA Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
              >
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)",
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuth(true)}
                  className="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-900 font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  Start for Free
                </motion.button>
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    backgroundColor: "rgba(31, 41, 55, 0.8)",
                    borderColor: "rgba(156, 163, 175, 0.8)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-transparent hover:bg-gray-800/50 text-white border border-gray-600/50 hover:border-gray-500 font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-lg backdrop-blur-sm flex items-center justify-center gap-2"
                >
                  <motion.span 
                    whileHover={{ scale: 1.2 }}
                    className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-1"
                  >
                    <span className="w-3 h-3 bg-white rounded-full"></span>
                  </motion.span>
                  See How it works
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Hero Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20"
          >
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 gap-8 sm:gap-12"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-default"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 200, damping: 10 }}
                  className="text-4xl sm:text-5xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300"
                >
                  4.9+
                </motion.div>
                <div className="text-gray-400 text-sm font-medium">Stars rating</div>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-default"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8, type: "spring", stiffness: 200, damping: 10 }}
                  className="text-4xl sm:text-5xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300"
                >
                  20k+
                </motion.div>
                <div className="text-gray-400 text-sm font-medium">Satisfied customers</div>
              </motion.div>
            </motion.div>
            
            {/* Best AI Tools Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 12 }}
              transition={{ delay: 2.0, type: "spring", stiffness: 200, damping: 10 }}
              whileHover={{ scale: 1.1, rotate: 15 }}
              className="absolute -right-4 sm:right-0 top-12 transform"
            >
              <motion.div 
                whileHover={{ boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-bold">✓</span>
                  </motion.div>
                  <div>
                    <div className="text-white text-xs font-bold">BEST ILLUSTRATION TOOLS</div>
                    <div className="text-gray-400 text-xs">Top-rated AI kit for digital artists</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Bottom Section with Trust Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="relative pt-16 sm:pt-20 pb-8"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60"
            >
              {[
                { name: "Midjourney", icon: "M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" },
                { name: "DALL-E", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" },
                { name: "Stable Diffusion", icon: "M12 2L2 7V17L12 22L22 17V7L12 2Z" },
                { name: "Leonardo", icon: "M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" }
              ].map((tool) => (
                <motion.div
                  key={tool.name}
                  variants={fadeInScale}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                  className="flex items-center gap-2 text-gray-400 text-sm cursor-default transition-all duration-300"
                >
                  <motion.div 
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-6 h-6 opacity-50"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d={tool.icon}/>
                    </svg>
                  </motion.div>
                  <span>{tool.name}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 sm:py-20 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
                className="text-center group cursor-default"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    delay: index * 0.1 + 0.3, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10 
                  }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white group-hover:text-blue-400 transition-all duration-300"
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  viewport={{ once: true }}
                  className="text-gray-400 mt-2 font-medium"
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 sm:py-20 lg:py-24 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              Everything you need for illustration creation
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              Professional-grade features designed for digital artists, illustrators, and creators who demand the best results from their AI illustration workflow.
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                className="group bg-gray-800/70 backdrop-blur-sm hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 cursor-default"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: 5,
                    boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6"
                >
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </motion.div>
                <motion.h3 
                  className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300"
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300"
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How it Works */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 sm:py-20 lg:py-24 bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              How it works
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              Get professional results in three simple steps
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                step: '01',
                title: 'Describe Your Illustration',
                description: 'Tell us what artwork you want to create - characters, scenes, concepts, or any visual idea'
              },
              {
                step: '02',
                title: 'Choose Art Style & Settings',
                description: 'Select illustration style, mood, colors, composition, and artistic preferences'
              },
              {
                step: '03',
                title: 'Generate & Create Art',
                description: 'Get your optimized illustration prompt and AI tool recommendations for best results'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={slideInLeft}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group cursor-default"
              >
                <div className="relative mb-6">
                  <motion.div 
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 5,
                      boxShadow: "0 15px 30px rgba(59, 130, 246, 0.4)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300"
                  >
                    {step.step}
                  </motion.div>
                  {index < 2 && (
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                      viewport={{ once: true }}
                      className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-400/50 to-purple-400/50 origin-left"
                    ></motion.div>
                  )}
                </div>
                <motion.h3 
                  className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300"
                >
                  {step.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300"
                >
                  {step.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 sm:py-20 lg:py-24 bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 lg:mb-20"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6"
            >
              Trusted by digital artists worldwide
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
            >
              See what professional illustrators and digital artists are saying about PromptSmith
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  scale: 1.02, 
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  transition: { type: "spring", stiffness: 300, damping: 15 }
                }}
                className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600/50 rounded-2xl p-6 lg:p-8 transition-all duration-300 cursor-default group"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex items-center mb-4"
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.1 * index + 0.1 * i, duration: 0.3 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      <Star className="h-5 w-5 text-amber-400 fill-current" />
                    </motion.div>
                  ))}
                </motion.div>
                <motion.p 
                  className="text-gray-300 leading-relaxed mb-6 text-base sm:text-lg group-hover:text-gray-200 transition-colors duration-300"
                >
                  "{testimonial.content}"
                </motion.p>
                <motion.div 
                  className="border-t border-gray-700 pt-4"
                >
                  <motion.div 
                    className="font-bold text-white text-base group-hover:text-blue-300 transition-colors duration-300"
                  >
                    {testimonial.name}
                  </motion.div>
                  <motion.div 
                    className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors duration-300"
                  >
                    {testimonial.role}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.5'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-3xl"
        ></motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl"
        ></motion.div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
          >
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight"
            >
              Ready to create amazing illustrations?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              viewport={{ once: true }}
              className="text-lg sm:text-xl lg:text-2xl text-gray-200 leading-relaxed"
            >
              Join thousands of digital artists and illustrators who are already using PromptSmith to enhance their AI illustration workflow.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(255, 255, 255, 0.2)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAuth(true)}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 text-lg"
              >
                Get Started Free
              </motion.button>
              <motion.button 
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 hover:border-white/30 font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-lg"
              >
                Learn More
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-12 bg-gray-900 border-t border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3"
            >
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-white">
                PromptSmith
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-gray-400 text-sm"
            >
              © 2025 PromptSmith. All rights reserved.
            </motion.div>
          </motion.div>
        </div>
      </motion.footer>

      {/* Auth Modal */}
      {showAuth && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowAuth(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 100, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 100, rotateX: -15 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.6 
            }}
            className="bg-gray-900 dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-700/20 dark:border-gray-700/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%), rgb(17, 24, 39)',
              transformStyle: 'preserve-3d',
            }}
            onClick={(e) => {
              // Prevent closing when clicking inside the modal
              e.stopPropagation();
            }}
          >
            <AuthForm onClose={() => setShowAuth(false)} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;