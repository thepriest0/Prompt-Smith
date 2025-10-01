import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

// Load environment variables FIRST
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check:');
console.log('API Key loaded:', !!process.env.XATA_API_KEY);
console.log('Database URL loaded:', !!process.env.XATA_DATABASE_URL);
console.log('Google Client ID loaded:', !!process.env.GOOGLE_CLIENT_ID);
console.log('JWT Secret loaded:', !!process.env.JWT_SECRET);
console.log('Port:', process.env.PORT || 3000);

// Now import and initialize Xata client after env vars are loaded
import { createXataClient } from './xata-client.js';
const xata = createXataClient();

// Import passport configuration
import passport from './passport-config.js';

// Import route handlers
import authRoutes from './routes/auth.js';
import promptRoutes from './routes/prompts.js';
import userRoutes from './routes/users.js';
import imageRoutes from './routes/images.js';
import aiPromptRoutes from './routes/ai-prompts.js';

// Import database initialization
import { initializeDatabase, createSampleData } from './database-init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Log startup info
console.log('🚀 Server starting up...');
console.log('📦 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 Port:', PORT);
console.log('🌐 CORS Origin:', process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL || 'same-origin') 
  : (process.env.FRONTEND_URL || 'http://localhost:5173')
);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || true  // Allow same-origin in production
    : process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// JWT middleware for parsing tokens
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token;
  
  console.log('🔍 JWT middleware - Token present:', !!token);
  
  if (!token) {
    req.isAuthenticated = () => false;
    req.user = null;
    return next();
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-here';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ JWT verified for user:', decoded.userId);
    
    // Set user info on request object
    req.user = decoded.user;
    req.isAuthenticated = () => true;
    next();
  } catch (error) {
    console.log('❌ JWT verification failed:', error.message);
    
    // Clear invalid token
    res.clearCookie('token');
    req.isAuthenticated = () => false;
    req.user = null;
    next();
  }
};

// Cookie parser middleware (required for JWT tokens)
app.use(cookieParser());

// Apply JWT middleware to all routes
app.use(authenticateToken);

// Middleware to require authentication for protected routes
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes (handle these before static files)
app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/ai-prompts', aiPromptRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Import here to avoid circular dependency issues
    const xata = (await import('./xata-client.js')).default;
    
    // Test database connection
    await xata.sql`SELECT 1 as health`;
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database unavailable'
    });
  }
});

// Serve static files from Vite build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Catch-all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Development route - redirect to Vite dev server
if (process.env.NODE_ENV === 'development') {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'API server running in development mode',
      note: 'Frontend is served by Vite dev server on port 5173'
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`🌐 Serving static files from /dist`);
  }
  
  // Initialize database
  console.log('🔄 Initializing database...');
  const dbInitialized = await initializeDatabase();
  
  if (dbInitialized) {
    // Optionally create sample data in development
    if (process.env.NODE_ENV === 'development') {
      await createSampleData();
    }
  } else {
    console.error('⚠️  Database initialization failed - some features may not work properly');
  }
});

export default app;