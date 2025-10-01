import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

interface PromptFromAPI {
  id: string;
  title: string;
  description: string;
  generatedPrompt: string;
  mode: 'illustration' | 'image';
  style: string;
  mood: string;
  aspectRatio: string;
  tool: string;
  isPublic: boolean;
  likes: number;
  createdAt: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  description: string;
  generatedPrompt: string;
  mode: 'illustration' | 'image';
  style: string;
  mood: string;
  aspectRatio: string;
  tool: string;
  isPublic: boolean;
  likes: number;
  createdAt: Date;
}

export const usePrompts = (userId?: string) => {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's prompts
  const fetchPrompts = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const userPrompts = await apiClient.getUserPrompts(userId);

      const formattedPrompts: SavedPrompt[] = userPrompts.map((prompt: PromptFromAPI) => ({
        id: prompt.id,
        title: prompt.title || 'Untitled',
        description: prompt.description || '',
        generatedPrompt: prompt.generatedPrompt || '',
        mode: (prompt.mode as 'illustration' | 'image') || 'image',
        style: prompt.style || '',
        mood: prompt.mood || '',
        aspectRatio: prompt.aspectRatio || '1:1',
        tool: prompt.tool || '',
        isPublic: prompt.isPublic || false,
        likes: prompt.likes || 0,
        createdAt: new Date(prompt.createdAt)
      }));

      setPrompts(formattedPrompts);
    } catch (err) {
      setError('Failed to fetch prompts');
      console.error('Error fetching prompts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Save a new prompt
  const savePrompt = async (promptData: {
    title: string;
    description: string;
    generatedPrompt: string;
    mode: 'illustration' | 'image';
    style: string;
    mood: string;
    aspectRatio: string;
    tool: string;
    isPublic?: boolean;
  }) => {
    if (!userId) {
      throw new Error('User must be logged in to save prompts');
    }

    setIsLoading(true);
    setError(null);
    try {
      const newPrompt = await apiClient.createPrompt({
        userId,
        title: promptData.title,
        description: promptData.description,
        generatedPrompt: promptData.generatedPrompt,
        mode: promptData.mode,
        style: promptData.style,
        mood: promptData.mood,
        aspectRatio: promptData.aspectRatio,
        tool: promptData.tool,
        isPublic: promptData.isPublic || false
      });

      // Add to local state
      const savedPrompt: SavedPrompt = {
        id: newPrompt.id,
        title: newPrompt.title,
        description: newPrompt.description,
        generatedPrompt: newPrompt.generatedPrompt,
        mode: newPrompt.mode as 'illustration' | 'image',
        style: newPrompt.style,
        mood: newPrompt.mood,
        aspectRatio: newPrompt.aspectRatio,
        tool: newPrompt.tool,
        isPublic: newPrompt.isPublic,
        likes: newPrompt.likes || 0,
        createdAt: new Date(newPrompt.createdAt)
      };

      setPrompts(prev => [savedPrompt, ...prev]);
      return savedPrompt;
    } catch (err) {
      setError('Failed to save prompt');
      console.error('Error saving prompt:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a prompt
  const deletePrompt = async (promptId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.deletePrompt(promptId);
      setPrompts(prev => prev.filter(p => p.id !== promptId));
    } catch (err) {
      setError('Failed to delete prompt');
      console.error('Error deleting prompt:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch public prompts
  const fetchPublicPrompts = async (limit = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const publicPrompts = await apiClient.getPublicPrompts(limit);

      const formattedPrompts: SavedPrompt[] = publicPrompts.map((prompt: PromptFromAPI) => ({
        id: prompt.id,
        title: prompt.title || 'Untitled',
        description: prompt.description || '',
        generatedPrompt: prompt.generatedPrompt || '',
        mode: (prompt.mode as 'illustration' | 'image') || 'image',
        style: prompt.style || '',
        mood: prompt.mood || '',
        aspectRatio: prompt.aspectRatio || '1:1',
        tool: prompt.tool || '',
        isPublic: prompt.isPublic || false,
        likes: prompt.likes || 0,
        createdAt: new Date(prompt.createdAt)
      }));

      return formattedPrompts;
    } catch (err) {
      setError('Failed to fetch public prompts');
      console.error('Error fetching public prompts:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    isLoading,
    error,
    savePrompt,
    deletePrompt,
    fetchPrompts,
    fetchPublicPrompts
  };
};