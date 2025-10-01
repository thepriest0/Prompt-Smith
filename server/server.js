import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// Load environment variables FIRST
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔍 Environment check:');
console.log('API Key loaded:', !!process.env.XATA_API_KEY);
console.log('Database URL loaded:', !!process.env.XATA_DATABASE_URL);
console.log('Google Client ID loaded:', !!process.env.GOOGLE_CLIENT_ID);
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

// Session configuration
const PgSession = connectPgSimple(session);

// Configure session store based on environment
let sessionStore;
if (process.env.NODE_ENV === 'production' && process.env.XATA_DATABASE_URL) {
  try {
    // For now, use memory store in production due to Xata connection issues
    // TODO: Set up a proper Redis or MongoDB session store for production scaling
    console.log('⚠️  Using memory store in production (temporary)');
    sessionStore = new session.MemoryStore();
  } catch (error) {
    console.error('❌ Failed to initialize session store:', error);
    console.log('🔄 Falling back to memory store');
    sessionStore = new session.MemoryStore();
  }
} else {
  // Use memory store in development
  sessionStore = new session.MemoryStore();
  console.log('📝 Using memory session store');
}

app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
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