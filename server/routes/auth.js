import express from 'express';
import passport from '../passport-config.js';
import { getXataClient } from '../database-init.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/login',
      failureMessage: true 
    })(req, res, (err) => {
      if (err) {
        console.error('❌ Passport authentication error:', err);
        // Still try to redirect even if there's a session error
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/?error=auth_failed`);
      }
      next();
    });
  },
  (req, res) => {
    try {
      console.log('🔍 OAuth callback - Session details:');
      console.log('🔍 Session ID:', req.sessionID);
      console.log('🔍 Session object:', req.session);
      console.log('🔍 Is authenticated:', req.isAuthenticated());
      console.log('🔍 User object:', req.user);
      
      // Successful authentication, redirect to frontend with a special flag
      // This helps the frontend know to clean up the browser history
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log('✅ OAuth success, redirecting to:', `${frontendUrl}/?auth=success`);
      res.redirect(`${frontendUrl}/?auth=success`);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/?error=callback_failed`);
    }
  }
);

// Get current user (for session-based auth)
router.get('/me', (req, res) => {
  console.log('🔍 Auth check requested');
  console.log('🔍 Session ID:', req.sessionID);
  console.log('🔍 Session:', req.session);
  console.log('🔍 Is authenticated:', req.isAuthenticated());
  console.log('🔍 User:', req.user);
  
  if (req.isAuthenticated()) {
    console.log('✅ User is authenticated:', req.user.email);
    res.json({ user: req.user });
  } else {
    console.log('❌ User not authenticated');
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