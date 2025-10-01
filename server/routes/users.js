import express from 'express';
import { getXataClient } from '../database-init.js';

const router = express.Router();

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const xata = getXataClient();
    
    const user = await xata.db.users.read(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: user.id,
      email: user.email || '',
      name: user.name || '',
      lastLogin: user.lastLogin
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const xata = getXataClient();

    const updatedUser = await xata.db.users.update(id, {
      name,
      email
    });

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: updatedUser.id,
      email: updatedUser.email || '',
      name: updatedUser.name || ''
    };

    res.json({ user: userData, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;