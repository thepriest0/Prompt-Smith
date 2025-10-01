import express from 'express';
import passport from '../passport-config.js';
import { getXataClient } from '../database-init.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  (req, res, next) => {
    // Use passport authenticate but with session: false to avoid session requirement
    passport.authenticate('google', { 
      session: false, // This is the key - disable session
      failureRedirect: '/login',
      failureMessage: true 
    })(req, res, (err) => {
      if (err) {
        console.error('❌ Passport authentication error:', err);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/?error=auth_failed`);
      }
      next();
    });
  },
  (req, res) => {
    try {
      console.log('🔍 OAuth callback - User authenticated:', req.user);
      
      if (!req.user) {
        console.error('❌ No user data received from OAuth');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/?error=no_user_data`);
      }
      
      // Create JWT token
      const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';
      const tokenPayload = {
        userId: req.user.id,
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name
        }
      };
      
      const token = jwt.sign(tokenPayload, JWT_SECRET, { 
        expiresIn: '24h' 
      });
      
      console.log('✅ JWT token created for user:', req.user.email);
      
      // Set JWT token as httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax', // Changed from 'none' to 'lax'
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
      
      // Successful authentication, redirect to frontend with a special flag
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

// Get current user (for JWT-based auth)
router.get('/me', (req, res) => {
  console.log('🔍 Auth check requested');
  console.log('🔍 Token present:', !!req.cookies?.token);
  console.log('🔍 Is authenticated:', req.isAuthenticated());
  console.log('🔍 User:', req.user);
  
  if (req.isAuthenticated() && req.user) {
    console.log('✅ User is authenticated:', req.user.email);
    res.json({ user: req.user });
  } else {
    console.log('❌ User not authenticated');
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  console.log('🔍 Logout requested for user:', req.user?.email);
  
  // Clear JWT token cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
    path: '/'
  });
  
  console.log('✅ JWT token cleared, user logged out');
  res.json({ message: 'Logout successful' });
});

export default router;