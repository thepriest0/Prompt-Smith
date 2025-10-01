import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, Copy, Eye, EyeOff, Palette } from 'lucide-react';
import { useAuth } from '../hooks/useHooks';
import { usePrompts, type SavedPrompt } from '../hooks/usePrompts';

interface MyPromptsPageProps {
  onBack: () => void;
}

const MyPromptsPage: React.FC<MyPromptsPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { prompts, isLoading, error, deletePrompt } = usePrompts(user?.id);
  const [selectedPrompt, setSelectedPrompt] = useState<SavedPrompt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      await deletePrompt(promptId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
          <p className="text-slate-400 mb-6">You need to be logged in to view your saved prompts.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-400 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white shadow-lg">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Saved Prompts</h1>
                <p className="text-sm text-slate-400">Manage your prompt collection</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300"
            >
              Try Again
            </button>
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Saved Prompts Yet</h3>
            <p className="text-slate-400 mb-6">Start generating and saving prompts to build your collection!</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Generate Your First Prompt
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{prompt.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{formatDate(prompt.createdAt)}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded-full border border-blue-800">
                        {prompt.mode}
                      </span>
                      <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded-full border border-purple-800">
                        {prompt.style}
                      </span>
                      <span className="px-2 py-1 bg-emerald-900 text-emerald-300 text-xs rounded-full border border-emerald-800">
                        {prompt.aspectRatio}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedPrompt(prompt)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(prompt.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 line-clamp-3">{prompt.description}</p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyPrompt(prompt.generatedPrompt)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button
                    onClick={() => setSelectedPrompt(prompt)}
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                  >
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* View Prompt Modal */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedPrompt.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-900 text-blue-300 text-sm rounded-full border border-blue-800">
                    {selectedPrompt.mode}
                  </span>
                  <span className="px-3 py-1 bg-purple-900 text-purple-300 text-sm rounded-full border border-purple-800">
                    {selectedPrompt.style}
                  </span>
                  <span className="px-3 py-1 bg-emerald-900 text-emerald-300 text-sm rounded-full border border-emerald-800">
                    {selectedPrompt.aspectRatio}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPrompt(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Description</h4>
                <p className="text-slate-300">{selectedPrompt.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Generated Prompt</h4>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-200 font-mono text-sm whitespace-pre-wrap">
                    {selectedPrompt.generatedPrompt}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleCopyPrompt(selectedPrompt.generatedPrompt)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Prompt
                </button>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-white mb-4">Delete Prompt</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this prompt? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeletePrompt(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 border border-slate-600 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyPromptsPage;