import express from 'express';
import { getXataClient } from '../database-init.js';

const router = express.Router();

// Get prompts for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const xata = getXataClient();
    
    const prompts = await xata.db.prompts
      .filter({ userId })
      .sort('xata.createdAt', 'desc')
      .getMany();

    const formattedPrompts = prompts.map(prompt => ({
      id: prompt.id,
      title: prompt.title || 'Untitled',
      description: prompt.description || '',
      generatedPrompt: prompt.generatedPrompt || '',
      mode: prompt.mode || 'image',
      style: prompt.style || '',
      mood: prompt.mood || '',
      aspectRatio: prompt.aspectRatio || '1:1',
      tool: prompt.tool || '',
      isPublic: prompt.isPublic || false,
      likes: prompt.likes || 0,
      createdAt: prompt.xata.createdAt
    }));

    res.json(formattedPrompts);
  } catch (error) {
    console.error('Get prompts error:', error);
    res.status(500).json({ error: 'Failed to get prompts' });
  }
});

// Create a new prompt
router.post('/', async (req, res) => {
  try {
    const xata = getXataClient();
    const {
      userId,
      title,
      description,
      generatedPrompt,
      mode,
      style,
      mood,
      aspectRatio,
      tool,
      isPublic
    } = req.body;

    if (!userId || !title || !generatedPrompt) {
      return res.status(400).json({ error: 'userId, title, and generatedPrompt are required' });
    }

    const newPrompt = await xata.db.prompts.create({
      userId,
      title,
      description: description || '',
      generatedPrompt,
      mode: mode || 'image',
      style: style || '',
      mood: mood || '',
      aspectRatio: aspectRatio || '1:1',
      tool: tool || '',
      isPublic: isPublic || false,
      likes: 0
    });

    const promptData = {
      id: newPrompt.id,
      title: newPrompt.title,
      description: newPrompt.description,
      generatedPrompt: newPrompt.generatedPrompt,
      mode: newPrompt.mode,
      style: newPrompt.style,
      mood: newPrompt.mood,
      aspectRatio: newPrompt.aspectRatio,
      tool: newPrompt.tool,
      isPublic: newPrompt.isPublic,
      likes: newPrompt.likes,
      createdAt: newPrompt.xata.createdAt
    };

    res.status(201).json({ prompt: promptData, message: 'Prompt created successfully' });
  } catch (error) {
    console.error('Create prompt error:', error);
    res.status(500).json({ error: 'Failed to create prompt' });
  }
});

// Delete a prompt
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const xata = getXataClient();
    
    const deletedPrompt = await xata.db.prompts.delete(id);
    if (!deletedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Delete prompt error:', error);
    res.status(500).json({ error: 'Failed to delete prompt' });
  }
});

// Get public prompts
router.get('/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const xata = getXataClient();
    
    const publicPrompts = await xata.db.prompts
      .filter({ isPublic: true })
      .sort('likes', 'desc')
      .sort('xata.createdAt', 'desc')
      .getPaginated({ pagination: { size: limit } });

    const formattedPrompts = publicPrompts.records.map(prompt => ({
      id: prompt.id,
      title: prompt.title || 'Untitled',
      description: prompt.description || '',
      generatedPrompt: prompt.generatedPrompt || '',
      mode: prompt.mode || 'image',
      style: prompt.style || '',
      mood: prompt.mood || '',
      aspectRatio: prompt.aspectRatio || '1:1',
      tool: prompt.tool || '',
      isPublic: prompt.isPublic || false,
      likes: prompt.likes || 0,
      createdAt: prompt.xata.createdAt
    }));

    res.json(formattedPrompts);
  } catch (error) {
    console.error('Get public prompts error:', error);
    res.status(500).json({ error: 'Failed to get public prompts' });
  }
});

// Update prompt
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const xata = getXataClient();

    const updatedPrompt = await xata.db.prompts.update(id, updateData);
    if (!updatedPrompt) {
      return res.status(404).json({ error: 'Prompt not found' });
    }

    const promptData = {
      id: updatedPrompt.id,
      title: updatedPrompt.title,
      description: updatedPrompt.description,
      generatedPrompt: updatedPrompt.generatedPrompt,
      mode: updatedPrompt.mode,
      style: updatedPrompt.style,
      mood: updatedPrompt.mood,
      aspectRatio: updatedPrompt.aspectRatio,
      tool: updatedPrompt.tool,
      isPublic: updatedPrompt.isPublic,
      likes: updatedPrompt.likes,
      createdAt: updatedPrompt.xata.createdAt
    };

    res.json({ prompt: promptData, message: 'Prompt updated successfully' });
  } catch (error) {
    console.error('Update prompt error:', error);
    res.status(500).json({ error: 'Failed to update prompt' });
  }
});

export default router;