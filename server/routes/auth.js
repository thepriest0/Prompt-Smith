import express from 'express';
import passport from '../passport-config.js';
import { getXataClient } from '../database-init.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login',
    failureMessage: true 
  }),
  (req, res) => {
    try {
      // Successful authentication, redirect to frontend with a special flag
      // This helps the frontend know to clean up the browser history
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log('✅ OAuth success, redirecting to:', `${frontendUrl}/?auth=success`);
      res.redirect(`${frontendUrl}/?auth=success`);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      res.status(500).json({ error: 'Internal server error', message: 'OAuth callback failed' });
    }
  }
);

// Get current user (for session-based auth)
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

export default router;