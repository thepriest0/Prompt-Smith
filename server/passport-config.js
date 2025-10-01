import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getXataClient } from './database-init.js';

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔍 OAuth profile received:', { 
      id: profile.id, 
      email: profile.emails?.[0]?.value, 
      name: profile.displayName 
    });
    
    const xata = getXataClient();
    
    // Check if user already exists
    let user = await xata.db.users.filter({ email: profile.emails[0].value }).getFirst();
    
    if (user) {
      console.log('👤 Existing user found:', user.email);
      // Update last login
      user = await xata.db.users.update(user.id, {
        lastLogin: new Date(),
        name: profile.displayName || user.name
      });
    } else {
      console.log('➕ Creating new user:', profile.emails[0].value);
      // Create new user
      user = await xata.db.users.create({
        email: profile.emails[0].value,
        name: profile.displayName || 'Google User',
        lastLogin: new Date(),
        googleId: profile.id
      });
    }
    
    console.log('✅ User authenticated successfully:', user.email);
    return done(null, {
      id: user.id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const xata = getXataClient();
    const user = await xata.db.users.read(id);
    
    if (user) {
      done(null, {
        id: user.id,
        email: user.email,
        name: user.name
      });
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;